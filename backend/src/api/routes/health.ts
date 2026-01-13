import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import { getPool } from '../../db/connection.js';

export const healthRouter = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
  let dbStatus = 'unknown';
  let dbError = null;
  const hasUrl = !!process.env.DATABASE_URL;

  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (error: any) {
    dbStatus = 'disconnected';
    dbError = error.message;
    logger.error('Health check database error', error);
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    dbError: dbError,
    hasDatabaseUrl: hasUrl,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
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



