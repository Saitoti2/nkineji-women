import { Request } from 'express';
import Stripe from 'stripe';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { query } from '../db/connection.js';

export interface Donation {
  id: string;
  donor_id?: string;
  amount: number;
  currency: string;
  campaign_id?: string;
  payment_method: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  receipt_url?: string;
  metadata?: Record<string, any>;
  payment_provider_id?: string;
  created_at: string;
  updated_at: string;
}

export const createDonation = async (data: any, userId?: string): Promise<Donation> => {
  try {
    // Create donor if needed
    let donorId = data.donorId;
    if (!donorId && (data.donorName || data.donorEmail || data.donorPhone)) {
      const donorResult = await query(
        `INSERT INTO donors (name, contact, user_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          data.donorName || 'Anonymous',
          JSON.stringify({
            email: data.donorEmail,
            phone: data.donorPhone,
          }),
          userId || null,
        ]
      );
      if (donorResult.rows.length > 0) {
        donorId = donorResult.rows[0].id;
      }
    }

    // Create donation record
    const result = await query<Donation>(
      `INSERT INTO donations (
        donor_id, amount, currency, payment_method, 
        campaign_id, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        donorId || null,
        data.amount,
        data.currency || 'USD',
        data.paymentMethod,
        data.campaignId || null,
        'pending',
        JSON.stringify(data.metadata || {}),
      ]
    );

    const donation = result.rows[0];

    // Update campaign raised amount if campaign exists
    if (data.campaignId) {
      await query(
        `UPDATE campaigns 
         SET raised_amount = raised_amount + $1
         WHERE id = $2`,
        [data.amount, data.campaignId]
      );
    }

    return donation;
  } catch (error) {
    logger.error('Error creating donation', error);
    throw new ApiError('Failed to create donation', 500);
  }
};

export const getDonations = async (filters: any): Promise<Donation[]> => {
  try {
    let sql = 'SELECT d.*, c.title as campaign_title FROM donations d LEFT JOIN campaigns c ON d.campaign_id = c.id WHERE d.is_deleted = FALSE';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.campaignId) {
      sql += ` AND d.campaign_id = $${paramCount++}`;
      params.push(filters.campaignId);
    }

    if (filters.status) {
      sql += ` AND d.status = $${paramCount++}`;
      params.push(filters.status);
    }

    if (filters.donorId) {
      sql += ` AND d.donor_id = $${paramCount++}`;
      params.push(filters.donorId);
    }

    sql += ` ORDER BY d.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(filters.limit || 50, filters.offset || 0);

    const result = await query<Donation>(sql, params);
    return result.rows;
  } catch (error) {
    logger.error('Error fetching donations', error);
    throw new ApiError('Failed to fetch donations', 500);
  }
};

export const getDonation = async (id: string, userId: string, role: string): Promise<Donation> => {
  try {
    const result = await query<Donation>(
      'SELECT * FROM donations WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError('Donation not found', 404);
    }

    // Check access: donors can only see their own donations
    if (role === 'donor') {
      const donation = result.rows[0];
      const donorCheck = await query(
        'SELECT user_id FROM donors WHERE id = $1',
        [donation.donor_id]
      );
      if (donorCheck.rows[0]?.user_id !== userId) {
        throw new ApiError('Access denied', 403);
      }
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error fetching donation', error);
    throw new ApiError('Failed to fetch donation', 500);
  }
};

export const updateDonationStatus = async (id: string, status: string, paymentProviderId?: string): Promise<Donation> => {
  try {
    const updates: string[] = ['status = $1', 'updated_at = NOW()'];
    const params: any[] = [status, id];

    if (paymentProviderId) {
      updates.push('payment_provider_id = $3');
      params.push(paymentProviderId);
    }

    if (status === 'succeeded') {
      updates.push('receipt_url = $' + (params.length + 1));
      params.push(`/receipts/${id}.pdf`);
    }

    const result = await query<Donation>(
      `UPDATE donations 
       SET ${updates.join(', ')}
       WHERE id = $2 AND is_deleted = FALSE
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new ApiError('Donation not found', 404);
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error updating donation', error);
    throw new ApiError('Failed to update donation', 500);
  }
};

export const handleStripeWebhook = async (req: Request): Promise<void> => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      throw new ApiError('Missing webhook signature or secret', 400);
    }

    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const donationId = paymentIntent.metadata?.donationId;

      if (donationId) {
        await updateDonationStatus(donationId, 'succeeded', paymentIntent.id);
        logger.info(`Donation ${donationId} marked as succeeded`);
      }
    }
  } catch (error) {
    logger.error('Error handling Stripe webhook', error);
    throw new ApiError('Failed to process webhook', 500);
  }
};

export const handleMpesaWebhook = async (req: Request): Promise<void> => {
  try {
    // TODO: Verify M-PESA webhook signature
    const { ResultCode, ResultDesc, MerchantRequestID, CheckoutRequestID } = req.body;

    if (ResultCode === '0') {
      // Find donation by checkout request ID
      const result = await query(
        `SELECT id FROM donations 
         WHERE metadata->>'checkoutRequestID' = $1`,
        [CheckoutRequestID]
      );

      if (result.rows.length > 0) {
        await updateDonationStatus(result.rows[0].id, 'succeeded');
        logger.info(`M-PESA donation ${result.rows[0].id} succeeded`);
      }
    } else {
      // Payment failed
      const result = await query(
        `SELECT id FROM donations 
         WHERE metadata->>'checkoutRequestID' = $1`,
        [CheckoutRequestID]
      );

      if (result.rows.length > 0) {
        await updateDonationStatus(result.rows[0].id, 'failed');
      }
    }
  } catch (error) {
    logger.error('Error handling M-PESA webhook', error);
    throw new ApiError('Failed to process webhook', 500);
  }
};

