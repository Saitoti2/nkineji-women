#!/usr/bin/env node

/**
 * Development Environment Setup Checker
 * Run with: node check-setup.js
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, name) {
  try {
    execSync(command, { stdio: 'ignore' });
    log(`✅ ${name} is installed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${name} is not installed or not in PATH`, 'red');
    return false;
  }
}

function checkFile(path, name) {
  if (existsSync(path)) {
    log(`✅ ${name} exists`, 'green');
    return true;
  } else {
    log(`❌ ${name} not found`, 'red');
    return false;
  }
}

function checkNodeModules(path, name) {
  if (existsSync(join(path, 'node_modules'))) {
    log(`✅ ${name} dependencies installed`, 'green');
    return true;
  } else {
    log(`❌ ${name} dependencies not installed`, 'yellow');
    log(`   Run: cd ${path} && npm install`, 'blue');
    return false;
  }
}

async function main() {
  log('\n🔍 Checking Development Environment Setup\n', 'bold');

  // Check system requirements
  log('📋 System Requirements:', 'bold');
  const nodeOk = checkCommand('node --version', 'Node.js');
  const npmOk = checkCommand('npm --version', 'npm');
  const gitOk = checkCommand('git --version', 'Git');
  
  if (nodeOk) {
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      if (majorVersion >= 18) {
        log(`   Node.js version: ${nodeVersion} ✅`, 'green');
      } else {
        log(`   Node.js version: ${nodeVersion} (requires 18+) ⚠️`, 'yellow');
      }
    } catch (error) {
      // Already handled above
    }
  }

  // Check PostgreSQL (optional for frontend-only development)
  log('\n🗄️  Database (Optional for Backend):', 'bold');
  const pgOk = checkCommand('psql --version', 'PostgreSQL');
  if (pgOk) {
    log('   💡 For backend development, ensure PostGIS extension is available', 'blue');
  }

  // Check project files
  log('\n📁 Project Structure:', 'bold');
  checkFile('package.json', 'Frontend package.json');
  checkFile('backend/package.json', 'Backend package.json');
  checkFile('vite.config.ts', 'Vite configuration');
  checkFile('tailwind.config.ts', 'Tailwind configuration');
  checkFile('.env', 'Frontend environment file');
  checkFile('backend/.env', 'Backend environment file');

  // Check dependencies
  log('\n📦 Dependencies:', 'bold');
  const frontendDepsOk = checkNodeModules('.', 'Frontend');
  const backendDepsOk = checkNodeModules('backend', 'Backend');

  // Check git status
  log('\n🌿 Git Status:', 'bold');
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    log(`   Current branch: ${branch}`, 'blue');
    
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status) {
      log(`   Working directory: Has uncommitted changes`, 'yellow');
    } else {
      log(`   Working directory: Clean`, 'green');
    }
  } catch (error) {
    log('   Git repository status could not be determined', 'yellow');
  }

  // Check if servers can start
  log('\n🚀 Development Servers:', 'bold');
  
  // Check if ports are available
  try {
    const netstat = execSync('lsof -i :5173 -i :3000', { encoding: 'utf8', stdio: 'pipe' });
    if (netstat.includes(':5173')) {
      log('   Port 5173 (Frontend): In use', 'yellow');
    } else {
      log('   Port 5173 (Frontend): Available', 'green');
    }
    if (netstat.includes(':3000')) {
      log('   Port 3000 (Backend): In use', 'yellow');
    } else {
      log('   Port 3000 (Backend): Available', 'green');
    }
  } catch (error) {
    log('   Port check: Could not determine port status', 'blue');
  }

  // Summary and next steps
  log('\n📋 Next Steps:', 'bold');
  
  if (!frontendDepsOk) {
    log('   1. Install frontend dependencies: npm install', 'blue');
  }
  
  if (!backendDepsOk) {
    log('   2. Install backend dependencies: cd backend && npm install', 'blue');
  }
  
  if (!existsSync('.env')) {
    log('   3. Set up frontend environment: Copy .env.example to .env', 'blue');
  }
  
  if (!existsSync('backend/.env')) {
    log('   4. Set up backend environment: Copy backend/.env.example to backend/.env', 'blue');
  }
  
  log('\n🎯 Ready to start development:', 'bold');
  log('   Frontend only: npm run dev', 'green');
  log('   Full stack: npm run dev (terminal 1) + cd backend && npm run dev (terminal 2)', 'green');
  
  log('\n📚 Documentation:', 'bold');
  log('   - PROJECT_SETUP.md - Complete setup guide', 'blue');
  log('   - README.md - Project overview', 'blue');
  log('   - backend/README.md - Backend documentation', 'blue');
  log('   - BACKEND_STATUS.md - Implementation status', 'blue');
}

main().catch(console.error);