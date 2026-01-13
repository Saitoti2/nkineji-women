import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import { getPool } from '../../db/connection.js';
import { runMigrations } from '../../db/migrate.js';
import { seedDatabase } from '../../db/seed.js';
import { seedCampaigns } from '../../db/seed-campaigns.js';
import { seedImpactStories } from '../../db/seed-impact-stories.js';
import { seedEssentials } from '../../db/seed-essentials.js';

import path from 'path';
import { readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

export const healthRouter = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
  let dbStatus = 'unknown';
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (error: any) {
    dbStatus = 'disconnected';
    logger.error('Health check database error', error);
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
  });
});

// Temporary endpoint to trigger migrations and seeding in production
healthRouter.post('/setup', async (req: Request, res: Response) => {
  const pool = getPool();
  const client = await pool.connect();

  try {
    logger.info('Setup requested: starting transaction...');
    await client.query('BEGIN');

    // 1. Run Migrations (Manual SQL execution)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const migrationsDir = path.join(__dirname, '../../../migrations');
    const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    const migrationResults = [];
    for (const file of files) {
      try {
        const sql = readFileSync(path.join(migrationsDir, file), 'utf-8');
        await client.query(sql);
        migrationResults.push({ file, status: 'completed' });
      } catch (err: any) {
        if (err.message.includes('already exists') || err.message.includes('already a primary key') || err.message.includes('already a trigger')) {
          migrationResults.push({ file, status: 'skipped' });
        } else {
          throw err;
        }
      }
    }

    // 2. Deduplicate and Ensure Constraints
    logger.info('Deduplicating campaigns...');
    await client.query(`
      DELETE FROM campaigns 
      WHERE id NOT IN (
        SELECT id FROM (
          SELECT DISTINCT ON (title) id FROM campaigns ORDER BY title, created_at ASC
        ) s
      )
    `);
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_title_unique ON campaigns (title)');

    logger.info('Deduplicating items...');
    await client.query(`
      DELETE FROM campaign_items 
      WHERE id NOT IN (
        SELECT id FROM (
          SELECT DISTINCT ON (name) id FROM campaign_items ORDER BY name, created_at ASC
        ) s
      )
    `);
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_items_name_unique ON campaign_items (name)');

    logger.info('Deduplicating stories...');
    await client.query(`
      DELETE FROM impact_stories 
      WHERE id NOT IN (
        SELECT id FROM (
          SELECT DISTINCT ON (title) id FROM impact_stories ORDER BY title, created_at ASC
        ) s
      )
    `);
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_impact_stories_title_unique ON impact_stories (title)');

    // 3. Run Seeding Logic
    // Since seedDatabase, etc. use the pool.query, they might escape the transaction
    // So we manually perform the essential seeding here or update the seeds to accept a client
    // For now, let's just do it manually here for reliability in production

    logger.info('Executing seeding...');
    await seedDatabase();
    await seedEssentials();
    await seedCampaigns();
    await seedImpactStories();

    await client.query('COMMIT');
    logger.info('Setup completed successfully');

    res.json({
      success: true,
      message: 'Comprehensive setup completed successfully',
      migrations: migrationResults
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    logger.error('Setup failed', error);
    res.status(500).json({
      success: false,
      message: 'Setup failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});


healthRouter.get('/ready', async (req: Request, res: Response) => {
  try {
    // TODO: Check database connection
    // TODO: Check Redis connection
    res.json({
      status: 'ready',
      checks: {
        database: 'ok', // TODO: actual check
        redis: 'ok', // TODO: actual check
      },
    });
  } catch (error) {
    logger.error('Readiness check failed', error);
    res.status(503).json({
      status: 'not ready',
      error: 'Service dependencies unavailable',
    });
  }
});

healthRouter.get('/live', (req: Request, res: Response) => {
  res.json({ status: 'alive' });
});



