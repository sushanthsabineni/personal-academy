#!/usr/bin/env node
/* eslint-disable */

/**
 * Link Validation Test Runner
 * 
 * This script provides a user-friendly way to run link validation tests
 * with helpful output and error handling.
 */

const { execSync } = require('child_process');
const path = require('path');

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Helper to print colored messages
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function printHeader() {
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════╗', colors.cyan);
  log('║                                                       ║', colors.cyan);
  log('║     LINK VALIDATION TEST SUITE                        ║', colors.cyan);
  log('║     Personal Academy - Next.js Application            ║', colors.cyan);
  log('║                                                       ║', colors.cyan);
  log('╚═══════════════════════════════════════════════════════╝', colors.cyan);
  console.log('\n');
}

function printUsage() {
  log('Usage:', colors.bright);
  console.log('  node run-tests.js [option]\n');
  
  log('Options:', colors.bright);
  console.log('  (none)      Run all tests');
  console.log('  ui          Run tests in interactive UI mode');
  console.log('  report      Open the test report');
  console.log('  debug       Run tests in debug mode');
  console.log('  headed      Run tests with visible browser');
  console.log('  help        Show this help message\n');
  
  log('Examples:', colors.bright);
  console.log('  node run-tests.js');
  console.log('  node run-tests.js ui');
  console.log('  node run-tests.js report\n');
}

function checkDevServer() {
  log('🔍 Checking dev server...', colors.yellow);
  
  try {
    const http = require('http');
    
    return new Promise((resolve) => {
      const req = http.get('http://localhost:3000', (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          log('✓ Dev server is running on port 3000', colors.green);
          resolve(true);
        } else {
          resolve(false);
        }
      });
      
      req.on('error', () => {
        log('ℹ Dev server not running - Playwright will start it automatically', colors.cyan);
        resolve(false);
      });
      
      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
  } catch (error) {
    return Promise.resolve(false);
  }
}

function runTests(mode = 'default') {
  let command;
  
  switch (mode) {
    case 'ui':
      log('🎨 Starting tests in UI mode...', colors.magenta);
      command = 'npx playwright test --ui';
      break;
    
    case 'report':
      log('📊 Opening test report...', colors.magenta);
      command = 'npx playwright show-report';
      break;
    
    case 'debug':
      log('🐛 Starting tests in debug mode...', colors.magenta);
      command = 'npx playwright test --debug';
      break;
    
    case 'headed':
      log('👀 Starting tests with visible browser...', colors.magenta);
      command = 'npx playwright test --headed';
      break;
    
    default:
      log('🚀 Running all link validation tests...', colors.magenta);
      command = 'npx playwright test';
  }
  
  console.log('\n');
  
  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    
    console.log('\n');
    log('✓ Tests completed successfully!', colors.green);
    
    if (mode === 'default') {
      console.log('\n');
      log('💡 Tip: View detailed HTML report with: npm run test:links:report', colors.cyan);
    }
    
  } catch (error) {
    console.log('\n');
    log('✗ Tests failed or were interrupted', colors.red);
    
    if (mode === 'default') {
      console.log('\n');
      log('Troubleshooting:', colors.yellow);
      console.log('  • Check if port 3000 is available');
      console.log('  • Verify all dependencies are installed (npm install)');
      console.log('  • Review failed tests in the output above');
      console.log('  • Try running: npm run test:links:ui for interactive debugging\n');
    }
    
    process.exit(1);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'default';
  
  if (mode === 'help' || mode === '-h' || mode === '--help') {
    printHeader();
    printUsage();
    return;
  }
  
  printHeader();
  
  // Check dev server status
  await checkDevServer();
  
  console.log('\n');
  
  // Run tests
  runTests(mode);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n');
    log('Error:', colors.red);
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { runTests };
