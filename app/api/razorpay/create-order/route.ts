import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { credits, amount, currency = 'INR' } = body

    // Validate input
    if (!credits || !amount) {
      return NextResponse.json(
        { error: 'Credits and amount required' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', session.user.id)
      .single()

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise (₹1 = 100 paise)
      currency: currency,
      receipt: `order_${Date.now()}`,
      notes: {
        user_id: session.user.id,
        credits: credits,
        email: profile?.email || session.user.email,
      },
    })

    // Store order in database (for tracking)
    await supabase.from('payments').insert({
      user_id: session.user.id,
      razorpay_order_id: order.id,
      amount: amount,
      currency: currency,
      credits_purchased: credits,
      status: 'pending',
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
