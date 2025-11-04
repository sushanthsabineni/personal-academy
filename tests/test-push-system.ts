/**
 * Push Notification System Test Script
 * Tests database setup and API endpoints
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface TestResult {
  name: string
  passed: boolean
  message: string
}

const results: TestResult[] = []

function logTest(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${name}: ${message}`)
}

async function testDatabaseTables() {
  console.log('\n📊 Testing Database Tables...\n')

  // Test push_subscriptions table
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .limit(1)

    if (error && error.code === '42P01') {
      logTest(
        'push_subscriptions table',
        false,
        'Table does not exist. Run migration: 004_push_subscriptions.sql'
      )
    } else if (error) {
      logTest(
        'push_subscriptions table',
        false,
        `Error: ${error.message}`
      )
    } else {
      logTest(
        'push_subscriptions table',
        true,
        'Table exists and is accessible'
      )
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logTest('push_subscriptions table', false, `Exception: ${message}`)
  }

  // Test user_preferences table
  try {
    const { error } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1)

    if (error && error.code === '42P01') {
      logTest(
        'user_preferences table',
        false,
        'Table does not exist. Run migrations: 002_user_preferences.sql and 003_update_user_preferences.sql'
      )
    } else if (error) {
      logTest(
        'user_preferences table',
        false,
        `Error: ${error.message}`
      )
    } else {
      logTest(
        'user_preferences table',
        true,
        'Table exists and is accessible'
      )
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logTest('user_preferences table', false, `Exception: ${message}`)
  }
}

async function testUserPreferencesColumns() {
  console.log('\n📋 Testing user_preferences Columns...\n')

  try {
    const { error } = await supabase
      .from('user_preferences')
      .select('push_course_complete, push_credits_low, push_referrals')
      .limit(1)

    if (error && error.message.includes('column')) {
      logTest(
        'user_preferences push columns',
        false,
        'Required push notification columns are missing'
      )
    } else if (error) {
      logTest(
        'user_preferences push columns',
        false,
        `Error: ${error.message}`
      )
    } else {
      logTest(
        'user_preferences push columns',
        true,
        'All push notification columns exist'
      )
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logTest('user_preferences push columns', false, `Exception: ${message}`)
  }
}

async function testVAPIDKeys() {
  console.log('\n🔑 Testing VAPID Keys...\n')

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!publicKey) {
    logTest(
      'VAPID Public Key',
      false,
      'NEXT_PUBLIC_VAPID_PUBLIC_KEY not found in .env.local'
    )
  } else {
    logTest(
      'VAPID Public Key',
      true,
      `Found: ${publicKey.substring(0, 20)}...`
    )
  }

  if (!privateKey) {
    logTest(
      'VAPID Private Key',
      false,
      'VAPID_PRIVATE_KEY not found in .env.local'
    )
  } else {
    logTest(
      'VAPID Private Key',
      true,
      `Found: ${privateKey.substring(0, 20)}...`
    )
  }
}

async function testServiceWorker() {
  console.log('\n⚙️ Testing Service Worker...\n')

  try {
    const fs = await import('fs')
    const swPath = join(__dirname, '../public/sw.js')
    
    if (fs.existsSync(swPath)) {
      const content = fs.readFileSync(swPath, 'utf-8')
      
      if (content.includes('push') && content.includes('notification')) {
        logTest(
          'Service Worker',
          true,
          'Service worker file exists and contains push notification code'
        )
      } else {
        logTest(
          'Service Worker',
          false,
          'Service worker exists but missing push notification handlers'
        )
      }
    } else {
      logTest(
        'Service Worker',
        false,
        'Service worker file (public/sw.js) not found'
      )
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logTest('Service Worker', false, `Exception: ${message}`)
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints (file existence)...\n')

  try {
    const fs = await import('fs')
    
    const endpoints = [
      { path: '../app/api/push/subscribe/route.ts', name: 'Subscribe API' },
      { path: '../app/api/push/unsubscribe/route.ts', name: 'Unsubscribe API' },
      { path: '../app/api/push/send/route.ts', name: 'Send Notification API' },
      { path: '../app/api/push/vapid-public-key/route.ts', name: 'VAPID Public Key API' }
    ]

    for (const endpoint of endpoints) {
      const fullPath = join(__dirname, endpoint.path)
      if (fs.existsSync(fullPath)) {
        logTest(endpoint.name, true, 'File exists')
      } else {
        logTest(endpoint.name, false, 'File not found')
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logTest('API Endpoints Check', false, `Exception: ${message}`)
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('📝 TEST SUMMARY')
  console.log('='.repeat(60))

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  console.log(`\nTotal Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(1)}%`)

  if (failed > 0) {
    console.log('\n⚠️  FAILED TESTS:')
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  • ${r.name}: ${r.message}`)
      })
    
    console.log('\n📚 NEXT STEPS:')
    console.log('  1. Run missing migrations in Supabase SQL Editor')
    console.log('  2. Generate VAPID keys if missing (npx web-push generate-vapid-keys)')
    console.log('  3. Add VAPID keys to .env.local')
    console.log('  4. Restart the development server')
  } else {
    console.log('\n🎉 All tests passed! Push notification system is ready.')
  }

  console.log('\n' + '='.repeat(60))
}

async function runTests() {
  console.log('🚀 Starting Push Notification System Tests...')
  console.log('='.repeat(60))

  await testDatabaseTables()
  await testUserPreferencesColumns()
  await testVAPIDKeys()
  await testServiceWorker()
  await testAPIEndpoints()
  await printSummary()

  process.exit(results.some(r => !r.passed) ? 1 : 0)
}

runTests()
