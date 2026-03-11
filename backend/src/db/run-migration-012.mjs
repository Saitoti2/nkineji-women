import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSingleMigration(file) {
    const sql = readFileSync(file, 'utf8');
    const client = await pool.connect();
    try {
        console.log(`Executing: ${file}`);
        await client.query(sql);
        console.log('SUCCESS');
    } catch (e) {
        console.error(`FAILED: ${file}`, e.message);
    } finally {
        client.release();
    }
}

const migrationFile = join(__dirname, '../migrations/012_auth_rbac_enhancements.sql');
runSingleMigration(migrationFile).then(() => pool.end());
