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

async function runTests() {
    console.log('🚀 Starting Donation Admin Tests (Manual Entry & Delete)...');

    const token = await getAuthToken('super@test.local');

    let testDonationId;

    // 1. Create Manual Donation
    test('Donation: Create Manual', async () => {
        const payload = {
            amount: 50,
            currency: 'USD',
            paymentMethod: 'cash',
            status: 'succeeded',
            donorName: 'Test Admin Donor',
            donorEmail: 'admin-donor@test.local'
        };

        const res = await fetch(`${API_BASE}/donations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        assert.strictEqual(res.status, 201);
        assert.ok(data.data.id);
        testDonationId = data.data.id;
    });

    // 2. Read (List - Admin)
    test('Donation: List (Admin)', async () => {
        const res = await fetch(`${API_BASE}/admin/donations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        const found = data.data.find(d => d.id === testDonationId);
        assert.ok(found);
    });

    // 3. Delete Donation
    test('Donation: Delete', async () => {
        const res = await fetch(`${API_BASE}/donations/${testDonationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        assert.strictEqual(res.status, 200);

        // Verify soft delete in DB
        const dbRes = await pool.query('SELECT is_deleted FROM donations WHERE id = $1', [testDonationId]);
        assert.strictEqual(dbRes.rows[0].is_deleted, true);
    });

    console.log('\n✅ Donation Admin Tests Complete.');
    await pool.end();
}

runTests().catch(err => {
    console.error('❌ Tests failed:', err);
    process.exit(1);
});
