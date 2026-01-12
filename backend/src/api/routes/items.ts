import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { getItems, createItem, updateItem } from '../../services/itemService.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createItemSchema, updateItemSchema } from '../../types/schemas/itemSchemas.js';

export const itemsRouter = Router();

// GET /api/v1/items - Public
itemsRouter.get('/', async (req, res, next) => {
    try {
        const { activeOnly, _campaignId } = req.query;
        const items = await getItems({
            activeOnly: activeOnly === 'true',
            campaignId: req.query.campaignId as string,
        });
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/items - Admin only
itemsRouter.post(
    '/',
    authenticate,
    authorize(['admin', 'super_admin']),
    validateRequest(createItemSchema),
    async (req, res, next) => {
        try {
            const item = await createItem(req.body, req.user!.id);
            res.status(201).json({ success: true, data: item });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /api/v1/items/:id - Admin only
itemsRouter.put(
    '/:id',
    authenticate,
    authorize(['admin', 'super_admin']),
    validateRequest(updateItemSchema),
    async (req, res, next) => {
        try {
            const item = await updateItem(req.params.id as string, req.body);
            res.json({ success: true, data: item });
        } catch (error) {
            next(error);
        }
    }
);
