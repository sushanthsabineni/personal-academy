/**
 * Supabase Edge Function: Data Cleanup Scheduler
 * 
 * This function should be triggered via Supabase's pg_cron extension
 * or called via a cron job service (e.g., GitHub Actions, Vercel Cron)
 * 
 * Schedule:
 * - Daily: cleanup_deleted_user_data(), mark_inactive_accounts()
 * - Monthly: cleanup_old_payment_records()
 * 
 * Setup Instructions:
 * 
 * Option 1: Supabase pg_cron (Recommended)
 * Run this in Supabase SQL Editor:
 * 
 * -- Enable pg_cron extension
 * CREATE EXTENSION IF NOT EXISTS pg_cron;
 * 
 * -- Daily cleanup at 2 AM UTC
 * SELECT cron.schedule(
 *   'daily-data-cleanup',
 *   '0 2 * * *',
 *   $$ SELECT cleanup_deleted_user_data(); $$
 * );
 * 
 * SELECT cron.schedule(
 *   'daily-mark-inactive',
 *   '0 3 * * *',
 *   $$ SELECT mark_inactive_accounts(); $$
 * );
 * 
 * -- Monthly payment cleanup on 1st of month at 3 AM UTC
 * SELECT cron.schedule(
 *   'monthly-payment-cleanup',
 *   '0 3 1 * *',
 *   $$ SELECT cleanup_old_payment_records(); $$
 * );
 * 
 * Option 2: Vercel Cron
 * Add to vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/cleanup-data",
 *       "schedule": "0 2 * * *"
 *     },
 *     {
 *       "path": "/api/cron/cleanup-payments",
 *       "schedule": "0 3 1 * *"
 *     }
 *   ]
 * }
 * 
 * Option 3: GitHub Actions
 * Create .github/workflows/cleanup.yml with schedule trigger
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  try {
    // Verify authorization (cron secret or service key)
    const authHeader = req.headers.get('Authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')
    
    if (!authHeader?.includes(cronSecret || 'none')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { job } = await req.json()

    let result

    switch (job) {
      case 'cleanup_deleted_data':
        // Run daily cleanup of deleted user data
        const { data: cleanupData, error: cleanupError } = await supabase.rpc(
          'cleanup_deleted_user_data'
        )
        
        if (cleanupError) throw cleanupError
        result = cleanupData
        break

      case 'mark_inactive':
        // Mark accounts inactive for 6+ months
        const { data: inactiveData, error: inactiveError } = await supabase.rpc(
          'mark_inactive_accounts'
        )
        
        if (inactiveError) throw inactiveError
        result = { accounts_marked_inactive: inactiveData }
        break

      case 'cleanup_payments':
        // Monthly cleanup of payment records older than 7 years
        const { data: paymentData, error: paymentError } = await supabase.rpc(
          'cleanup_old_payment_records'
        )
        
        if (paymentError) throw paymentError
        result = paymentData
        break

      case 'run_all':
        // Run all cleanup jobs (for manual trigger)
        const results = []
        
        const { data: d1 } = await supabase.rpc('cleanup_deleted_user_data')
        results.push({ job: 'cleanup_deleted_data', result: d1 })
        
        const { data: d2 } = await supabase.rpc('mark_inactive_accounts')
        results.push({ job: 'mark_inactive', result: d2 })
        
        const { data: d3 } = await supabase.rpc('cleanup_old_payment_records')
        results.push({ job: 'cleanup_payments', result: d3 })
        
        result = results
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid job type' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    console.log(`Cleanup job '${job}' completed:`, result)

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
