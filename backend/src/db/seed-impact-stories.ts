import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { query } from './connection.js';

dotenv.config();

export async function seedImpactStories() {

    try {
        console.log('Seeding impact stories...');

        // 1. Get campaign IDs
        const campaignResult = await query('SELECT id FROM campaigns LIMIT 1');
        const defaultCampaignId = campaignResult.rows[0]?.id;

        const getCampaignId = async (title: string) => {
            const res = await query('SELECT id FROM campaigns WHERE title = $1 LIMIT 1', [title]);
            return res.rows[0]?.id || defaultCampaignId;
        };

        const eduCampaignId = await getCampaignId('Girls\' Education Sponsorship');
        const maternalCampaignId = await getCampaignId('Maternal Health Outreach');
        const enterpriseCampaignId = await getCampaignId('Women\'s Micro-Enterprise Fund');

        // 2. Create Impact Stories
        const stories = [
            {
                beneficiary_name: 'Leshalon Nolaram',
                beneficiary_age: 12,
                location: 'Loita Hills',
                profile_image_url: '/images/impact-stories/leshalon.png',
                short_bio: 'A bright Maasai girl pursuing her dream of becoming a teacher through our girl-child education scholarship.',
                title: 'Breaking Barriers: Leshalon\'s Education Dream',
                content: `In many parts of the Mara, girls still face the threat of early marriage. Leshalon, a brilliant 12-year-old, was rescued from this fate and enrolled in our partner boarding school. "My books are my future," she says. "When I finish school, I will teach other Maasai girls that they can be anything they want." Your support provides her safe housing, tuition, and a chance to rewrite her story.`,
                impact_summary: 'Fully sponsored primary education and safe housing for a vulnerable Maasai girl.',
                campaign_id: eduCampaignId,
                status: 'published'
            },
            {
                beneficiary_name: 'Noonkipa Tipaya',
                beneficiary_age: 24,
                location: 'Musiara Plains',
                profile_image_url: '/images/impact-stories/noonkipa.png',
                short_bio: 'A young Maasai mother who received life-saving support through our Maternal Outreach program.',
                title: 'Hope for Mothers: Noonkipa\'s Safe Delivery',
                content: `Living miles away from the nearest clinic, Noonkipa feared for her life during a complicated pregnancy. Our mobile maternal outreach unit provided her with prenatal checkups and emergency transport for a safe hospital delivery. "Without the outreach clinic, I don't think I would be holding my healthy daughter today," she shares. We continue to support her and her baby with postnatal care and nutrition.`,
                impact_summary: 'Provided emergency maternal transport and comprehensive prenatal/postnatal care.',
                campaign_id: maternalCampaignId,
                status: 'published'
            },
            {
                beneficiary_name: 'Sinteyia Ole Naurori',
                beneficiary_age: 39,
                location: 'Aitong Community',
                profile_image_url: '/images/impact-stories/sinteyia.png',
                short_bio: 'A community leader empowered through our Women Aid initiative and vocational training.',
                title: 'Leading the Way: Sinteyia\'s Community Growth',
                content: `Sinteyia was one of the first women in Aitong to join our vocational training center. Now, she leads a group of 30 women in a sustainable livestock management program. "We used to wait for others to help us. Now, we support our families and even help other widows in our village," Sinteyia explains. Her leadership has transformed her family's economy and inspired a whole generation of women.`,
                impact_summary: 'Empowered 30+ women with vocational skills and sustainable livelihood leadership.',
                campaign_id: enterpriseCampaignId,
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



        console.log('Impact stories seeding completed successfully');
    } catch (error: any) {
        console.error('Seeding impact stories failed:', error.message);
        throw error;
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
