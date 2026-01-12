import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { getCommentsByStory, addComment, toggleReaction } from '../../services/impactCommentService.js';

export const impactCommentRouter = Router();

// GET /api/v1/impact-comments/story/:id - Public
impactCommentRouter.get('/story/:id', async (req, res, next) => {
    try {
        const userId = req.query.userId as string;
        const comments = await getCommentsByStory(req.params.id, userId);
        res.json({ success: true, data: comments });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/impact-comments - Auth required
impactCommentRouter.post(
    '/',
    authenticate,
    async (req, res, next) => {
        try {
            const commentData = {
                ...req.body,
                user_id: req.user!.id,
                user_name: req.user!.name || 'Anonymous',
                user_avatar: req.user!.avatar
            };
            const comment = await addComment(commentData);
            res.status(201).json({ success: true, data: comment });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/v1/impact-comments/:id/react - Auth required
impactCommentRouter.post(
    '/:id/react',
    authenticate,
    async (req, res, next) => {
        try {
            const { reaction_type } = req.body;
            const result = await toggleReaction(req.params.id as string, req.user!.id, reaction_type || 'like');
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);
