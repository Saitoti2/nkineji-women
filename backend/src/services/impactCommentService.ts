import { query } from '../db/connection.js';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export interface Comment {
    id: string;
    story_id: string;
    parent_comment_id?: string;
    user_id?: string;
    user_name: string;
    user_avatar?: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected' | 'deleted';
    created_at: Date;
    updated_at: Date;
    replies?: Comment[];
    reactions_count?: any;
    user_reaction?: string;
    visitor_id?: string;
}

export const getCommentsByStory = async (storyId: string, userId?: string, visitorId?: string) => {
    try {
        // Fetch all comments for the story
        const result = await query<Comment>(
            `SELECT c.*, 
       (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c.id AND reaction_type = 'like') as likes_count,
       (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c.id AND reaction_type = 'heart') as hearts_count,
       (SELECT reaction_type FROM comment_reactions WHERE comment_id = c.id AND (
           ($2::uuid IS NOT NULL AND user_id = $2) OR 
           ($3::text IS NOT NULL AND visitor_id = $3)
       ) LIMIT 1) as user_reaction
       FROM impact_comments c
       WHERE c.story_id = $1 AND c.status = 'approved'
       ORDER BY c.created_at ASC`,
            [storyId, userId || null, visitorId || null]
        );

        const allComments = result.rows;
        const commentMap = new Map<string, Comment>();
        const rootComments: Comment[] = [];

        // Initialize map
        allComments.forEach(c => {
            commentMap.set(c.id, { ...c, replies: [] });
        });

        // Build tree
        allComments.forEach(c => {
            const comment = commentMap.get(c.id)!;
            if (c.parent_comment_id && commentMap.has(c.parent_comment_id)) {
                commentMap.get(c.parent_comment_id)!.replies!.push(comment);
            } else {
                rootComments.push(comment);
            }
        });

        return rootComments;
    } catch (error) {
        logger.error('Error in getCommentsByStory', error);
        throw new ApiError('Failed to fetch comments', 500);
    }
};

export const addComment = async (data: any) => {
    try {
        // Ensure we default to 'Visitor' only if no identity is present
        const authorName = data.user_name && data.user_name !== 'Visitor' ? data.user_name : (data.user_id ? 'Authenticated User' : 'Visitor');

        const result = await query<Comment>(
            `INSERT INTO impact_comments (story_id, parent_comment_id, user_id, user_name, user_avatar, content, visitor_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [
                data.story_id,
                data.parent_comment_id || null,
                data.user_id || null,
                authorName,
                data.user_avatar || null,
                data.content,
                data.visitor_id || null
            ]
        );
        return result.rows[0];
    } catch (error) {
        logger.error('Error in addComment', error);
        throw new ApiError('Failed to add comment', 500);
    }
};

export const toggleReaction = async (commentId: string, userId?: string, reactionType: string = 'like', visitorId?: string) => {
    try {
        if (!userId && !visitorId) {
            throw new ApiError('Unauthorized', 401);
        }

        // Check if reaction exists
        let existing;
        if (userId) {
            existing = await query(
                'SELECT id FROM comment_reactions WHERE comment_id = $1 AND user_id = $2 AND reaction_type = $3',
                [commentId, userId, reactionType]
            );
        } else {
            existing = await query(
                'SELECT id FROM comment_reactions WHERE comment_id = $1 AND visitor_id = $2 AND reaction_type = $3',
                [commentId, visitorId, reactionType]
            );
        }

        if (existing.rows.length > 0) {
            await query('DELETE FROM comment_reactions WHERE id = $1', [existing.rows[0].id]);
            return { action: 'removed' };
        } else {
            // Remove any other reaction from this user/visitor on this comment first
            if (userId) {
                await query('DELETE FROM comment_reactions WHERE comment_id = $1 AND user_id = $2', [commentId, userId]);
                await query(
                    'INSERT INTO comment_reactions (comment_id, user_id, reaction_type) VALUES ($1, $2, $3)',
                    [commentId, userId, reactionType]
                );
            } else {
                await query('DELETE FROM comment_reactions WHERE comment_id = $1 AND visitor_id = $2', [commentId, visitorId]);
                await query(
                    'INSERT INTO comment_reactions (comment_id, visitor_id, reaction_type) VALUES ($1, $2, $3)',
                    [commentId, visitorId, reactionType]
                );
            }
            return { action: 'added' };
        }
    } catch (error) {
        logger.error('Error in toggleReaction', error);
        throw new ApiError('Failed to toggle reaction', 500);
    }
};

export const updateComment = async (commentId: string, content: string, userId?: string, visitorId?: string) => {
    try {
        let result;
        if (userId) {
            result = await query(
                'UPDATE impact_comments SET content = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
                [content, commentId, userId]
            );
        } else if (visitorId) {
            result = await query(
                'UPDATE impact_comments SET content = $1, updated_at = NOW() WHERE id = $2 AND visitor_id = $3 RETURNING *',
                [content, commentId, visitorId]
            );
        } else {
            throw new ApiError('Unauthorized', 401);
        }

        if (result.rowCount === 0) {
            throw new ApiError('Comment not found or unauthorized', 404);
        }
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

export const deleteComment = async (commentId: string, userId?: string, visitorId?: string) => {
    try {
        let result;
        if (userId) {
            result = await query(
                'UPDATE impact_comments SET status = \'deleted\', updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id',
                [commentId, userId]
            );
        } else if (visitorId) {
            result = await query(
                'UPDATE impact_comments SET status = \'deleted\', updated_at = NOW() WHERE id = $1 AND visitor_id = $2 RETURNING id',
                [commentId, visitorId]
            );
        } else {
            throw new ApiError('Unauthorized', 401);
        }

        if (result.rowCount === 0) {
            throw new ApiError('Comment not found or unauthorized', 404);
        }
        return { success: true, id: commentId };
    } catch (error) {
        throw error;
    }
};
