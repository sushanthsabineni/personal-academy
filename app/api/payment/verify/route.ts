import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type PaymentRecord = {
  id: string
  amount: number
  credits_purchased: number
  razorpay_order_id: string
}

type ProfileRecord = {
  credits_balance: number
}

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

    const body = await request.json()
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = body

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Payment verification not configured' },
        { status: 500 },
      )
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    if (generatedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .eq('user_id', session.user.id)
      .single()

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const typedPayment = payment as unknown as PaymentRecord

    await supabase
      .from('payments')
      .update({
        razorpay_payment_id: paymentId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      } as never)
      .eq('razorpay_order_id', orderId)

    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('id', session.user.id)
      .single()

    const typedProfile = profile as unknown as ProfileRecord
    const currentCredits = typedProfile?.credits_balance || 0
    const newBalance = currentCredits + typedPayment.credits_purchased

    // Update credits balance AND set is_premium to true
    await supabase
      .from('profiles')
      .update({ 
        credits_balance: newBalance,
        is_premium: true  // User becomes premium after any purchase
      } as never)
      .eq('id', session.user.id)

    await supabase.from('credits_transactions').insert({
      user_id: session.user.id,
      amount: typedPayment.credits_purchased,
      type: 'purchase',
      description: `Purchased ${typedPayment.credits_purchased} credits`,
      balance_after: newBalance,
      payment_id: typedPayment.id,
    } as never)

    // Process referral bonus (20% to both referrer and referee)
    try {
      const { data: bonusProcessed } = await supabase
        .rpc('process_referral_bonus', {
          referee_uuid: session.user.id,
          purchase_amount: typedPayment.amount,
          purchase_credits: typedPayment.credits_purchased,
        } as never)

      if (bonusProcessed) {
        console.info('payment:verify referral bonus awarded', { orderId })
        
        // Check and award milestone bonuses
        try {
          const cookieStore = await cookies()
          const cookieHeader = (cookieStore as any)
            .getAll?.()
            .map((c: any) => `${c.name}=${c.value}`)
            .join('; ')
          const headers: Record<string, string> = { 'Content-Type': 'application/json' }
          if (cookieHeader) {
            headers['Cookie'] = cookieHeader
          }
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/referral/check-milestones`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ userId: session.user.id }),
          })
        } catch (err) {
          console.error('milestone check failed', err)
        }
      }
    } catch (bonusError) {
      console.error('payment:verify referral bonus error', bonusError)
      // Don't fail the payment if bonus fails
    }

    console.info('payment:verify completed', { orderId, paymentId })

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      credits: newBalance,
      creditsAdded: typedPayment.credits_purchased,
      paymentId,
      orderId,
    })
  } catch (error) {
    console.error('payment:verify error', error)
    return NextResponse.json(
      { error: 'Payment verification failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
