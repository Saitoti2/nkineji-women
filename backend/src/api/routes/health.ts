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

  try {
    const pool = getPool();
    logger.info('Setup requested: running migrations...');

    // 1. Run Migrations
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
        if (err.message.includes('already exists') || err.message.includes('already a primary key')) {
          migrationResults.push({ file, status: 'skipped (already exists)' });
        } else {
          throw err;
        }
      }
    }

    logger.info('Migrations complete. Ensuring unique constraints for seeding...');

    // Ensure unique indexes for ON CONFLICT logic
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_title_unique ON campaigns (title)');
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_items_name_unique ON campaign_items (name)');

    logger.info('Constraints verified. Running comprehensive seeding...');

    // 2. Base Seeding (Admin User, etc.)
    await seedDatabase();

    // 3. Seed Essentials
    await seedEssentials();

    // 4. Seed Campaigns
    await seedCampaigns();

    // 5. Seed Impact Stories
    await seedImpactStories();

    res.json({
      success: true,
      message: 'Comprehensive setup completed successfully',
      migrations: migrationResults
    });

  } catch (error: any) {
    logger.error('Setup failed', error);
    res.status(500).json({
      success: false,
      message: 'Setup failed',
      error: error.message
    });
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



