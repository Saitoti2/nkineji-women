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
                title: 'Nkineji GirlChild Education Sponsorship',
                description: 'Cover school fees, uniforms, and supplies for marginalized girls in Nkineji. Empowering the next generation through education in the heart of the Maasai Mara.',
                goal_amount: 35000,
                image_url: '/images/campaigns/girlchild-education.png',
                category: 'education',
                status: 'active'
            },
            {
                title: 'Marginalized Mothers\' Healthcare Fund',
                description: 'Critical prenatal and postnatal care for women in the remote heart of the Mara. Ensuring safe deliveries and healthy starts for both mother and child.',
                goal_amount: 50000,
                image_url: '/images/campaigns/maternal-health.png',
                category: 'health',
                status: 'active'
            },
            {
                title: 'Nkineji Mentorship & Safe Space',
                description: 'A dedicated center in Nkineji providing a safe environment, mentorship, and educational support for girls at risk of early marriage and FGM.',
                goal_amount: 45000,
                image_url: '/images/campaigns/safe-space.png',
                category: 'rescue',
                status: 'active'
            },
            {
                title: 'Mobile Maternal Health Clinic',
                description: 'Bringing life-saving healthcare directly to women in the most marginalized parts of the Maasai Mara. Mobile units equipped for maternal health outreach.',
                goal_amount: 60000,
                image_url: '/images/campaigns/mobile-clinic.png',
                category: 'health',
                status: 'active'
            }
        ];

        for (const campaign of campaigns) {
            await query(
                `INSERT INTO campaigns (title, description, goal_amount, image_url, category, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (title) DO UPDATE SET 
            description = EXCLUDED.description,
            goal_amount = EXCLUDED.goal_amount,
            image_url = EXCLUDED.image_url,
            category = EXCLUDED.category,
            status = EXCLUDED.status`,
                [campaign.title, campaign.description, campaign.goal_amount, campaign.image_url, campaign.category, campaign.status]
            );
        }


        logger.info('Campaigns seeded successfully');
    } catch (error) {
        logger.error('Seeding failed', error);
    }
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

