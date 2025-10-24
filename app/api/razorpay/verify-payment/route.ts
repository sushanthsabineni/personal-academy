import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Get payment details from database
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', session.user.id)
      .single()

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Update payment status
    await supabase
      .from('payments')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id)

    // Get current credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('id', session.user.id)
      .single()

    const currentCredits = profile?.credits_balance || 0
    const newBalance = currentCredits + payment.credits_purchased

    // Update user credits
    await supabase
      .from('profiles')
      .update({ credits_balance: newBalance })
      .eq('id', session.user.id)

    // Log transaction
    await supabase.from('credits_transactions').insert({
      user_id: session.user.id,
      amount: payment.credits_purchased,
      type: 'purchase',
      description: `Purchased ${payment.credits_purchased} credits`,
      balance_after: newBalance,
      payment_id: payment.id,
    })

    // Optional: Send email notification (add later via Resend)
    // For now, just log the successful payment
    console.log('✅ Payment successful:', {
      user_id: session.user.id,
      email: session.user.email,
      credits: payment.credits_purchased,
      amount: payment.amount,
      payment_id: razorpay_payment_id,
    })

    // TODO: Add email notification here when ready
    // Example: await sendPaymentSuccessEmail(session.user.email, payment.credits_purchased)

    return NextResponse.json({
      success: true,
      credits: newBalance,
      message: `${payment.credits_purchased} credits added successfully!`,
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
