import dotenv from 'dotenv';
import { query } from './connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        console.log('Running migration 007_impact_stories.sql...');

        const migrationPath = path.join(__dirname, '../../migrations/007_impact_stories.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await query(sql);

        console.log('✅ Migration 007 completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
