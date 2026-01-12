import { query, closePool } from './connection.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
import { getPool } from './connection.js';

dotenv.config();

async function seedEssentials() {
    try {
        logger.info('Seeding essentials...');
        const pool = getPool();
        // Ensure connection
        await pool.query('SELECT 1');

        // Create Sanitary Pads
        await query(
            `INSERT INTO campaign_items (name, description, unit_price, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
            [
                'Sanitary Pads (Pack of 8)',
                'Hygiene essentials to keep girls in school comfortably.',
                1.50,
                'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?q=80&w=2670&auto=format&fit=crop',
                null // system created
            ]
        );

        // Create Textbooks
        await query(
            `INSERT INTO campaign_items (name, description, unit_price, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
            [
                'School Textbook',
                'Standard curriculum textbook for primary school students.',
                12.00,
                'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2673&auto=format&fit=crop',
                null
            ]
        );

        // Create School Uniform
        await query(
            `INSERT INTO campaign_items (name, description, unit_price, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
            [
                'School Uniform Set',
                'Complete uniform including sweater and dress/shorts.',
                25.00,
                'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2672&auto=format&fit=crop',
                null
            ]
        );

        logger.info('Seeding completed successfully');
    } catch (error) {
        logger.error('Seeding failed', error);
    } finally {
        await closePool();
    }
}

seedEssentials();
