import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { query, closePool } from './connection.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSpecificMigration() {
    try {
        const file = '004_donation_items.sql';
        logger.info(`Running specific migration: ${file}`);
        const migrationsDir = join(__dirname, '../../migrations');
        const sql = readFileSync(join(migrationsDir, file), 'utf-8');
        await query(sql);
        logger.info(`Migration ${file} completed`);
    } catch (error) {
        logger.error('Migration failed', error);
        process.exit(1);
    } finally {
        await closePool();
    }
}

runSpecificMigration();
