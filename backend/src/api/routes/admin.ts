import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { query, getPool } from '../../db/connection.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { logger } from '../../utils/logger.js';

export const adminRouter = Router();

// All admin routes require authentication and admin role
adminRouter.use(authenticate);
adminRouter.use(authorize(['admin', 'super_admin']));

// Dashboard Stats
adminRouter.get('/dashboard/stats', async (req, res, next) => {
  try {
    const [
      campaignsResult,
      donationsResult,
      beneficiariesResult,
      totalRaisedResult,
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM campaigns WHERE is_deleted = FALSE'),
      query('SELECT COUNT(*) as count FROM donations WHERE is_deleted = FALSE AND status = $1', ['succeeded']),
      query('SELECT COUNT(*) as count FROM beneficiaries WHERE is_deleted = FALSE'),
      query('SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE status = $1 AND is_deleted = FALSE', ['succeeded']),
    ]);

    res.json({
      success: true,
      data: {
        totalCampaigns: parseInt(campaignsResult.rows[0]?.count || '0'),
        totalDonations: parseInt(donationsResult.rows[0]?.count || '0'),
        totalBeneficiaries: parseInt(beneficiariesResult.rows[0]?.count || '0'),
        totalRaised: parseFloat(totalRaisedResult.rows[0]?.total || '0'),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Campaigns Management
adminRouter.get('/campaigns', async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let sql = 'SELECT * FROM campaigns WHERE is_deleted = FALSE';
    const params: any[] = [];

    if (status) {
      sql += ' AND status = $1';
      params.push(status);
      sql += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(parseInt(limit as string), parseInt(offset as string));
    } else {
      sql += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params.push(parseInt(limit as string), parseInt(offset as string));
    }

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// Donations Management
adminRouter.get('/donations', async (req, res, next) => {
  try {
    const { status, campaignId, limit = 50, offset = 0 } = req.query;
    let sql = `
      SELECT d.*, c.title as campaign_title, 
             dr.name as donor_name, dr.contact as donor_contact
      FROM donations d
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN donors dr ON d.donor_id = dr.id
      WHERE d.is_deleted = FALSE
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      sql += ` AND d.status = $${paramCount++}`;
      params.push(status);
    }

    if (campaignId) {
      sql += ` AND d.campaign_id = $${paramCount++}`;
      params.push(campaignId);
    }

    sql += ` ORDER BY d.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// Impact Stories Management
adminRouter.get('/impact-stories', async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let sql = 'SELECT * FROM impact_stories WHERE is_deleted = FALSE';
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      sql += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    sql += ` ORDER BY priority DESC, created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// Beneficiaries Management
adminRouter.get('/beneficiaries', async (req, res, next) => {
  try {
    const { gender, limit = 50, offset = 0 } = req.query;
    let sql = 'SELECT * FROM beneficiaries WHERE is_deleted = FALSE';
    const params: any[] = [];
    let paramCount = 1;

    if (gender) {
      sql += ` AND gender = $${paramCount++}`;
      params.push(gender);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// Users Management
adminRouter.get('/users', async (req, res, next) => {
  try {
    const { role, limit = 50, offset = 0 } = req.query;
    let sql = `
      SELECT u.*, r.name as role_name, o.name as organisation_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN organisations o ON u.organisation_id = o.id
      WHERE u.is_deleted = FALSE
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (role) {
      sql += ` AND r.name = $${paramCount++}`;
      params.push(role);
    }

    sql += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// Create User
adminRouter.post('/users', async (req, res, next) => {
  try {
    const { name, email, phone, password, roleId, organisationId } = req.body;

    if (!name || (!email && !phone)) {
      throw new ApiError('Name and email or phone required', 400);
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const passwordHash = password ? await bcrypt.default.hash(password, 10) : null;

    // Get role ID if role name provided
    let finalRoleId = roleId;
    if (!finalRoleId && req.body.role) {
      const roleResult = await query('SELECT id FROM roles WHERE name = $1', [req.body.role]);
      if (roleResult.rows.length > 0) {
        finalRoleId = roleResult.rows[0].id;
      }
    }

    const result = await query(
      `INSERT INTO users (name, email, phone, password_hash, role_id, organisation_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, phone, role_id, organisation_id, created_at`,
      [name, email || null, phone || null, passwordHash, finalRoleId, organisationId || null, req.user!.id]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update User
adminRouter.put('/users/:id', async (req, res, next) => {
  try {
    const { name, email, phone, password, roleId, isActive } = req.body;
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      params.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      params.push(phone);
    }
    if (password !== undefined) {
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.default.hash(password, 10);
      updates.push(`password_hash = $${paramCount++}`);
      params.push(passwordHash);
    }
    if (roleId !== undefined) {
      updates.push(`role_id = $${paramCount++}`);
      params.push(roleId);
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      params.push(isActive);
    }

    if (updates.length === 0) {
      throw new ApiError('No fields to update', 400);
    }

    updates.push('updated_at = NOW()');
    params.push(req.params.id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} AND is_deleted = FALSE RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new ApiError('User not found', 404);
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get Roles
adminRouter.get('/roles', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM roles ORDER BY name');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// Reports
adminRouter.get('/reports/donations', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(amount) as total,
        currency
      FROM donations
      WHERE status = 'succeeded' AND is_deleted = FALSE
    `;
    const params: any[] = [];

    if (startDate) {
      sql += ' AND created_at >= $1';
      params.push(startDate);
      if (endDate) {
        sql += ' AND created_at <= $2';
        params.push(endDate);
      }
    }

    sql += ' GROUP BY DATE(created_at), currency ORDER BY date DESC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});
// Bulk Reorder
adminRouter.post('/reorder', async (req, res, next) => {
  try {
    const { items, type } = req.body;
    // items: { id: string, priority: number }[]
    // type: 'campaigns' | 'stories' | 'items'

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError('Invalid items array', 400);
    }

    let tableName = '';
    switch (type) {
      case 'campaigns': tableName = 'campaigns'; break;
      case 'stories': tableName = 'impact_stories'; break;
      case 'items': tableName = 'campaign_items'; break;
      default: throw new ApiError('Invalid type', 400);
    }

    // Begin transaction
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      for (const item of items) {
        await client.query(
          `UPDATE ${tableName} SET priority = $1 WHERE id = $2`,
          [item.priority, item.id]
        );
      }

      await client.query('COMMIT');
      res.json({ success: true, message: 'Reorder successful' });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});


