import { query } from './connection.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

async function inspect() {
    try {
        const res = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'donations';
    `);
        console.log('Columns in donations table:', res.rows.map(r => r.column_name));

        const tables = await query(`
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
    `);
        console.log('Tables in DB:', tables.rows.map(r => r.table_name));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

inspect();
