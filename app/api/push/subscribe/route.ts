import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get subscription data from request body
    const subscription = await request.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    // Extract keys from subscription
    const { endpoint, keys } = subscription
    const { p256dh, auth } = keys || {}

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: 'Missing encryption keys' },
        { status: 400 }
      )
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)
      .single()

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({
          p256dh,
          auth,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', (existingSubscription as any).id)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Subscription updated successfully',
      })
    } else {
      // Insert new subscription
      const { error: insertError } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          endpoint,
          p256dh,
          auth,
        } as never)

      if (insertError) {
        console.error('Error inserting subscription:', insertError)
        return NextResponse.json(
          { error: 'Failed to save subscription' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Subscription saved successfully',
      })
    }
  } catch (error) {
    console.error('Error in subscribe endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
