import { query } from './connection.js';
import dotenv from 'dotenv';

dotenv.config();

async function inspect() {
    try {
        const stories = await query('SELECT title, profile_image_url FROM impact_stories');
        console.log('Current Impact Stories:', stories.rows);

        const campaigns = await query('SELECT title, image_url FROM campaigns');
        console.log('Current Campaigns:', campaigns.rows);
    } catch (e) {
        console.error(e);
    }
}

inspect();
