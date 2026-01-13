import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { query } from './connection.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { readdirSync } from 'fs';

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');

    const migrationsDir = join(__dirname, '../../migrations');
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      logger.info(`Running migration: ${file}`);
      console.log(`[DEBUG] Executing migration: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      await query(sql);
      logger.info(`Migration ${file} completed`);
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      logger.info('Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration error', error);
      process.exit(1);
    });
}

export { runMigrations };



