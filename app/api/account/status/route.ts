import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * GET /api/account/status
 * Returns account status including deletion schedule
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (!session || sessionError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get profile with deletion info
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, deleted_at, deletion_scheduled_at, last_activity_at, inactive_since, credits_balance, is_premium')
      .eq('id', session.user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const typedProfile = profile as {
      id: string
      email: string
      deleted_at: string | null
      deletion_scheduled_at: string | null
      last_activity_at: string | null
      inactive_since: string | null
      credits_balance: number
      is_premium: boolean
    }

    // Get credits expiring soon (within 30 days)
    const { data: expiringCredits } = await supabase
      .from('credits_transactions')
      .select('amount, expires_at')
      .eq('user_id', session.user.id)
      .gt('amount', 0)
      .not('expires_at', 'is', null)
      .gte('expires_at', new Date().toISOString())
      .lte('expires_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('expires_at', { ascending: true })

    const expiringAmount = (expiringCredits as any[])?.reduce((sum, credit) => sum + (credit?.amount || 0), 0) || 0
    const nearestExpiry = (expiringCredits as any[])?.[0]?.expires_at || null

    let daysUntilExpiry = null
    if (nearestExpiry) {
      const days = Math.ceil((new Date(nearestExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      daysUntilExpiry = days > 0 ? days : 0
    }

    const isScheduledForDeletion = !!typedProfile.deletion_scheduled_at
    const daysUntilDeletion = typedProfile.deleted_at
      ? Math.ceil((new Date(typedProfile.deleted_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    return NextResponse.json({
      accountStatus: isScheduledForDeletion ? 'pending_deletion' : 'active',
      deletionScheduledAt: typedProfile.deletion_scheduled_at,
      deletionDate: typedProfile.deleted_at,
      daysUntilDeletion,
      lastActivity: typedProfile.last_activity_at,
      inactiveSince: typedProfile.inactive_since,
      credits: {
        balance: typedProfile.credits_balance || 0,
        isPremium: typedProfile.is_premium || false,
        expiringAmount,
        daysUntilExpiry,
      },
      dataRetentionPolicy: {
        gracePeriod: 30,
        userDataRetention: '30 days',
        paymentRetention: '7 years (legal requirement)',
      },
    })
  } catch (error) {
    console.error('account:status error', error)
    return NextResponse.json(
      { error: 'Failed to fetch account status' },
      { status: 500 }
    )
  }
}
