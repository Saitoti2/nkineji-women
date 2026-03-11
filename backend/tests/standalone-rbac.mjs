// STANDALONE RBAC TEST
// Run with: JWT_SECRET=... node tests/standalone-rbac.mjs

import jwt from 'jsonwebtoken';
import pkg from 'pg';
const { Pool } = pkg;
import assert from 'node:assert';
import test from 'node:test';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const API_BASE = 'http://localhost:3000/api/v1';
const JWT_SECRET = process.env.JWT_SECRET;

async function getAuthToken(email) {
    const userResult = await pool.query(
        `SELECT u.id, u.email, r.name as role, r.permissions 
     FROM users u 
     JOIN roles r ON u.role_id = r.id 
     WHERE u.email = $1`,
        [email]
    );

    if (userResult.rows.length === 0) {
        throw new Error(`User ${email} not found.`);
    }

    const user = userResult.rows[0];
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

async function seedTestUsers() {
    console.log('🌱 Seeding test users...');
    const roles = await pool.query('SELECT id, name FROM roles');
    const roleMap = roles.rows.reduce((acc, r) => ({ ...acc, [r.name]: r.id }), {});

    const testUsers = [
        { email: 'super@test.local', name: 'Super Admin', role: 'super_admin' },
        { email: 'chief@test.local', name: 'Chief Admin', role: 'chief_admin' },
        { email: 'watcher@test.local', name: 'Watcher Admin', role: 'admin' },
        { email: 'donor@test.local', name: 'Donor User', role: 'donor' }
    ];

    for (const user of testUsers) {
        const roleId = roleMap[user.role];
        if (!roleId) continue;
        await pool.query(
            `INSERT INTO users (email, name, role_id, is_active, password_hash)
       VALUES ($1, $2, $3, TRUE, 'NO_PASSWORD_FOR_TESTS')
       ON CONFLICT (email) DO UPDATE SET role_id = $3`,
            [user.email, user.name, roleId]
        );
    }
}

async function run() {
    await seedTestUsers();

    const superToken = await getAuthToken('super@test.local');
    const chiefToken = await getAuthToken('chief@test.local');
    const watcherToken = await getAuthToken('watcher@test.local');
    const donorToken = await getAuthToken('donor@test.local');

    console.log('🚀 Running tests...');

    test('RBAC: Access Control', async (t) => {
        await t.test('Super Admin -> User List (Success)', async () => {
            const res = await fetch(`${API_BASE}/admin/users`, {
                headers: { 'Authorization': `Bearer ${superToken}` }
            });
            assert.strictEqual(res.status, 200);
        });

        await t.test('Chief Admin -> User List (Success)', async () => {
            const res = await fetch(`${API_BASE}/admin/users`, {
                headers: { 'Authorization': `Bearer ${chiefToken}` }
            });
            assert.strictEqual(res.status, 200);
        });

        await t.test('Watcher Admin -> User List (Forbidden)', async () => {
            const res = await fetch(`${API_BASE}/admin/users`, {
                headers: { 'Authorization': `Bearer ${watcherToken}` }
            });
            assert.strictEqual(res.status, 403);
        });

        await t.test('Donor -> Admin Stats (Forbidden)', async () => {
            const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
                headers: { 'Authorization': `Bearer ${donorToken}` }
            });
            assert.strictEqual(res.status, 403);
        });
    });

    await pool.end();
}

run().catch(console.error);
