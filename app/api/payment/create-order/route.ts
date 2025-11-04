import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { getPricingPlanById } from '@/lib/supabase/pricing.server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (!session || sessionError) {
      return NextResponse.json(
        { error: 'Please log in to make a purchase' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { tierId } = body as { tierId?: string }
    if (!tierId) {
      return NextResponse.json({ error: 'tierId required' }, { status: 400 })
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please contact support.' },
        { status: 500 },
      )
    }

    const plan = await getPricingPlanById(String(tierId))
    if (!plan) {
      return NextResponse.json({ error: 'Invalid tierId' }, { status: 400 })
    }

    const currency = 'INR'
    const amount = plan.price_in_inr * 100 // paise
    const credits = plan.credits
    const tierName = plan.name

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', session.user.id)
      .single()

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `order_${Date.now()}`,
      notes: {
        user_id: session.user.id,
        credits,
        tier: tierName,
        email: ((profile as any)?.email) || (session.user.email as string),
      },
    })

    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: session.user.id,
        razorpay_order_id: order.id,
        amount: amount / 100,
        currency,
        credits_purchased: credits,
        status: 'pending',
      } as never)

    if (insertError) {
      console.error('payment:create-order insert error', insertError)
    } else {
      console.info('payment:create-order stored order', { orderId: order.id })
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('payment:create-order error', error)
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
