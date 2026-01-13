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

    // 3. Seed Campaigns (4 campaigns from bank-and-mobile-payments branch)
    const campaigns = [
      {
        title: 'Rescue & Safe House Fund',
        description: 'Provide shelter, care, and rehabilitation for girls rescued from harmful traditional practices. Our safe house offers 24/7 support, trauma counseling, and legal aid.',
        goal_amount: 75000,
        image_url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop&q=80&auto=format',
        category: 'rescue',
        status: 'active'
      },
      {
        title: 'Women\'s Micro-Enterprise Fund',
        description: 'Seed capital and training to help women start sustainable small businesses. Includes business planning, market linkages, and ongoing mentorship.',
        goal_amount: 50000,
        image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=800&fit=crop&q=80&auto=format',
        category: 'economic',
        status: 'active'
      },
      {
        title: 'Girls\' Education Sponsorship',
        description: 'Cover school fees, uniforms, and supplies for girls from primary to university. Every girl deserves the chance to learn and thrive.',
        goal_amount: 30000,
        image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=800&fit=crop&q=80&auto=format',
        category: 'education',
        status: 'active'
      },
      {
        title: 'Maternal Health Outreach',
        description: 'Mobile clinics bringing prenatal care and safe delivery services to remote communities. Saving lives, one mother at a time.',
        goal_amount: 45000,
        image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=800&fit=crop&q=80&auto=format',
        category: 'health',
        status: 'active'
      }
    ];

    for (const c of campaigns) {
      await pool.query(
        `INSERT INTO campaigns (title, description, goal_amount, image_url, category, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (title) DO UPDATE SET description = $2, goal_amount = $3, image_url = $4, category = $5, status = $6`,
        [c.title, c.description, c.goal_amount, c.image_url, c.category, c.status]
      );
    }

    // 4. Seed Essentials
    const essentials = [
      { name: 'Sanitary Pads (Pack of 8)', price: 1.50, img: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?q=80&w=2670&auto=format&fit=crop' },
      { name: 'School Textbook', price: 12.00, img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2673&auto=format&fit=crop' },
      { name: 'School Uniform Set', price: 25.00, img: 'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2672&auto=format&fit=crop' }
    ];

    for (const e of essentials) {
      await pool.query(
        `INSERT INTO campaign_items (name, description, unit_price, image_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO UPDATE SET unit_price = $3, image_url = $4`,
        [e.name, `${e.name} essentials`, e.price, e.img]
      );
    }

    // 5. Seed Impact Stories
    const campaignResult = await pool.query('SELECT id FROM campaigns LIMIT 1');
    if (campaignResult.rows.length > 0) {
      const campaignId = campaignResult.rows[0].id;
      await pool.query(
        `INSERT INTO impact_stories (beneficiary_name, beneficiary_age, location, profile_image_url, short_bio, title, content, impact_summary, campaign_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT DO NOTHING`,
        ['Zahara Kamau', 32, 'Kajiado County', 'https://images.unsplash.com/photo-1531123897727-8f129e16fd47?auto=format&fit=crop&q=80&w=800', 'A mother of four who transformed her family’s future.', 'From Struggle to Success: Zahara’s New Dawn', 'Zahara used to walk 10 kilometers daily to fetch water...', 'Established a sustainable business.', campaignId, 'published']
      );
    }

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



