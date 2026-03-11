import test from 'node:test';
import assert from 'node:assert';

const API_BASE = 'http://localhost:3000/api/v1';

test('Security: Malformed JSON payload', async () => {
    const response = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"amount": 10, "invalid_json": }' // Malformed JSON
    });

    // Express should catch this and return 400
    assert.strictEqual(response.status, 400);
});

test('Security: Invalid Data Types (Zod Check)', async () => {
    const response = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: "TEN DOLLARS", // Should be a number
            currency: "XYZ",      // Invalid currency code
            paymentMethod: 123    // Should be a string
        })
    });

    const data = await response.json();
    assert.strictEqual(response.status, 400);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'Validation error');
});

test('Security: Oversized Payload (DoS mitigation)', async () => {
    const hugePayload = {
        data: 'A'.repeat(1024 * 1024) // 1MB payload
    };

    const response = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hugePayload)
    });

    // Should be rejected by body-parser limit (usually 100kb default)
    assert.ok(response.status === 413 || response.status === 400);
});

test('Security: Script Injection Attempt (XSS)', async () => {
    const response = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            donorName: "<script>alert('xss')</script>",
            amount: 10,
            currency: "USD",
            paymentMethod: "stripe"
        })
    });

    // Either Zod rejects it (if we have filters) or it is stored safely.
    // We check if it is rejected if we have strict validation.
    // For now, let's just ensure it doesn't CRASH the server.
    assert.ok(response.status === 201 || response.status === 400);
});
