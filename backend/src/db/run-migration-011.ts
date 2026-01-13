import { query } from './connection.js';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, '../../migrations/011_payment_settings.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running migration 011_payment_settings...');
        await query(sql);
        console.log('Migration 011_payment_settings completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

runMigration();
