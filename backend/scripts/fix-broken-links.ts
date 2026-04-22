import { query } from '../src/db/connection.js';
import dotenv from 'dotenv';

dotenv.config();

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dssyfjokh';

const fixLinks = async () => {
    try {
        console.log("Searching for broken /uploads/ links in campaigns...");
        
        // Fix campaigns
        const campaigns = await query("SELECT id, image_url FROM campaigns WHERE image_url LIKE '/uploads/%'");
        for (const row of campaigns.rows) {
            const publicId = row.image_url.replace('/uploads/', '');
            const newUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
            console.log(`Fixing campaign ${row.id}: ${row.image_url} -> ${newUrl}`);
            await query("UPDATE campaigns SET image_url = $1 WHERE id = $2", [newUrl, row.id]);
        }

        // Fix impact stories (profile images)
        const stories = await query("SELECT id, profile_image_url FROM impact_stories WHERE profile_image_url LIKE '/uploads/%'");
        for (const row of stories.rows) {
            const publicId = row.profile_image_url.replace('/uploads/', '');
            const newUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
            console.log(`Fixing story profile ${row.id}: ${row.profile_image_url} -> ${newUrl}`);
            await query("UPDATE impact_stories SET profile_image_url = $1 WHERE id = $2", [newUrl, row.id]);
        }

        // Fix story media
        const storyMedia = await query("SELECT id, media_url FROM story_media WHERE media_url LIKE '/uploads/%'");
        for (const row of storyMedia.rows) {
            const publicId = row.media_url.replace('/uploads/', '');
            const newUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
            console.log(`Fixing story media ${row.id}: ${row.media_url} -> ${newUrl}`);
            await query("UPDATE story_media SET media_url = $1 WHERE id = $2", [newUrl, row.id]);
        }

        // Fix campaign items
        const items = await query("SELECT id, image_url FROM campaign_items WHERE image_url LIKE '/uploads/%'");
        for (const row of items.rows) {
            const publicId = row.image_url.replace('/uploads/', '');
            const newUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
            console.log(`Fixing item ${row.id}: ${row.image_url} -> ${newUrl}`);
            await query("UPDATE campaign_items SET image_url = $1 WHERE id = $2", [newUrl, row.id]);
        }

        console.log("Cleanup completed!");
    } catch (error) {
        console.error("Cleanup failed:", error);
    } finally {
        process.exit(0);
    }
};

fixLinks();
