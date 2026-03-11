const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    const sql = fs.readFileSync(path.join(__dirname, '../../migrations/012_auth_rbac_enhancements.sql'), 'utf8');
    console.log('Running migration...');
    await pool.query(sql);
    console.log('Done!');
    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
