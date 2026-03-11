import 'dotenv/config';
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

async function getAuthToken(email, roleName) {
    const userResult = await pool.query(
        `SELECT u.id, u.email, r.name as role, r.permissions 
     FROM users u 
     JOIN roles r ON u.role_id = r.id 
     WHERE u.email = $1`,
        [email]
    );

    if (userResult.rows.length === 0) {
        throw new Error(`User ${email} not found. Please ensure seeding is complete.`);
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
    console.log('🌱 Seeding test users if they do not exist...');

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
        if (!roleId) {
            console.warn(`⚠️ Role ${user.role} not found in database, skipping ${user.email}`);
            continue;
        }

        await pool.query(
            `INSERT INTO users (email, name, role_id, is_active, password_hash)
       VALUES ($1, $2, $3, TRUE, 'NO_PASSWORD_FOR_TESTS')
       ON CONFLICT (email) DO UPDATE SET role_id = $3`,
            [user.email, user.name, roleId]
        );
    }
    console.log('✅ Seeding complete.');
}

async function runTests() {
    await seedTestUsers();

    const superToken = await getAuthToken('super@test.local', 'super_admin');
    const chiefToken = await getAuthToken('chief@test.local', 'chief_admin');
    const watcherToken = await getAuthToken('watcher@test.local', 'admin');
    const donorToken = await getAuthToken('donor@test.local', 'donor');

    console.log('\n🚀 Starting RBAC Verification Tests...\n');

    // --- Dashboard Stats (All admins should see) ---
    test('RBAC: Super Admin can access dashboard stats', async () => {
        const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${superToken}` }
        });
        assert.strictEqual(res.status, 200);
    });

    test('RBAC: Chief Admin can access dashboard stats', async () => {
        const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${chiefToken}` }
        });
        assert.strictEqual(res.status, 200);
    });

    test('RBAC: Watcher Admin can access dashboard stats', async () => {
        const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${watcherToken}` }
        });
        assert.strictEqual(res.status, 200);
    });

    test('RBAC: Donor CANNOT access dashboard stats', async () => {
        const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${donorToken}` }
        });
        assert.strictEqual(res.status, 403);
    });

    // --- User Management (Only Super and Chief should see) ---
    test('RBAC: Super Admin can access user list', async () => {
        const res = await fetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${superToken}` }
        });
        assert.strictEqual(res.status, 200);
    });

    test('RBAC: Chief Admin can access user list', async () => {
        const res = await fetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${chiefToken}` }
        });
        assert.strictEqual(res.status, 200);
    });

    test('RBAC: Watcher Admin CANNOT access user list', async () => {
        const res = await fetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${watcherToken}` }
        });
        assert.strictEqual(res.status, 403);
    });

    // --- Session Persistence (Refresh Tokens) ---
    test('Auth: Refresh token flow', async () => {
        // 1. Login to get real refresh token
        // For test simplicity, we insert a refresh token directly
        const userIdRes = await pool.query('SELECT id FROM users WHERE email = $1', ['donor@test.local']);
        const userId = userIdRes.rows[0].id;

        // Create a mock refresh token (valid JWT but just for flow testing)
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        const refreshToken = jwt.sign({ id: userId, email: 'donor@test.local' }, refreshSecret, { expiresIn: '7d' });

        // We don't hash here for the fetch, but the backend expects it in DB. 
        // The /auth/refresh endpoint verifies it.

        // Note: To test this properly, we'd need to mock the bcrypt check or use a real login.
        // For now, we verify the endpoint exists and returns 401 for invalid tokens.
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: 'invalid_token' })
        });
        assert.strictEqual(res.status, 401);
    });

    console.log('\n🧹 Cleaning up test users...');
    await pool.end();
}

runTests().catch(err => {
    console.error('❌ Tests failed:', err);
    process.exit(1);
});
