import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * POST /api/account/delete
 * Schedules account deletion with 30-day grace period
 * User data will be retained for 6 months after deletion
 * Payment records retained for 7 years per Indian tax law
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (!session || sessionError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { confirmEmail } = await request.json()

    // Verify email confirmation matches
    if (confirmEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Email confirmation does not match' },
        { status: 400 }
      )
    }

    // Call database function to schedule deletion
    const { error } = await supabase.rpc('schedule_account_deletion', {
      user_uuid: session.user.id,
    } as never)

    if (error) {
      console.error('account:delete error', error)
      return NextResponse.json(
        { error: 'Failed to schedule account deletion' },
        { status: 500 }
      )
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Account deletion scheduled',
      details: {
        deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        gracePeriodDays: 30,
        dataRetention: {
          userData: '6 months after deletion',
          paymentRecords: '7 years (tax compliance)',
        },
      },
    })
  } catch (error) {
    console.error('account:delete error', error)
    return NextResponse.json(
      { error: 'Failed to schedule account deletion' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/account/delete
 * Cancels scheduled account deletion (within 30-day grace period)
 */
export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (!session || sessionError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call database function to cancel deletion
    const { error } = await supabase.rpc('cancel_account_deletion', {
      user_uuid: session.user.id,
    } as never)

    if (error) {
      console.error('account:cancel-deletion error', error)
      return NextResponse.json(
        { error: 'Failed to cancel account deletion' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account deletion cancelled successfully',
    })
  } catch (error) {
    console.error('account:cancel-deletion error', error)
    return NextResponse.json(
      { error: 'Failed to cancel account deletion' },
      { status: 500 }
    )
  }
}
