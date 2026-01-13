import { query, closePool, getPool } from './connection.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

export async function seedCampaigns() {

    try {
        logger.info('Seeding campaigns...');
        const pool = getPool();
        await pool.query('SELECT 1');

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

        for (const campaign of campaigns) {
            await query(
                `INSERT INTO campaigns (title, description, goal_amount, image_url, category, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
                [campaign.title, campaign.description, campaign.goal_amount, campaign.image_url, campaign.category, campaign.status]
            );
        }

        logger.info('Campaigns seeded successfully');
    } catch (error) {
        logger.error('Seeding failed', error);
    }

    // Run if called directly
    if (import.meta.url === `file://${process.argv[1]}`) {
        seedCampaigns()
            .then(() => {
                logger.info('Seeding completed');
                process.exit(0);
            })
            .catch((error) => {
                logger.error('Seeding error', error);
                process.exit(1);
            });
    }

