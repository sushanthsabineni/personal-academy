import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type ProfileData = {
  credits_balance: number
}

/**
 * POST /api/referral/check-milestones
 * Checks if user reached new referral milestones and awards bonuses
 * Body: { userId?: string } (optional, uses session user if not provided)
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

    const { userId } = await request.json().catch(() => ({}))
    const targetUserId = userId || session.user.id

    // Get completed referral count
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', targetUserId)
      .eq('status', 'completed')

    if (referralsError) {
      console.error('check-milestones: referrals fetch error', referralsError)
      return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 })
    }

    const completedCount = referrals?.length || 0

    // Define milestones (matching platformConfig.ts)
    const milestones = [
      { count: 1, credits: 500, badge: 'First Referral' },
      { count: 5, credits: 5000, badge: 'Community Builder' },
      { count: 10, credits: 20000, badge: 'Influencer' },
      { count: 25, credits: 50000, badge: 'Ambassador' },
    ]

    // Check if user just reached a milestone
    const reachedMilestone = milestones.find(m => m.count === completedCount)

    if (!reachedMilestone) {
      return NextResponse.json({
        success: true,
        message: 'No milestone reached',
        completedCount,
      })
    }

    // Check if milestone already awarded
    const { data: existingTransaction } = await supabase
      .from('credits_transactions')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('type', 'bonus')
      .ilike('description', `%Milestone: ${reachedMilestone.count} referrals%`)
      .single()

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        message: 'Milestone already awarded',
        milestone: reachedMilestone,
      })
    }

    // Award milestone bonus
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('id', targetUserId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const typedProfile = profile as unknown as ProfileData
    const currentBalance = typedProfile.credits_balance || 0
    const newBalance = currentBalance + reachedMilestone.credits

    // Update user credits
    await supabase
      .from('profiles')
      .update({ credits_balance: newBalance } as never)
      .eq('id', targetUserId)

    // Create transaction record
    await supabase.from('credits_transactions').insert({
      user_id: targetUserId,
      amount: reachedMilestone.credits,
      type: 'bonus',
      description: `🏆 Milestone: ${reachedMilestone.count} referrals - ${reachedMilestone.badge}`,
      balance_after: newBalance,
    } as never)

    console.info('milestone:awarded', {
      userId: targetUserId,
      milestone: reachedMilestone,
      creditsAwarded: reachedMilestone.credits,
    })

    return NextResponse.json({
      success: true,
      message: `Milestone reached! ${reachedMilestone.credits} credits awarded`,
      milestone: reachedMilestone,
      newBalance,
    })
  } catch (error) {
    console.error('check-milestones error', error)
    return NextResponse.json(
      { error: 'Failed to check milestones' },
      { status: 500 }
    )
  }
}
