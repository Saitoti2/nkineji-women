import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { query } from '../db/connection.js';

export interface Beneficiary {
  id: string;
  pseudo_id: string;
  full_name_encrypted: string;
  gender: string;
  date_of_birth?: string;
  location_geo?: any;
  contact_info_encrypted?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

const SENSITIVE_FIELDS = ['full_name_encrypted', 'contact_info_encrypted', 'date_of_birth'];

export const getBeneficiaries = async (filters: any, role: string): Promise<Beneficiary[]> => {
  try {
    let sql = 'SELECT * FROM beneficiaries WHERE is_deleted = FALSE';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.gender) {
      sql += ` AND gender = $${paramCount++}`;
      params.push(filters.gender);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(filters.limit || 50, filters.offset || 0);

    const result = await query<Beneficiary>(sql, params);
    
    // Filter sensitive fields based on role
    return result.rows.map(beneficiary => {
      if (!['admin', 'super_admin', 'health_officer', 'education_officer'].includes(role)) {
        const filtered = { ...beneficiary };
        SENSITIVE_FIELDS.forEach(field => {
          delete (filtered as any)[field];
        });
        return filtered;
      }
      return beneficiary;
    });
  } catch (error) {
    logger.error('Error fetching beneficiaries', error);
    throw new ApiError('Failed to fetch beneficiaries', 500);
  }
};

export const getBeneficiary = async (id: string, userId: string, role: string): Promise<Beneficiary> => {
  try {
    const result = await query<Beneficiary>(
      'SELECT * FROM beneficiaries WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError('Beneficiary not found', 404);
    }

    const beneficiary = result.rows[0];

    // Filter sensitive fields based on role
    if (!['admin', 'super_admin', 'health_officer', 'education_officer'].includes(role)) {
      SENSITIVE_FIELDS.forEach(field => {
        delete (beneficiary as any)[field];
      });
    }

    return beneficiary;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error fetching beneficiary', error);
    throw new ApiError('Failed to fetch beneficiary', 500);
  }
};

export const createBeneficiary = async (data: any, userId: string): Promise<Beneficiary> => {
  try {
    // Generate pseudo ID
    const pseudoId = `BEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // For now, store as plain text (in production, encrypt sensitive fields)
    const result = await query<Beneficiary>(
      `INSERT INTO beneficiaries (
        pseudo_id, full_name_encrypted, gender, date_of_birth,
        contact_info_encrypted, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        pseudoId,
        data.fullName || data.full_name_encrypted,
        data.gender,
        data.dateOfBirth || data.date_of_birth || null,
        data.contactInfo ? JSON.stringify(data.contactInfo) : null,
        userId,
      ]
    );

    // Create consent record if provided
    if (data.consentType) {
      await query(
        `INSERT INTO consent_records (
          beneficiary_id, consent_type, granted_by, method, scope
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          result.rows[0].id,
          data.consentType,
          userId,
          data.consentMethod || 'digital',
          data.consentScope || 'general',
        ]
      );
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Error creating beneficiary', error);
    throw new ApiError('Failed to create beneficiary', 500);
  }
};

export const updateBeneficiary = async (id: string, data: any, userId: string, role: string): Promise<Beneficiary> => {
  try {
    // Check if user has permission to update sensitive fields
    const hasSensitiveAccess = ['admin', 'super_admin', 'health_officer', 'education_officer'].includes(role);

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (data.fullName !== undefined || data.full_name_encrypted !== undefined) {
      if (!hasSensitiveAccess) {
        throw new ApiError('Insufficient permissions to update sensitive fields', 403);
      }
      updates.push(`full_name_encrypted = $${paramCount++}`);
      params.push(data.fullName || data.full_name_encrypted);
    }

    if (data.gender !== undefined) {
      updates.push(`gender = $${paramCount++}`);
      params.push(data.gender);
    }

    if (data.dateOfBirth !== undefined || data.date_of_birth !== undefined) {
      if (!hasSensitiveAccess) {
        throw new ApiError('Insufficient permissions to update sensitive fields', 403);
      }
      updates.push(`date_of_birth = $${paramCount++}`);
      params.push(data.dateOfBirth || data.date_of_birth || null);
    }

    if (data.contactInfo !== undefined) {
      if (!hasSensitiveAccess) {
        throw new ApiError('Insufficient permissions to update sensitive fields', 403);
      }
      updates.push(`contact_info_encrypted = $${paramCount++}`);
      params.push(JSON.stringify(data.contactInfo));
    }

    if (updates.length === 0) {
      return await getBeneficiary(id, userId, role);
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const result = await query<Beneficiary>(
      `UPDATE beneficiaries 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount} AND is_deleted = FALSE
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new ApiError('Beneficiary not found', 404);
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error updating beneficiary', error);
    throw new ApiError('Failed to update beneficiary', 500);
  }
};

export const deleteBeneficiary = async (id: string, userId: string): Promise<void> => {
  try {
    const result = await query(
      `UPDATE beneficiaries 
       SET is_deleted = TRUE, updated_at = NOW()
       WHERE id = $1 AND is_deleted = FALSE
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError('Beneficiary not found', 404);
    }

    // TODO: Archive sensitive data to separate table
    logger.info(`Beneficiary ${id} soft deleted by user ${userId}`);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Error deleting beneficiary', error);
    throw new ApiError('Failed to delete beneficiary', 500);
  }
};

