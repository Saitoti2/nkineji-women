import { query } from './connection.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, bcryptRounds);

    // Get super_admin role ID
    const roleResult = await query<{ id: string }>(
      "SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1"
    );

    if (roleResult.rows.length === 0) {
      throw new Error('Super admin role not found. Run migrations first.');
    }

    const superAdminRoleId = roleResult.rows[0].id;

    // Create default super admin user
    const userResult = await query<{ id: string }>(
      `INSERT INTO users (name, email, password_hash, role_id, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['Super Admin', 'admin@maasaimarawomen.org', hashedPassword, superAdminRoleId, true]
    );

    if (userResult.rows.length > 0) {
      logger.info('Super admin user created');
      logger.warn(`Default admin password: ${defaultPassword} - PLEASE CHANGE THIS!`);
    } else {
      logger.info('Super admin user already exists');
    }

    // Create sample campaign
    await query(
      `INSERT INTO campaigns (title, description, goal_amount, status, created_by)
       SELECT $1, $2, $3, $4, u.id
       FROM users u
       WHERE u.email = 'admin@maasaimarawomen.org'
       ON CONFLICT DO NOTHING`,
      [
        'Rescue & Safe House Fund',
        'Provide shelter, care, and rehabilitation for girls rescued from harmful traditional practices.',
        75000,
        'active'
      ]
    );

    logger.info('Sample campaign created');

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding error', error);
      process.exit(1);
    });
}

export { seedDatabase };



