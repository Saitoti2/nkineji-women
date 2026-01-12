import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authenticateOptional } from '../../middleware/authenticate.js';
import { getCommentsByStory, addComment, toggleReaction, updateComment, deleteComment } from '../../services/impactCommentService.js';

export const impactCommentRouter = Router();

// GET /api/v1/impact-comments/story/:id - Public
impactCommentRouter.get('/story/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
        // Visitor ID from query or header
        const visitorId = (req.query.visitor_id as string) || (req.headers['x-visitor-id'] as string);
        const comments = await getCommentsByStory(req.params.id, userId, visitorId);
        res.json({ success: true, data: comments });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/impact-comments - Public / Auth Optional
impactCommentRouter.post(
    '/',
    authenticateOptional,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const commentData = {
                ...req.body,
                user_id: req.user?.id || null, // Allow null for anonymous
                user_name: req.user?.name || req.body.user_name || 'Visitor',
                user_avatar: req.user?.avatar || null
            };
            const comment = await addComment(commentData);
            res.status(201).json({ success: true, data: comment });
        } catch (error) {
            next(error);
        }
    }
);

// PUT /api/v1/impact-comments/:id - Edit comment
impactCommentRouter.put(
    '/:id',
    authenticateOptional,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { content, visitor_id } = req.body;
            const userId = req.user?.id;

            // Visitor ID from body (or header if we chose that path, keeping body for simplicity for now)
            const visitorId = visitor_id || req.headers['x-visitor-id'] as string;

            const updated = await updateComment(req.params.id, content, userId, visitorId);
            res.json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }
);

// DELETE /api/v1/impact-comments/:id - Delete comment
impactCommentRouter.delete(
    '/:id',
    authenticateOptional,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            // Visitor ID from query or header
            const visitorId = (req.query.visitor_id as string) || (req.headers['x-visitor-id'] as string);

            const result = await deleteComment(req.params.id, userId, visitorId);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/v1/impact-comments/:id/react - Auth Optional
impactCommentRouter.post(
    '/:id/react',
    authenticateOptional,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { reaction_type, visitor_id } = req.body;
            const visitorId = visitor_id || req.headers['x-visitor-id'] as string;
            const userId = req.user?.id;

            const result = await toggleReaction(req.params.id as string, userId, reaction_type || 'like', visitorId);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);
