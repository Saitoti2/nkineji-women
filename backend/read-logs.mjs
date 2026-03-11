import fs from 'fs';
const logPath = './logs/error.log';
try {
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n').slice(-20);
    console.log(lines.join('\n'));
} catch (e) {
    console.error('Error reading log:', e.message);
}
