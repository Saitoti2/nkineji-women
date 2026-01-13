import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import { getPool } from '../../db/connection.js';
import { runMigrations } from '../../db/migrate.js';
import { seedDatabase } from '../../db/seed.js';

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
    await runMigrations();

    logger.info('Migrations complete: running seeding...');
    await seedDatabase();

    res.json({
      success: true,
      message: 'Migrations and seeding completed successfully'
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



