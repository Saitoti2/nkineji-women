import axios from 'axios';
import { logger } from '../utils/logger.js';
import { ApiError } from '../middleware/errorHandler.js';

// Use production by default — sandbox only when PESAPAL_ENV=sandbox is explicitly set
const PESAPAL_BASE_URL = process.env.PESAPAL_BASE_URL || (
    process.env.PESAPAL_ENV === 'sandbox'
        ? 'https://cybqa.pesapal.com/pesapalv3'
        : 'https://pay.pesapal.com/v3'
);
const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET || '';

interface AuthResponse {
    token: string;
    expiryDate: string;
    status: string;
}

interface IPNRegistrationResponse {
    ipn_id: string;
    url: string;
    created_date: string;
    ipn_notification_type: string;
    status: string;
}

interface OrderRequest {
    id: string;
    currency: string;
    amount: number;
    description: string;
    callback_url: string;
    notification_id: string;
    billing_address: {
        email_address: string;
        phone_number?: string;
        country_code?: string;
        first_name?: string;
        last_name?: string;
    };
}

interface OrderResponse {
    order_tracking_id: string;
    merchant_reference: string;
    redirect_url: string;
    status: string;
}

export class PesapalService {
    private static accessToken: string | null = null;
    private static tokenExpiry: Date | null = null;

    private static async getAccessToken(): Promise<string> {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const response = await axios.post<AuthResponse>(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
                consumer_key: CONSUMER_KEY,
                consumer_secret: CONSUMER_SECRET,
            });

            if (response.status === 200 && response.data.token) {
                this.accessToken = response.data.token;
                this.tokenExpiry = new Date(response.data.expiryDate);
                return this.accessToken;
            } else {
                throw new Error(`Failed to get PesaPal access token: ${JSON.stringify(response.data)}`);
            }
        } catch (error: any) {
            const msg = error.response?.data?.error?.message
                || error.response?.data?.message
                || error.message
                || 'Authentication failed';
            logger.error('PesaPal Auth Error', { msg, url: PESAPAL_BASE_URL, data: error.response?.data });
            console.error('PESAPAL TOKEN ERROR:', { msg, details: error.response?.data });
            throw new ApiError(`PesaPal authentication failed: ${msg}`, 500);
        }
    }

    public static async registerIPN(callbackUrl: string): Promise<string> {
        try {
            const token = await this.getAccessToken();
            const response = await axios.post<IPNRegistrationResponse>(
                `${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`,
                {
                    url: callbackUrl,
                    ipn_notification_type: 'GET',
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return response.data.ipn_id;
        } catch (error) {
            logger.error('PesaPal IPN Registration Error', error);
            throw new ApiError('Failed to register PesaPal IPN', 500);
        }
    }

    public static async listIPNs(): Promise<IPNRegistrationResponse[]> {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get<IPNRegistrationResponse[]>(
                `${PESAPAL_BASE_URL}/api/URLSetup/GetIPNList`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        } catch (error) {
            logger.error('PesaPal Get IPN List Error', error);
            throw new ApiError('Failed to fetch PesaPal IPN list', 500);
        }
    }

    public static async submitOrder(orderData: OrderRequest): Promise<OrderResponse> {
        try {
            const token = await this.getAccessToken();
            logger.info('PesaPal SubmitOrder payload', { ...orderData, notification_id: orderData.notification_id });

            const response = await axios.post<OrderResponse>(
                `${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`,
                orderData,
                {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                }
            );

            logger.info('PesaPal SubmitOrder response', response.data);

            // PesaPal returns status '200' (string) on success
            if (response.data.redirect_url) {
                return response.data;
            } else {
                const errMsg = (response.data as any).error?.message
                    || (response.data as any).message
                    || `Unexpected response: ${JSON.stringify(response.data)}`;
                throw new Error(errMsg);
            }
        } catch (error: any) {
            const msg = error.response?.data?.error?.message
                || error.response?.data?.message
                || error.message
                || 'Unknown PesaPal error';
            logger.error('PesaPal Submit Order Error', {
                msg,
                status: error.response?.status,
                data: error.response?.data,
                url: PESAPAL_BASE_URL,
            });
            console.error('PESAPAL ORDER ERROR:', { msg, status: error.response?.status, data: error.response?.data });
            throw new ApiError(`PesaPal payment failed: ${msg}`, 500);
        }
    }

    public static async getTransactionStatus(orderTrackingId: string): Promise<any> {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get(
                `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            logger.error('PesaPal Get Transaction Status Error', {
                message: errorMsg,
                data: error.response?.data,
                status: error.response?.status
            });
            throw new ApiError(`Failed to fetch PesaPal transaction status: ${errorMsg}`, 500);
        }
    }
}
