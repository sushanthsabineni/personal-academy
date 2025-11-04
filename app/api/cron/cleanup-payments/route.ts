import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/cron/cleanup-payments
 * 
 * Monthly payment records cleanup
 * Removes payment records older than 7 years per Indian tax law
 * 
 * Should be called monthly via cron job
 * 
 * To set up with Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-payments",
 *     "schedule": "0 3 1 * *"
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
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

    // Run cleanup of old payment records (7+ years)
    const { data: paymentData, error: paymentError } = await supabase.rpc(
      'cleanup_old_payment_records'
    )

    if (paymentError) {
      console.error('cleanup_old_payment_records error:', paymentError)
      throw paymentError
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      cleanup: paymentData,
    }

    console.log('Monthly payment cleanup completed:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Payment cleanup error:', error)
    return NextResponse.json(
      {
        error: 'Payment cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    message: 'Payment records cleanup cron endpoint',
    schedule: 'Monthly on 1st at 3:00 AM UTC',
    job: 'cleanup_old_payment_records - Removes records older than 7 years',
    retention: '7 years per Indian Income Tax Act',
    setup: 'Add CRON_SECRET to environment variables and configure cron job',
  })
}
