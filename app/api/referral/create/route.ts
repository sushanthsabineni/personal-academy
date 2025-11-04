import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type ReferrerData = {
  id: string
  referral_code: string
}

/**
 * POST /api/referral/create
 * Creates a referral relationship between referrer and referee
 * Body: { referralCode: string }
 * Must be called after user signs up
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

    const { referralCode } = await request.json()

    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      )
    }

    // Find referrer by code
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, referral_code')
      .eq('referral_code', referralCode.toUpperCase())
      .single()

    if (referrerError || !referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      )
    }

    const typedReferrer = referrer as unknown as ReferrerData

    // Prevent self-referral
    if (typedReferrer.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot refer yourself' },
        { status: 400 }
      )
    }

    // Check if referral already exists
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referee_id', session.user.id)
      .single()

    if (existingReferral) {
      return NextResponse.json(
        { error: 'You have already used a referral code' },
        { status: 400 }
      )
    }

    // Create referral record
    const { data: referral, error: createError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: typedReferrer.id,
        referee_id: session.user.id,
        referral_code: referralCode.toUpperCase(),
        status: 'pending', // Will become 'completed' after first purchase
      } as never)
      .select()
      .single()

    if (createError) {
      console.error('referral:create error', createError)
      return NextResponse.json(
        { error: 'Failed to create referral' },
        { status: 500 }
      )
    }

    // Update referee's profile with referred_by
    await supabase
      .from('profiles')
      .update({ referred_by: typedReferrer.id } as never)
      .eq('id', session.user.id)

    const typedReferral = referral as { id: string }

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully!',
      referralId: typedReferral.id,
    })
  } catch (error) {
    console.error('referral:create error', error)
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    )
  }
}
