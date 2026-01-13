import { query } from './connection.js';
import { logger } from '../utils/logger.js';
import { runMigrations } from './migrate.js';
// import { seed } from './seed.js'; // Assuming seed function is exported or I can run it via script
import dotenv from 'dotenv';
dotenv.config();

async function reset() {
    try {
        logger.info('Dropping schema public...');
        await query('DROP SCHEMA public CASCADE');
        await query('CREATE SCHEMA public');
        // await query('GRANT ALL ON SCHEMA public TO postgres');
        // await query('GRANT ALL ON SCHEMA public TO public');
        logger.info('Schema reset. Running migrations...');
        await runMigrations();
        logger.info('Database reset and migrated successfully.');
    } catch (e) {
        logger.error('Reset failed', e);
        process.exit(1);
    }
    process.exit(0);
}

reset();
