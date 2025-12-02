import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { query } from './connection.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');

    // Read and execute migration files
    const migration1 = readFileSync(
      join(__dirname, '../../migrations/001_initial_schema.sql'),
      'utf-8'
    );
    
    const migration2 = readFileSync(
      join(__dirname, '../../migrations/002_additional_tables.sql'),
      'utf-8'
    );

    // Execute migrations
    await query(migration1);
    logger.info('Migration 001 completed');
    
    await query(migration2);
    logger.info('Migration 002 completed');

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

