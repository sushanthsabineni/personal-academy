import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/cron/cleanup-data
 * 
 * Scheduled data cleanup endpoint
 * Should be called daily via cron job (Vercel Cron, GitHub Actions, etc.)
 * 
 * To set up with Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-data",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 * 
 * Authorization: Use CRON_SECRET environment variable
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Run cleanup of deleted user data
    const { data: cleanupData, error: cleanupError } = await supabase.rpc(
      'cleanup_deleted_user_data'
    )

    if (cleanupError) {
      console.error('cleanup_deleted_user_data error:', cleanupError)
      throw cleanupError
    }

    // Mark inactive accounts
    const { data: inactiveCount, error: inactiveError } = await supabase.rpc(
      'mark_inactive_accounts'
    )

    if (inactiveError) {
      console.error('mark_inactive_accounts error:', inactiveError)
      throw inactiveError
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      cleanup: cleanupData,
      inactiveAccountsMarked: inactiveCount,
    }

    console.log('Daily cleanup completed:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Cron cleanup error:', error)
    return NextResponse.json(
      {
        error: 'Cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Allow GET for manual testing (remove in production)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    message: 'Data cleanup cron endpoint',
    schedule: 'Daily at 2:00 AM UTC',
    jobs: [
      'cleanup_deleted_user_data - Removes data past 30-day deletion period',
      'mark_inactive_accounts - Flags accounts inactive for 6+ months',
    ],
    setup: 'Add CRON_SECRET to environment variables and configure cron job',
  })
}
