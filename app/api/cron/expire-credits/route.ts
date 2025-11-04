import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/cron/expire-credits
 * Expires credits older than 365 days
 * Called daily by cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Call the expire_old_credits function
    const { data, error } = await supabase.rpc('expire_old_credits')

    if (error) {
      console.error('❌ Credit expiration error:', error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    console.log('✅ Credits expired successfully:', data)

    return NextResponse.json({
      success: true,
      ...data,
    })
  } catch (error) {
    console.error('❌ Credit expiration failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/expire-credits
 * Returns endpoint information (for testing/documentation)
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/cron/expire-credits',
    method: 'POST',
    description: 'Expires credits older than 365 days',
    schedule: 'Daily at 3:00 AM UTC',
    authentication: 'Bearer token required (CRON_SECRET)',
    response: {
      success: 'boolean',
      expired_users: 'number of users affected',
      total_credits_expired: 'total credits expired',
      timestamp: 'ISO 8601 timestamp',
    },
  })
}
