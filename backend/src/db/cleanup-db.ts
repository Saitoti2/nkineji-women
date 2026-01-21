import { query } from './connection.js';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

async function cleanup() {
    try {
        logger.info('Starting cleanup of Unsplash records...');

        // Cleanup Impact Stories
        const storiesResult = await query("DELETE FROM impact_stories WHERE profile_image_url LIKE '%unsplash%' RETURNING title");
        console.log('Deleted Impact Stories:', storiesResult.rows);

        // Cleanup Campaigns
        const campaignsResult = await query("DELETE FROM campaigns WHERE image_url LIKE '%unsplash%' RETURNING title");
        console.log('Deleted Campaigns:', campaignsResult.rows);

        logger.info('Cleanup completed successfully');
    } catch (e) {
        console.error('Cleanup failed:', e);
    }
}

cleanup();
