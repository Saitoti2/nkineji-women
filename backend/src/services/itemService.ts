import { query } from '../db/connection.js';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export interface CampaignItem {
    id: string;
    campaign_id?: string;
    name: string;
    description?: string;
    image_url?: string;
    unit_price: number;
    currency: string;
    is_active: boolean;
    priority?: number;
    created_at: string;
    updated_at: string;
}

export const getItems = async (filters: { activeOnly?: boolean; campaignId?: string } = {}): Promise<CampaignItem[]> => {
    try {
        let sql = 'SELECT * FROM campaign_items WHERE is_deleted = FALSE';
        const params: any[] = [];
        let paramCount = 1;

        if (filters.activeOnly) {
            sql += ` AND is_active = $${paramCount++}`;
            params.push(true);
        }

        if (filters.campaignId) {
            sql += ` AND (campaign_id = $${paramCount++} OR campaign_id IS NULL)`;
            params.push(filters.campaignId);
        }

        sql += ' ORDER BY priority DESC, created_at DESC';

        const result = await query<CampaignItem>(sql, params);
        return result.rows;
    } catch (error) {
        logger.error('Error fetching items', error);
        throw new ApiError('Failed to fetch items', 500);
    }
};

export const createItem = async (data: Partial<CampaignItem>, userId: string): Promise<CampaignItem> => {
    try {
        const result = await query<CampaignItem>(
            `INSERT INTO campaign_items (
        name, description, image_url, unit_price, campaign_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
            [
                data.name,
                data.description,
                data.image_url,
                data.unit_price,
                data.campaign_id || null,
                userId
            ]
        );
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating item', error);
        throw new ApiError('Failed to create item', 500);
    }
};

export const updateItem = async (id: string, data: Partial<CampaignItem>): Promise<CampaignItem> => {
    try {
        const updates: string[] = ['updated_at = NOW()'];
        const params: any[] = [id];
        let paramCount = 2;

        if (data.name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            params.push(data.name);
        }
        if (data.description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            params.push(data.description);
        }
        if (data.image_url !== undefined) {
            updates.push(`image_url = $${paramCount++}`);
            params.push(data.image_url);
        }
        if (data.unit_price !== undefined) {
            updates.push(`unit_price = $${paramCount++}`);
            params.push(data.unit_price);
        }
        if (data.is_active !== undefined) {
            updates.push(`is_active = $${paramCount++}`);
            params.push(data.is_active);
        }
        if (data.priority !== undefined) {
            updates.push(`priority = $${paramCount++}`);
            params.push(data.priority);
        }

        const result = await query<CampaignItem>(
            `UPDATE campaign_items 
       SET ${updates.join(', ')}
       WHERE id = $1
       RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            throw new ApiError('Item not found', 404);
        }

        return result.rows[0];
    } catch (error) {
        logger.error('Error updating item', error);
        throw new ApiError('Failed to update item', 500);
    }
};

export const deleteItem = async (id: string): Promise<boolean> => {
    try {
        const result = await query(
            'UPDATE campaign_items SET is_deleted = TRUE, is_active = FALSE WHERE id = $1',
            [id]
        );
        if (result.rowCount === 0) {
            throw new ApiError('Item not found', 404);
        }
        return true;
    } catch (error) {
        logger.error('Error deleting item', error);
        throw new ApiError('Failed to delete item', 500);
    }
};
