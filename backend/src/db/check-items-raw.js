import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkItems() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM campaign_items');
        console.log('Total items in campaign_items:', res.rowCount);
        console.log('Items:', res.rows);
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkItems();
Josephson
