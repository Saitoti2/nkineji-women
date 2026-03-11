import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tests = [
    'security-sanity.test.mjs',
    'security-sql.test.mjs',
    'security-auth.test.mjs',
    'security-validation.test.mjs'
];

async function runTest(file) {
    console.log(`\n🚀 Running: ${file}`);
    return new Promise((resolve) => {
        const child = spawn('node', ['--test', join(__dirname, file)], { stdio: 'inherit' });
        child.on('close', (code) => {
            resolve(code === 0);
        });
    });
}

async function runSuite() {
    console.log('=========================================');
    console.log('🔒 NKINEJI SECURITY & INTEGRITY SUITE 🔒');
    console.log('=========================================');

    let passedCount = 0;
    for (const test of tests) {
        const success = await runTest(test);
        if (success) passedCount++;
    }

    console.log('\n=========================================');
    console.log(`OVERALL RESULT: ${passedCount}/${tests.length} SUITES PASSED`);
    console.log('=========================================');

    if (passedCount < tests.length) {
        process.exit(1);
    }
}

runSuite();
