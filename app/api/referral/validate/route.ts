import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type ReferrerProfile = {
  id: string
  full_name: string | null
  referral_code: string
}

/**
 * POST /api/referral/validate
 * Validates if a referral code exists and is valid
 * Body: { code: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Find profile with this referral code
    const { data: referrer, error } = await supabase
      .from('profiles')
      .select('id, full_name, referral_code')
      .eq('referral_code', code.toUpperCase())
      .single()

    if (error || !referrer) {
      return NextResponse.json(
        { valid: false, error: 'Invalid referral code' },
        { status: 404 }
      )
    }

    const typedReferrer = referrer as unknown as ReferrerProfile

    return NextResponse.json({
      valid: true,
      referrerId: typedReferrer.id,
      referrerName: typedReferrer.full_name,
      code: typedReferrer.referral_code,
    })
  } catch (error) {
    console.error('referral:validate error', error)
    return NextResponse.json(
      { error: 'Failed to validate referral code' },
      { status: 500 }
    )
  }
}
