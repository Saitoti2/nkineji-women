// require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const assert = require('node:assert');
const test = require('node:test');

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

    // Helper fetch since we are in CJS and might not have global fetch in old node
    const myFetch = async (url, options) => {
        const response = await fetch(url, options);
        return response;
    };

    // --- Dashboard Stats (All admins should see) ---
    test('RBAC: Super Admin can access dashboard stats', async () => {
        const res = await myFetch(`${API_BASE}/admin/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${superToken}` }
        });
        assert.strictEqual(res.status, 200);
    });

    test('RBAC: Chief Admin can access dashboard stats', async () => {
        const res = await myFetch(`${API_BASE}/admin/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${chiefToken}` }
        });
        assert.strictEqual(res.status, 200);
    });

    test('RBAC: Watcher Admin can access dashboard stats', async () => {
        const res = await myFetch(`${API_BASE}/admin/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${watcherToken}` }
        });
        assert.strictEqual(res.status, 200);
    });

    test('RBAC: Donor CANNOT access dashboard stats', async () => {
        const res = await myFetch(`${API_BASE}/admin/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${donorToken}` }
        });
        assert.strictEqual(res.status, 403);
    });

    // --- User Management (Only Super and Chief should see) ---
    test('RBAC: Super Admin can access user list', async () => {
        const res = await myFetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${superToken}` }
        });
        assert.strictEqual(res.status, 200);
    });

    test('RBAC: Chief Admin can access user list', async () => {
        const res = await myFetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${chiefToken}` }
        });
        assert.strictEqual(res.status, 200);
    });

    test('RBAC: Watcher Admin CANNOT access user list', async () => {
        const res = await myFetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${watcherToken}` }
        });
        assert.strictEqual(res.status, 403);
    });

    console.log('\n🧹 Cleaning up test users...');
    await pool.end();
}

runTests().catch(err => {
    console.error('❌ Tests failed:', err);
    process.exit(1);
});
