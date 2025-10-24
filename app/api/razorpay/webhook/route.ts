import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    // Verify webhook signature
    const expected_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (signature !== expected_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const supabase = createServerSupabaseClient()

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        const payment = event.payload.payment.entity
        
        // Update payment status
        await supabase
          .from('payments')
          .update({
            status: 'captured',
            razorpay_payment_id: payment.id,
          })
          .eq('razorpay_order_id', payment.order_id)
        
        console.log('Payment captured:', payment.id)
        break

      case 'payment.failed':
        const failedPayment = event.payload.payment.entity
        
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('razorpay_order_id', failedPayment.order_id)
        
        console.log('Payment failed:', failedPayment.id)
        break

      case 'refund.created':
        const refund = event.payload.refund.entity
        
        // Handle refund logic
        console.log('Refund created:', refund.id)
        break

      default:
        console.log('Unhandled event:', event.event)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
