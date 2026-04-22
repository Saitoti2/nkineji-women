import { v2 as cloudinary } from 'cloudinary';
import { query } from '../src/db/connection.js';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localPath: string, folder: string) => {
    try {
        // Resolve path: check uploads/ (in backend) and public/images/ (in root)
        let absolutePath = '';
        if (localPath.startsWith('/images/')) {
            // These are usually in root/public/images/
            absolutePath = path.join(process.cwd(), '..', 'public', localPath);
        } else if (localPath.startsWith('/uploads/')) {
            // These are in backend/uploads/
            absolutePath = path.join(process.cwd(), localPath.substring(1));
        } else {
            // Fallback for relative paths
            absolutePath = path.join(process.cwd(), localPath);
        }
        
        if (!fs.existsSync(absolutePath)) {
            console.warn(`File not found: ${absolutePath}`);
            return null;
        }

        const result = await cloudinary.uploader.upload(absolutePath, {
            folder: `mara-bloom/${folder}`,
        });
        return result.secure_url;
    } catch (error) {
        console.error(`Upload failed for ${localPath}:`, error);
        return null;
    }
};

const migrateTable = async (tableName: string, idColumn: string, urlColumn: string, folder: string) => {
    console.log(`Starting migration for table: ${tableName}...`);
    // Search for both /uploads/ and /images/ prefixes
    const records = await query(`
        SELECT ${idColumn}, ${urlColumn} 
        FROM ${tableName} 
        WHERE ${urlColumn} LIKE '/uploads/%' 
           OR ${urlColumn} LIKE '/images/%'
    `);
    
    let successCount = 0;
    let failCount = 0;

    for (const record of records.rows) {
        const localPath = record[urlColumn];
        console.log(`Migrating ${localPath}...`);
        
        const cloudinaryUrl = await uploadToCloudinary(localPath, folder);
        
        if (cloudinaryUrl) {
            await query(`UPDATE ${tableName} SET ${urlColumn} = $1 WHERE ${idColumn} = $2`, [cloudinaryUrl, record[idColumn]]);
            successCount++;
        } else {
            failCount++;
        }
    }
    
    console.log(`Finished ${tableName}: ${successCount} succeeded, ${failCount} failed.`);
};

const runMigration = async () => {
    try {
        console.log('--- Cloudinary Migration Started ---');
        
        await migrateTable('campaign_items', 'id', 'image_url', 'items');
        await migrateTable('campaigns', 'id', 'image_url', 'campaigns');
        await migrateTable('impact_stories', 'id', 'profile_image_url', 'stories/profiles');
        await migrateTable('story_media', 'id', 'media_url', 'stories/media');

        console.log('--- Migration Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
