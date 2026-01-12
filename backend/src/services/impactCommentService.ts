import { query } from '../db/connection';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

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
}

export const getCommentsByStory = async (storyId: string, userId?: string) => {
    try {
        // Fetch all comments for the story
        const result = await query<Comment>(
            `SELECT c.*, 
       (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c.id AND reaction_type = 'like') as likes_count,
       (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c.id AND reaction_type = 'heart') as hearts_count,
       (SELECT reaction_type FROM comment_reactions WHERE comment_id = c.id AND user_id = $2 LIMIT 1) as user_reaction
       FROM impact_comments c
       WHERE c.story_id = $1 AND c.status = 'approved'
       ORDER BY c.created_at ASC`,
            [storyId, userId || null]
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
        const result = await query<Comment>(
            `INSERT INTO impact_comments (story_id, parent_comment_id, user_id, user_name, user_avatar, content)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [data.story_id, data.parent_comment_id, data.user_id, data.user_name, data.user_avatar, data.content]
        );
        return result.rows[0];
    } catch (error) {
        logger.error('Error in addComment', error);
        throw new ApiError('Failed to add comment', 500);
    }
};

export const toggleReaction = async (commentId: string, userId: string, reactionType: string) => {
    try {
        // Check if reaction exists
        const existing = await query(
            'SELECT id FROM comment_reactions WHERE comment_id = $1 AND user_id = $2 AND reaction_type = $3',
            [commentId, userId, reactionType]
        );

        if (existing.rows.length > 0) {
            await query('DELETE FROM comment_reactions WHERE id = $1', [existing.rows[0].id]);
            return { action: 'removed' };
        } else {
            // Remove any other reaction from this user on this comment first (Instagram/TikTok style: only one primary reaction)
            await query('DELETE FROM comment_reactions WHERE comment_id = $1 AND user_id = $2', [commentId, userId]);

            await query(
                'INSERT INTO comment_reactions (comment_id, user_id, reaction_type) VALUES ($1, $2, $3)',
                [commentId, userId, reactionType]
            );
            return { action: 'added' };
        }
    } catch (error) {
        logger.error('Error in toggleReaction', error);
        throw new ApiError('Failed to toggle reaction', 500);
    }
};
