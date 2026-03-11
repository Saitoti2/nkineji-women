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
    console.log('🚀 Starting Beneficiary CRUD Tests...');

    // Use an existing admin email from seeding or previous tests
    // Using super@test.local which we know exists from rbac-verification
    const token = await getAuthToken('super@test.local');

    let testBeneficiaryId;

    // 1. Create
    test('Beneficiary: Create', async () => {
        const payload = {
            fullName: 'Test Beneficiary',
            gender: 'female',
            dateOfBirth: '2000-01-01',
            contactInfo: { phone: '123456789', email: 'test@beneficiary.local', address: 'Test Village' }
        };

        const res = await fetch(`${API_BASE}/admin/beneficiaries`, {
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
        testBeneficiaryId = data.data.id;
    });

    // 2. Read (List)
    test('Beneficiary: List', async () => {
        const res = await fetch(`${API_BASE}/admin/beneficiaries`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        assert.strictEqual(res.status, 200);
        assert.ok(Array.isArray(data.data));
        const found = data.data.find(b => b.id === testBeneficiaryId);
        assert.ok(found);
    });

    // 3. Update
    test('Beneficiary: Update', async () => {
        const payload = {
            fullName: 'Updated Name',
            gender: 'other',
            contactInfo: { phone: '987654321' }
        };

        const res = await fetch(`${API_BASE}/admin/beneficiaries/${testBeneficiaryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        assert.strictEqual(res.status, 200);

        // Verify in DB
        const dbRes = await pool.query('SELECT gender FROM beneficiaries WHERE id = $1', [testBeneficiaryId]);
        assert.strictEqual(dbRes.rows[0].gender, 'other');
    });

    // 4. Delete
    test('Beneficiary: Delete', async () => {
        const res = await fetch(`${API_BASE}/admin/beneficiaries/${testBeneficiaryId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        assert.strictEqual(res.status, 200);

        // Verify soft delete in DB
        const dbRes = await pool.query('SELECT is_deleted FROM beneficiaries WHERE id = $1', [testBeneficiaryId]);
        assert.strictEqual(dbRes.rows[0].is_deleted, true);
    });

    console.log('\n✅ Beneficiary CRUD Tests Complete.');
    await pool.end();
}

runTests().catch(err => {
    console.error('❌ Tests failed:', err);
    process.exit(1);
});
