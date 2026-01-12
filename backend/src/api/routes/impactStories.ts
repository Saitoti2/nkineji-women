import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { getAllStories, getStoryById, createStory, updateStory, deleteStory } from '../../services/impactStoryService.js';

export const impactStoryRouter = Router();

// GET /api/v1/impact-stories - Public
impactStoryRouter.get('/', async (req, res, next) => {
    try {
        const { campaign_id, status, limit, offset } = req.query;
        const stories = await getAllStories({
            campaign_id: campaign_id as string,
            status: status as string,
            limit: limit ? parseInt(limit as string) : 12,
            offset: offset ? parseInt(offset as string) : 0,
        });
        res.json({ success: true, data: stories });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/impact-stories/:id
impactStoryRouter.get('/:id', async (req, res, next) => {
    try {
        const story = await getStoryById(req.params.id as string);
        res.json({ success: true, data: story });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/impact-stories - Admin only
impactStoryRouter.post(
    '/',
    authenticate,
    authorize(['admin', 'super_admin']),
    async (req, res, next) => {
        try {
            const story = await createStory(req.body);
            res.status(201).json({ success: true, data: story });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /api/v1/impact-stories/:id - Admin only
impactStoryRouter.put(
    '/:id',
    authenticate,
    authorize(['admin', 'super_admin']),
    async (req, res, next) => {
        try {
            const story = await updateStory(req.params.id as string, req.body);
            res.json({ success: true, data: story });
        } catch (error) {
            next(error);
        }
    }
);

// DELETE /api/v1/impact-stories/:id - Admin only
impactStoryRouter.delete(
    '/:id',
    authenticate,
    authorize(['admin', 'super_admin']),
    async (req, res, next) => {
        try {
            await deleteStory(req.params.id as string);
            res.json({ success: true, message: 'Impact story deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
);
