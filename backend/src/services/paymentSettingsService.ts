import { query } from '../db/connection.js';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export interface PaymentSetting {
    key: string;
    value: any;
    updated_at: string;
}

export const getPaymentSettings = async (): Promise<Record<string, any>> => {
    try {
        const result = await query<PaymentSetting>('SELECT * FROM payment_settings');

        // Convert array to object { key: value }
        const settings: Record<string, any> = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });

        return settings;
    } catch (error) {
        logger.error('Error fetching payment settings', error);
        throw new ApiError('Failed to fetch payment settings', 500);
    }
};

export const updatePaymentSetting = async (key: string, value: any): Promise<PaymentSetting> => {
    try {
        const result = await query<PaymentSetting>(
            `INSERT INTO payment_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE 
       SET value = $2, updated_at = NOW()
       RETURNING *`,
            [key, value]
        );

        return result.rows[0];
    } catch (error) {
        logger.error(`Error updating payment setting ${key}`, error);
        throw new ApiError('Failed to update payment setting', 500);
    }
};
