import { query, closePool } from './connection.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
import { getPool } from './connection.js';

dotenv.config();

export async function seedEssentials() {

    try {
        logger.info('Seeding essentials...');
        const pool = getPool();
        // Ensure connection
        await pool.query('SELECT 1');

        // Create Maternal Health Kit
        await query(
            `INSERT INTO campaign_items (name, description, unit_price, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (name) DO UPDATE SET
         description = EXCLUDED.description,
         unit_price = EXCLUDED.unit_price,
         image_url = EXCLUDED.image_url`,
            [
                'Maternal Health Kit',
                'Vitamins, hygiene essentials, and safe delivery supplies for mothers.',
                35.00,
                '/uploads/items/maternal-health-kit.png',
                null // system created
            ]
        );

        // Create Student Pack
        await query(
            `INSERT INTO campaign_items (name, description, unit_price, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (name) DO UPDATE SET
         description = EXCLUDED.description,
         unit_price = EXCLUDED.unit_price,
         image_url = EXCLUDED.image_url`,
            [
                'Nkineji Student Pack',
                'Comprehensive set of textbooks, stationery, and a sturdy school bag.',
                25.00,
                '/uploads/items/student-pack.png',
                null
            ]
        );

        // Create Dignity Kit
        await query(
            `INSERT INTO campaign_items (name, description, unit_price, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (name) DO UPDATE SET
         description = EXCLUDED.description,
         unit_price = EXCLUDED.unit_price,
         image_url = EXCLUDED.image_url`,
            [
                'Dignity & Hygiene Kit',
                'Sanitary pads and basic hygiene items to keep girls in school.',
                15.00,
                'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?q=80&w=2670&auto=format&fit=crop',
                null
            ]
        );

        logger.info('Seeding completed successfully');
    } catch (error) {
        logger.error('Seeding failed', error);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedEssentials()
        .then(() => {
            logger.info('Seeding completed');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Seeding error', error);
            process.exit(1);
        });
}

