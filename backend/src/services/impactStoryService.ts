import { query } from '../db/connection.js';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export interface ImpactStory {
    id: string;
    beneficiary_name: string;
    beneficiary_age?: number;
    location?: string;
    profile_image_url?: string;
    short_bio?: string;
    title: string;
    content: string;
    impact_summary?: string;
    campaign_id?: string;
    beneficiary_id?: string;
    status: 'draft' | 'published' | 'archived';
    priority?: number;
    views_count: number;
    created_at: Date;
    updated_at: Date;
    media?: StoryMedia[];
    comments_count?: number;
}

export interface StoryMedia {
    id: string;
    story_id: string;
    media_type: 'image' | 'video';
    media_url: string;
    thumbnail_url?: string;
    caption?: string;
    display_order: number;
}

// Service methods
export const getAllStories = async (filters: {
    campaign_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
}) => {
    try {
        let sql = `
      SELECT s.*, c.title as campaign_title,
             (SELECT COUNT(*) FROM impact_comments WHERE story_id = s.id AND status = 'approved') as comments_count,
             (SELECT COUNT(*) FROM story_reactions WHERE story_id = s.id AND reaction_type = 'like') as likes_count
      FROM impact_stories s
      LEFT JOIN campaigns c ON s.campaign_id = c.id
      WHERE 1=1
    `;
        const params: any[] = [];
        let pIdx = 1;

        if (filters.status && filters.status !== 'all') {
            sql += ` AND s.status = $${pIdx++}`;
            params.push(filters.status);
        } else if (!filters.status) {
            sql += ` AND s.status = 'published'`;
        }

        if (filters.campaign_id) {
            sql += ` AND s.campaign_id = $${pIdx++}`;
            params.push(filters.campaign_id);
        }

        sql += ` ORDER BY s.priority DESC, s.created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
        params.push(filters.limit || 12, filters.offset || 0);

        const result = await query<ImpactStory>(sql, params);

        // Fetch media for each story
        const stories = await Promise.all(result.rows.map(async (story) => {
            const mediaResult = await query<StoryMedia>(
                'SELECT * FROM story_media WHERE story_id = $1 ORDER BY display_order ASC',
                [story.id]
            );
            return { ...story, media: mediaResult.rows };
        }));

        return stories;
    } catch (error) {
        logger.error('Error in getAllStories', error);
        throw new ApiError('Failed to fetch impact stories', 500);
    }
};

export const getStoryById = async (id: string) => {
    try {
        const result = await query<ImpactStory>(
            `SELECT s.*, c.title as campaign_title,
              (SELECT COUNT(*) FROM impact_comments WHERE story_id = s.id AND status = 'approved') as comments_count,
              (SELECT COUNT(*) FROM story_reactions WHERE story_id = s.id AND reaction_type = 'like') as likes_count
       FROM impact_stories s
       LEFT JOIN campaigns c ON s.campaign_id = c.id
       WHERE s.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new ApiError('Impact story not found', 404);
        }

        const story = result.rows[0];

        // Fetch media
        const mediaResult = await query<StoryMedia>(
            'SELECT * FROM story_media WHERE story_id = $1 ORDER BY display_order ASC',
            [story.id]
        );

        story.media = mediaResult.rows;

        // Increment views
        await query('UPDATE impact_stories SET views_count = views_count + 1 WHERE id = $1', [id]);

        return story;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        logger.error('Error in getStoryById', error);
        throw new ApiError('Failed to fetch impact story', 500);
    }
};

export const createStory = async (data: any) => {
    try {
        const { media, ...storyData } = data;

        // Sanitize campaign_id: convert "none" string or empty string to null
        const campaignId = storyData.campaign_id && storyData.campaign_id !== 'none' && storyData.campaign_id !== '' 
            ? storyData.campaign_id 
            : null;

        const result = await query<ImpactStory>(
            `INSERT INTO impact_stories 
       (beneficiary_name, beneficiary_age, location, profile_image_url, short_bio, title, content, impact_summary, campaign_id, beneficiary_id, status, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
            [
                storyData.beneficiary_name,
                storyData.beneficiary_age,
                storyData.location,
                storyData.profile_image_url,
                storyData.short_bio,
                storyData.title,
                storyData.content,
                storyData.impact_summary,
                campaignId,
                storyData.beneficiary_id,
                storyData.status || 'published',
                storyData.priority || 0
            ]
        );

        const story = result.rows[0];

        // Add media
        if (media && Array.isArray(media)) {
            for (const item of media) {
                // Support both 'url' and 'media_url' field names
                const mediaUrl = item.media_url || item.url;
                if (mediaUrl) {
                    await query(
                        `INSERT INTO story_media (story_id, media_type, media_url, thumbnail_url, caption, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
                        [story.id, item.media_type, mediaUrl, item.thumbnail_url, item.caption, item.display_order || 0]
                    );
                }
            }
        }

        return await getStoryById(story.id);
    } catch (error) {
        logger.error('Error in createStory', error);
        throw new ApiError('Failed to create impact story', 500);
    }
};

export const updateStory = async (id: string, data: any) => {
    try {
        const { media, ...storyData } = data;

        // Verify existence
        await getStoryById(id);

        // Sanitize campaign_id: convert "none" string or empty string to null
        const campaignId = storyData.campaign_id && storyData.campaign_id !== 'none' && storyData.campaign_id !== '' 
            ? storyData.campaign_id 
            : null;

        await query(
            `UPDATE impact_stories 
       SET beneficiary_name = $1, beneficiary_age = $2, location = $3, 
           profile_image_url = $4, short_bio = $5, title = $6, 
           content = $7, impact_summary = $8, campaign_id = $9, 
           status = $10, priority = COALESCE($12, priority), updated_at = CURRENT_TIMESTAMP
       WHERE id = $11`,
            [
                storyData.beneficiary_name,
                storyData.beneficiary_age,
                storyData.location,
                storyData.profile_image_url,
                storyData.short_bio,
                storyData.title,
                storyData.content,
                storyData.impact_summary,
                campaignId,
                storyData.status,
                id,
                storyData.priority // $12
            ]
        );

        // Update media if provided
        if (media && Array.isArray(media)) {
            // Transactional-like cleanup and re-insert for simplicity
            await query('DELETE FROM story_media WHERE story_id = $1', [id]);
            for (const item of media) {
                // Support both 'url' and 'media_url' field names
                const mediaUrl = item.media_url || item.url;
                if (mediaUrl) {
                    await query(
                        `INSERT INTO story_media (story_id, media_type, media_url, thumbnail_url, caption, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
                        [id, item.media_type, mediaUrl, item.thumbnail_url, item.caption, item.display_order || 0]
                    );
                }
            }
        }

        return await getStoryById(id);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        logger.error('Error in updateStory', error);
        throw new ApiError('Failed to update impact story', 500);
    }
};

export const deleteStory = async (id: string) => {
    try {
        // story_media has ON DELETE CASCADE in schema
        const result = await query('DELETE FROM impact_stories WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            throw new ApiError('Story not found', 404);
        }
        return true;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        logger.error('Error in deleteStory', error);
        throw new ApiError('Failed to delete impact story', 500);
    }
};
