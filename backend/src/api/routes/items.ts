import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { getItems, createItem, updateItem, deleteItem } from '../../services/itemService.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createItemSchema, updateItemSchema } from '../../types/schemas/itemSchemas.js';

export const itemsRouter = Router();

// GET /api/v1/items - Public
itemsRouter.get('/', async (req, res, next) => {
    try {
        const { activeOnly, active, status, campaignId, search } = req.query;
        const isActiveFilter = (activeOnly === 'true' || active === 'true' || status === 'true') 
            ? true 
            : (activeOnly === 'false' || active === 'false' || status === 'false') 
                ? false 
                : undefined;

        const items = await getItems({
            activeOnly: isActiveFilter,
            campaignId: campaignId as string,
            search: search as string,
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
    authorize(['chief_admin', 'super_admin']),
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
    authorize(['chief_admin', 'super_admin']),
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

// DELETE /api/v1/items/:id - Admin only
itemsRouter.delete(
    '/:id',
    authenticate,
    authorize(['chief_admin', 'super_admin']),
    async (req, res, next) => {
        try {
            await deleteItem(req.params.id as string);
            res.json({ success: true, message: 'Item deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
);
