import axios from 'axios';
import { logger } from '../utils/logger.js';
import { ApiError } from '../middleware/errorHandler.js';
import { getPesapalIpnUrl } from '../utils/publicUrls.js';

// Read lazily, not at module scope: scripts call dotenv.config() after their
// imports have already been evaluated, so anything captured here would be empty.
// Production by default — sandbox only when PESAPAL_ENV=sandbox is set.
const getBaseUrl = () => process.env.PESAPAL_BASE_URL || (
    process.env.PESAPAL_ENV === 'sandbox'
        ? 'https://cybqa.pesapal.com/pesapalv3'
        : 'https://pay.pesapal.com/v3'
);
const getConsumerKey = () => process.env.PESAPAL_CONSUMER_KEY || '';
const getConsumerSecret = () => process.env.PESAPAL_CONSUMER_SECRET || '';

interface AuthResponse {
    token: string;
    expiryDate: string;
    status: string;
}

export interface IPNRegistrationResponse {
    ipn_id: string;
    url: string;
    created_date: string;
    ipn_notification_type?: string;
    notification_type?: number;
    ipn_notification_type_description?: string;
    ipn_status?: number;
    /** PesaPal spells this field "decription" in its responses. */
    ipn_status_decription?: string;
    status: string;
    error?: unknown;
}

/**
 * PesaPal bills a subscription only when account_number is present;
 * subscription_details on its own is not enough. The donor still has to accept
 * the enrolment on PesaPal's own page, and can cancel it there at any time.
 */
export interface SubscriptionDetails {
    /** dd-MM-yyyy */
    start_date: string;
    /** dd-MM-yyyy */
    end_date: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

interface OrderRequest {
    id: string;
    currency: string;
    amount: number;
    description: string;
    callback_url: string;
    notification_id: string;
    /** Identifies the payer's account; required for recurring billing. */
    account_number?: string;
    subscription_details?: SubscriptionDetails;
    billing_address: {
        email_address: string;
        phone_number?: string;
        country_code?: string;
        first_name?: string;
        last_name?: string;
    };
}

/** PesaPal expects dd-MM-yyyy, not ISO. */
export const formatPesapalDate = (date: Date): string => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${date.getFullYear()}`;
};

interface OrderResponse {
    order_tracking_id: string;
    merchant_reference: string;
    redirect_url: string;
    status: string;
}

/**
 * PesaPal v3 payment outcomes. `status_code` is authoritative;
 * `payment_status_description` carries the same value as text but its casing
 * is not guaranteed, so never match it case-sensitively.
 * 0 INVALID · 1 COMPLETED · 2 FAILED · 3 REVERSED
 */
export type PesapalOutcome = 'invalid' | 'completed' | 'failed' | 'reversed' | 'unknown';

export const mapPesapalOutcome = (statusResponse: any): PesapalOutcome => {
    switch (Number(statusResponse?.status_code)) {
        case 0: return 'invalid';
        case 1: return 'completed';
        case 2: return 'failed';
        case 3: return 'reversed';
    }

    // Fall back to the text field when status_code is absent or unrecognised.
    const description = String(statusResponse?.payment_status_description ?? '').trim().toLowerCase();
    if (description === 'completed') return 'completed';
    if (description === 'failed') return 'failed';
    if (description === 'invalid') return 'invalid';
    if (description === 'reversed') return 'reversed';

    return 'unknown';
};

export class PesapalService {
    private static accessToken: string | null = null;
    private static tokenExpiry: Date | null = null;
    private static ipnIdCache: { url: string; ipnId: string } | null = null;

    private static async getAccessToken(): Promise<string> {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        if (!getConsumerKey() || !getConsumerSecret()) {
            throw new ApiError(
                'PesaPal is not configured: PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET must be set',
                500
            );
        }

        try {
            const response = await axios.post<AuthResponse>(`${getBaseUrl()}/api/Auth/RequestToken`, {
                consumer_key: getConsumerKey(),
                consumer_secret: getConsumerSecret(),
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
            logger.error('PesaPal Auth Error', { msg, url: getBaseUrl(), data: error.response?.data });
            console.error('PESAPAL TOKEN ERROR:', { msg, details: error.response?.data });
            throw new ApiError(`PesaPal authentication failed: ${msg}`, 500);
        }
    }

    public static async registerIPN(callbackUrl: string): Promise<string> {
        try {
            const token = await this.getAccessToken();
            const response = await axios.post<IPNRegistrationResponse>(
                `${getBaseUrl()}/api/URLSetup/RegisterIPN`,
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
                `${getBaseUrl()}/api/URLSetup/GetIPNList`,
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

    /**
     * Returns the ipn_id for this service's own IPN URL, registering it if
     * PesaPal does not have it yet.
     *
     * PesaPal only notifies the URL tied to the ipn_id sent as an order's
     * notification_id, so that URL has to be this API's host. Picking an
     * arbitrary registered IPN (e.g. the first in the list) silently sends
     * callbacks to whatever host was registered first, which may be a stale
     * domain or the frontend — in both cases the payment is never confirmed.
     */
    public static async ensureIPN(): Promise<string> {
        const expectedUrl = getPesapalIpnUrl();

        if (this.ipnIdCache?.url === expectedUrl) {
            return this.ipnIdCache.ipnId;
        }

        const normalise = (url: string) => url.trim().replace(/\/+$/, '').toLowerCase();
        const ipns = await this.listIPNs();
        const match = ipns.find(ipn => normalise(ipn.url) === normalise(expectedUrl));

        if (match) {
            // Honour an explicit override only when it really is this URL's IPN.
            const override = process.env.PESAPAL_IPN_ID;
            if (override && override !== match.ipn_id) {
                logger.warn('PESAPAL_IPN_ID does not match the IPN registered for this host; ignoring it', {
                    configured: override,
                    using: match.ipn_id,
                    url: expectedUrl,
                });
            }
            this.ipnIdCache = { url: expectedUrl, ipnId: match.ipn_id };
            return match.ipn_id;
        }

        logger.info('Registering PesaPal IPN for this host', { url: expectedUrl });
        const ipnId = await this.registerIPN(expectedUrl);
        this.ipnIdCache = { url: expectedUrl, ipnId };
        return ipnId;
    }

    public static async submitOrder(orderData: OrderRequest): Promise<OrderResponse> {
        try {
            const token = await this.getAccessToken();
            logger.info('PesaPal SubmitOrder payload', { ...orderData, notification_id: orderData.notification_id });

            const response = await axios.post<OrderResponse>(
                `${getBaseUrl()}/api/Transactions/SubmitOrderRequest`,
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
                url: getBaseUrl(),
            });
            console.error('PESAPAL ORDER ERROR:', { msg, status: error.response?.status, data: error.response?.data });
            throw new ApiError(`PesaPal payment failed: ${msg}`, 500);
        }
    }

    public static async getTransactionStatus(orderTrackingId: string): Promise<any> {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get(
                `${getBaseUrl()}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
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
