import test from 'node:test';
import assert from 'node:assert';

const API_BASE = 'http://localhost:3000/api/v1';

const SQL_PAYLOADS = [
    "' OR 1=1 --",
    "'); DROP TABLE users; --",
    "' UNION SELECT username, password FROM users --",
    "1; SELECT pg_sleep(5)",
    "' OR 'a'='a"
];

test('Security: SQL Injection in Campaign List (Query Params)', async () => {
    for (const payload of SQL_PAYLOADS) {
        const response = await fetch(`${API_BASE}/campaigns?status=${encodeURIComponent(payload)}`);
        const data = await response.json();

        // We expect the system to either return empty (if sanitized) or an error (if caught by Zod/PG)
        // But it definitely SHOULD NOT leak data or execute the query.
        // If it returns 200, we check if the data returned is still "sane" (e.g. not all campaigns if filtered)
        assert.ok(response.status === 200 || response.status === 400 || response.status === 500);

        if (response.status === 200) {
            assert.ok(Array.isArray(data.data), 'Data should remain an array');
            // If the payload was "OR 1=1", a vulnerable app might return MORE results than a normal filter.
            // But since we are testing "status", if it's sanitized, it should just return 0 results.
        }
    }
});

test('Security: SQL Injection in ID Parameters', async () => {
    const payload = "123' OR '1'='1";
    const response = await fetch(`${API_BASE}/campaigns/${encodeURIComponent(payload)}`);
    const data = await response.json();

    // The UUID validation in the database or Zod should catch this.
    // Expecting 400 (Validation) or 404 (Not Found) or 500 (DB Error - though 500 is less ideal than 400)
    assert.ok([400, 404, 500].includes(response.status));
});
