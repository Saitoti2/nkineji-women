import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import { getPool } from '../../db/connection.js';
import { runMigrations } from '../../db/migrate.js';
import { seedDatabase } from '../../db/seed.js';
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
    logger.info('Setup requested: running migrations...');

    // Improved migration logic that continues on "already exists" errors
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const migrationsDir = path.join(__dirname, '../../../migrations');
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const results = [];
    for (const file of files) {
      try {
        const sql = readFileSync(path.join(migrationsDir, file), 'utf-8');
        await getPool().query(sql);
        results.push({ file, status: 'completed' });
      } catch (err: any) {
        if (err.message.includes('already exists') || err.message.includes('already a primary key')) {
          results.push({ file, status: 'skipped (already exists)' });
        } else {
          throw err;
        }
      }
    }

    logger.info('Migrations processing complete. Results:', results);

    logger.info('Running seeding...');
    await seedDatabase();

    // Seed Impact Stories if none exist
    const storyCount = await getPool().query('SELECT count(*) FROM impact_stories');
    if (parseInt(storyCount.rows[0].count) === 0) {
      logger.info('Seeding impact stories...');
      const campaignResult = await getPool().query('SELECT id FROM campaigns LIMIT 1');
      if (campaignResult.rows.length > 0) {
        const campaignId = campaignResult.rows[0].id;
        await getPool().query(
          `INSERT INTO impact_stories (beneficiary_name, beneficiary_age, location, profile_image_url, short_bio, title, content, impact_summary, campaign_id, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          ['Zahara Kamau', 32, 'Kajiado County', 'https://images.unsplash.com/photo-1531123897727-8f129e16fd47?auto=format&fit=crop&q=80&w=800', 'A mother of four who transformed her family’s future.', 'From Struggle to Success: Zahara’s New Dawn', 'Zahara used to walk 10 kilometers daily to fetch water...', 'Established a sustainable business.', campaignId, 'published']
        );
      }
    }

    res.json({
      success: true,
      message: 'Migrations and seeding completed',
      migrations: results
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



