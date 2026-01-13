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

  let currentStep = 'initializing';
  try {
    logger.info('Setup requested: starting migrations...');
    currentStep = 'migrations';

    // 1. Run Migrations (Outside transaction to avoid poisoning)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const migrationsDir = path.join(__dirname, '../../../migrations');
    const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    const migrationResults = [];
    for (const file of files) {
      try {
        const sql = readFileSync(path.join(migrationsDir, file), 'utf-8');
        await pool.query(sql);
        migrationResults.push({ file, status: 'completed' });
      } catch (err: any) {
        if (err.message.includes('already exists') || err.message.includes('already a primary key') || err.message.includes('already a trigger')) {
          migrationResults.push({ file, status: 'skipped' });
        } else {
          logger.warn(`Migration ${file} failed: ${err.message}`);
          migrationResults.push({ file, status: 'failed', error: err.message });
        }
      }
    }

    logger.info('Migrations processing finished. Starting deduplication transaction...');
    await client.query('BEGIN');

    // 2. Deduplicate and Ensure Constraints
    currentStep = 'deduplication: campaigns';
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

    currentStep = 'deduplication: items';
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

    currentStep = 'deduplication: stories';
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
    await client.query('COMMIT');
    logger.info('Deduplication committed. Starting seeding...');

    // 3. Run Seeding Logic (Uses pool.query, must be outside the client transaction to avoid deadlocks)
    currentStep = 'seeding';
    await seedDatabase();
    await seedEssentials();
    await seedCampaigns();
    await seedImpactStories();

    logger.info('Setup completed successfully');

    res.json({
      success: true,
      message: 'Comprehensive setup completed successfully',
      migrations: migrationResults
    });

  } catch (error: any) {
    if (currentStep !== 'migrations') {
      try { await client.query('ROLLBACK'); } catch (e) { }
    }
    logger.error(`Setup failed at step [${currentStep}]`, error);
    res.status(500).json({
      success: false,
      message: `Setup failed at step [${currentStep}]`,
      error: error.message,
      step: currentStep
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



