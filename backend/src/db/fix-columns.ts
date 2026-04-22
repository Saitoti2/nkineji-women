import { query } from './connection.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

async function fixColumns() {
    try {
        logger.info('Adding missing columns...');

        await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT');
        logger.info('Added avatar to users');

        await query('ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0');
        logger.info('Added priority to campaigns');

        await query('ALTER TABLE impact_stories ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0');
        logger.info('Added priority to impact_stories');

        await query('ALTER TABLE campaign_items ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0');
        logger.info('Added priority to campaign_items');

        logger.info('Columns fixed successfully');
    } catch (error) {
        logger.error('Failed to fix columns', error);
        process.exit(1);
    }
}

fixColumns().then(() => process.exit(0));
