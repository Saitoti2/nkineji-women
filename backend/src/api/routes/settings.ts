import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/authenticate.js';
import { getPaymentSettings, updatePaymentSetting } from '../../services/paymentSettingsService.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { z } from 'zod';

export const settingsRouter = Router();

// Validation schema for updating settings
const updateSettingsSchema = z.object({
    body: z.object({
        key: z.enum(['mpesa', 'bank_transfer', 'stripe_config']), // Whitelist keys
        value: z.any() // JSON blob
    })
});

// GET /api/v1/settings/payments - Public (or authenticated?)
// Making it public so unauthenticated donors can see instructions
settingsRouter.get('/payments', async (req, res, next) => {
    try {
        const settings = await getPaymentSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
});

// PUT /api/v1/settings/payments - Admin Only
settingsRouter.put(
    '/payments',
    authenticate,
    requireAdmin,
    validateRequest(updateSettingsSchema),
    async (req, res, next) => {
        try {
            const { key, value } = req.body;
            const setting = await updatePaymentSetting(key, value);
            res.json({ success: true, data: setting });
        } catch (error) {
            next(error);
        }
    }
);
