import test from 'node:test';
import assert from 'node:assert';

const API_BASE = 'http://localhost:3000/api/v1';

test('Security: Unauthorized access to Admin stats', async () => {
    const response = await fetch(`${API_BASE}/admin/stats`);
    const data = await response.json();

    // Should be 401 Unauthorized
    assert.strictEqual(response.status, 401);
    assert.strictEqual(data.success, false);
});

test('Security: Spoofed JWT Token', async () => {
    const response = await fetch(`${API_BASE}/admin/stats`, {
        headers: {
            'Authorization': 'Bearer NOT_A_REAL_TOKEN'
        }
    });

    // Should still be 401 or 403
    assert.ok([401, 403].includes(response.status));
});

test('Security: Malformed Authorization Header', async () => {
    const response1 = await fetch(`${API_BASE}/admin/stats`, {
        headers: { 'Authorization': 'Basic dXNlcjpwYXNz' } // Wrong type
    });
    assert.strictEqual(response1.status, 401);

    const response2 = await fetch(`${API_BASE}/admin/stats`, {
        headers: { 'Authorization': 'Bearer ' + 'A'.repeat(1000) } // Overflow attempt
    });
    assert.ok(response2.status >= 401);
});

test('Security: Accessing Donor info as Guest', async () => {
    const response = await fetch(`${API_BASE}/donations`);
    // Public donation creation might be allowed, but listing isn't
    assert.strictEqual(response.status, 401);
});
