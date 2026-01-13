import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { query } from './connection.js';

dotenv.config();

export async function seedImpactStories() {

    try {
        console.log('Seeding impact stories...');

        // 1. Get a campaign ID
        const campaignResult = await query('SELECT id FROM campaigns LIMIT 1');
        const campaignId = campaignResult.rows[0]?.id;

        // 2. Create Impact Stories
        const stories = [
            {
                beneficiary_name: 'Zahara Kamau',
                beneficiary_age: 32,
                location: 'Kajiado County',
                profile_image_url: 'https://images.unsplash.com/photo-1531123897727-8f129e16fd47?auto=format&fit=crop&q=80&w=800',
                short_bio: 'A mother of four who transformed her family’s future through our entrepreneurship program.',
                title: 'From Struggle to Success: Zahara’s New Dawn',
                content: `Zahara used to walk 10 kilometers daily to fetch water, leaving little time for anything else. When the Inua Mama Initiative brought a clean water borehole to her village and provided her with a small business grant, her life changed forever.\n\nToday, she runs a successful beadwork business that employs three other women in her community. "This is more than just money," Zahara says. "It is dignity."`,
                impact_summary: 'Established a sustainable business and provided clean water access for 500+ villagers.',
                campaign_id: campaignId,
                status: 'published'
            },
            {
                beneficiary_name: 'David Omondi',
                beneficiary_age: 12,
                location: 'Nairobi (Kibera)',
                profile_image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
                short_bio: 'A bright student who returned to school after being out for two years.',
                title: 'Back to the Classroom: David’s Dream Reborn',
                content: `David was forced to drop out of school when his family could no longer afford fees and uniforms. He spent his days helping at a local market. Through the Education First campaign, David received a full scholarship.\n\nHe is now the top of his class and dreams of becoming an engineer. "I want to build bridges that connect people," David tells us with a beaming smile.`,
                impact_summary: 'Full primary education sponsorship and vocational training for parents.',
                campaign_id: campaignId,
                status: 'published'
            }
        ];

        for (const s of stories) {
            const storyResult = await query(
                `INSERT INTO impact_stories (beneficiary_name, beneficiary_age, location, profile_image_url, short_bio, title, content, impact_summary, campaign_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (title) DO UPDATE SET
            beneficiary_name = EXCLUDED.beneficiary_name,
            beneficiary_age = EXCLUDED.beneficiary_age,
            location = EXCLUDED.location,
            profile_image_url = EXCLUDED.profile_image_url,
            short_bio = EXCLUDED.short_bio,
            content = EXCLUDED.content,
            impact_summary = EXCLUDED.impact_summary,
            campaign_id = COALESCE(impact_stories.campaign_id, EXCLUDED.campaign_id),
            status = EXCLUDED.status
         RETURNING id`,
                [s.beneficiary_name, s.beneficiary_age, s.location, s.profile_image_url, s.short_bio, s.title, s.content, s.impact_summary, s.campaign_id, s.status]
            );

            const storyId = storyResult.rows[0].id;

            // Add dummy media if none exists

            try {
                const existingMedia = await query('SELECT id FROM story_media WHERE story_id = $1', [storyId]);
                if (existingMedia.rows.length === 0) {
                    await query(
                        `INSERT INTO story_media (story_id, media_type, media_url, caption)
                 VALUES ($1, $2, $3, $4)`,
                        [storyId, 'image', s.profile_image_url, `Our beneficiary ${s.beneficiary_name} in their home.`]
                    );
                }
            } catch (mediaError: any) {
                console.error(`Failed to seed media for story ${storyId}: ${mediaError.message}`);
            }

            // Add a dummy comment if none exists
            try {
                const existingComments = await query('SELECT id FROM impact_comments WHERE story_id = $1', [storyId]);
                if (existingComments.rows.length === 0) {
                    await query(
                        `INSERT INTO impact_comments (story_id, user_name, content, status)
                 VALUES ($1, $2, $3, $4)`,
                        [storyId, 'Sarah Johnson', 'This is so inspiring! Thank you for the update.', 'approved']
                    );
                }
            } catch (commentError: any) {
                console.error(`Failed to seed comment for story ${storyId}: ${commentError.message}`);
            }
        }




        const __filename = fileURLToPath(import.meta.url);
        const isDirectRun = process.argv[1] && (
            process.argv[1].endsWith('seed-impact-stories.ts') ||
            process.argv[1].endsWith('seed-impact-stories.js')
        );

        if (isDirectRun) {
            seedImpactStories()
                .then(() => {
                    console.log('Seeding completed');
                    process.exit(0);
                })
                .catch((error) => {
                    console.error('Seeding error', error);
                    process.exit(1);
                });
        }

