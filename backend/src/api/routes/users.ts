import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { query } from '../../db/connection.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { logger } from '../../utils/logger.js';

export const userRouter = Router();

// GET /api/v1/users/profile - Get current user profile
userRouter.get('/profile', authenticate, async (req: any, res, next) => {
    try {
        const userId = req.user.id;
        const result = await query(
            `SELECT id, name, email, phone, avatar, role_id, is_active, created_at 
       FROM users 
       WHERE id = $1 AND is_deleted = FALSE`,
            [userId]
        );

        if (result.rows.length === 0) {
            throw new ApiError('User not found', 404);
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// PUT /api/v1/users/profile - Update current user profile
userRouter.post('/profile', authenticate, async (req: any, res, next) => {
    try {
        const userId = req.user.id;
        const { name, phone, avatar } = req.body;

        const result = await query(
            `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           avatar = COALESCE($3, avatar),
           updated_at = NOW()
       WHERE id = $4 AND is_deleted = FALSE
       RETURNING id, name, email, phone, avatar`,
            [name, phone, avatar, userId]
        );

        if (result.rows.length === 0) {
            throw new ApiError('User not found', 404);
        }

        logger.info(`User profile updated: ${userId}`);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
});
