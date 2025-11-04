import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type ProfileData = {
  referral_code: string
  full_name: string | null
  email: string
}

type ReferralData = {
  status: string
  referrer_bonus_credits: number | null
}

/**
 * GET /api/referral/stats
 * Fetches authenticated user's referral statistics
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

    // Get user's referral code
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_code, full_name, email')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get referral statistics
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', session.user.id)
      .order('created_at', { ascending: false })

    const totalReferrals = referrals?.length || 0
    const typedReferrals = (referrals || []) as unknown as ReferralData[]
    const completedReferrals = typedReferrals.filter(r => r.status === 'completed').length || 0
    const pendingReferrals = typedReferrals.filter(r => r.status === 'pending').length || 0
    
    const creditsEarned = typedReferrals.reduce((sum, r) => sum + (r.referrer_bonus_credits || 0), 0) || 0

    // Get referral details with referee information
    const { data: referralHistory } = await supabase
      .from('referrals')
      .select(`
        id,
        status,
        referrer_bonus_credits,
        referee_bonus_credits,
        referee_first_purchase_at,
        referee_first_purchase_amount,
        created_at,
        completed_at,
        referee:profiles!referee_id (
          full_name,
          email
        )
      `)
      .eq('referrer_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    const typedProfile = profile as unknown as ProfileData

    return NextResponse.json({
      referralCode: typedProfile.referral_code,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://personalacademy.app'}/signup?ref=${typedProfile.referral_code}`,
      stats: {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        creditsEarned,
      },
      referrals: referralHistory || [],
    })
  } catch (error) {
    console.error('referral:stats error', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    )
  }
}
