import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { query } from '../db/connection.js';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  raised_amount: number;
  start_date?: string;
  end_date?: string;
  earmark?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  priority?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CampaignFilters {
  status?: string;
  limit: number;
  offset: number;
}

export const getCampaigns = async (filters: CampaignFilters): Promise<Campaign[]> => {
  try {
    let sql = 'SELECT * FROM campaigns WHERE is_deleted = FALSE';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    sql += ` ORDER BY priority DESC, created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(filters.limit, filters.offset);

    const result = await query<Campaign>(sql, params);
    return result.rows;
  } catch (error) {
    logger.error('Error fetching campaigns', error);
    throw new ApiError('Failed to fetch campaigns', 500);
  }
};

export const getCampaign = async (id: string): Promise<Campaign & { donors_count: number }> => {
  try {
    const result = await query<Campaign>(
      `SELECT c.*,
        (SELECT COUNT(DISTINCT email) FROM donations WHERE campaign_id = c.id AND status = 'succeeded' AND is_deleted = FALSE) as donors_count
       FROM campaigns c WHERE c.id = $1 AND c.is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError('Campaign not found', 404);
    }

    return result.rows[0] as Campaign & { donors_count: number };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error fetching campaign', error);
    throw new ApiError('Failed to fetch campaign', 500);
  }
};

export const getCampaignImpact = async (id: string) => {
  try {
    // Get total funds raised
    const fundsResult = await query<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM donations 
       WHERE campaign_id = $1 AND status = 'succeeded' AND is_deleted = FALSE`,
      [id]
    );

    // Get number of beneficiaries served through disbursements
    const beneficiariesResult = await query<{ count: number }>(
      `SELECT COUNT(DISTINCT beneficiary_id) as count
       FROM disbursements d
       JOIN wallets w ON d.wallet_id = w.id
       WHERE w.owner_type = 'campaign' AND w.owner_id = $1 
       AND d.status = 'executed' AND d.is_deleted = FALSE`,
      [id]
    );

    // Get recent disbursements
    const disbursementsResult = await query(
      `SELECT d.*, b.pseudo_id as beneficiary_pseudo_id
       FROM disbursements d
       JOIN wallets w ON d.wallet_id = w.id
       LEFT JOIN beneficiaries b ON d.beneficiary_id = b.id
       WHERE w.owner_type = 'campaign' AND w.owner_id = $1
       AND d.is_deleted = FALSE
       ORDER BY d.created_at DESC
       LIMIT 10`,
      [id]
    );

    return {
      fundsRaised: parseFloat(`${fundsResult.rows[0]?.total || 0}`),
      beneficiariesServed: parseInt(`${beneficiariesResult.rows[0]?.count || 0}`),
      disbursements: disbursementsResult.rows,
    };
  } catch (error) {
    logger.error('Error calculating campaign impact', error);
    throw new ApiError('Failed to calculate impact', 500);
  }
};

export const createCampaign = async (data: any, userId: string): Promise<Campaign> => {
  try {
    const result = await query<Campaign>(
      `INSERT INTO campaigns (
        title, description, goal_amount, start_date, end_date, 
        earmark, status, image_url, category, created_by, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        data.title,
        data.description,
        data.goal_amount,
        data.start_date || null,
        data.end_date || null,
        data.earmark || null,
        data.status || 'draft',
        data.image_url || null,
        data.category || null,
        userId,
        data.priority || 0
      ]
    );

    // Create wallet for campaign
    await query(
      `INSERT INTO wallets (owner_type, owner_id, balance, currency)
       VALUES ('campaign', $1, 0, 'USD')`,
      [result.rows[0].id]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Error creating campaign', error);
    throw new ApiError('Failed to create campaign', 500);
  }
};

export const updateCampaign = async (id: string, data: any, userId: string): Promise<Campaign> => {
  try {
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      params.push(data.description);
    }
    if (data.goal_amount !== undefined) {
      updates.push(`goal_amount = $${paramCount++}`);
      params.push(data.goal_amount);
    }
    if (data.start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      params.push(data.start_date || null);
    }
    if (data.end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      params.push(data.end_date || null);
    }
    if (data.earmark !== undefined) {
      updates.push(`earmark = $${paramCount++}`);
      params.push(data.earmark || null);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      params.push(data.status);
    }
    if (data.image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      params.push(data.image_url || null);
    }
    if (data.category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      params.push(data.category || null);
    }
    if (data.priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      params.push(data.priority);
    }

    if (updates.length === 0) {
      return await getCampaign(id);
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await query<Campaign>(
      `UPDATE campaigns 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount} AND is_deleted = FALSE
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new ApiError('Campaign not found', 404);
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error updating campaign', error);
    throw new ApiError('Failed to update campaign', 500);
  }
};

export const deleteCampaign = async (id: string, userId: string): Promise<void> => {
  try {
    const result = await query(
      `UPDATE campaigns 
       SET is_deleted = TRUE, updated_at = NOW()
       WHERE id = $1 AND is_deleted = FALSE
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError('Campaign not found', 404);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error deleting campaign', error);
    throw new ApiError('Failed to delete campaign', 500);
  }
};

