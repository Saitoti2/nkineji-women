import test from 'node:test';
import assert from 'node:assert';

const API_BASE = 'http://localhost:3000/api/v1';

test('Sanity Check: Root API endpoint', async () => {
    const response = await fetch('http://localhost:3000/');
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.version, '1.0.0');
    assert.ok(data.message.includes('Nkineji'));
});

test('Sanity Check: Health endpoint', async () => {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.status, 'healthy');
});

test('Sanity Check: 404 handler', async () => {
    const response = await fetch(`${API_BASE}/non-existent-route`);
    const data = await response.json();

    assert.strictEqual(response.status, 404);
    assert.strictEqual(data.success, false);
});
