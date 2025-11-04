import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:support@personalacademy.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

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

    // Get notification data from request body
    const { userId, title, body, icon, url, tag } = await request.json()

    if (!userId || !title || !body) {
      return NextResponse.json(
        { error: 'userId, title, and body are required' },
        { status: 400 }
      )
    }

    // Get user's push subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId) as {
        data: Array<{
          id: string
          endpoint: string
          p256dh: string
          auth: string
        }> | null
        error: unknown
      }

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'No subscriptions found for user' },
        { status: 200 }
      )
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/logo.png',
      badge: '/logo.png',
      url: url || '/',
      tag: tag || 'general',
      timestamp: Date.now(),
    })

    // Send notifications to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          }

          await webpush.sendNotification(pushSubscription, payload)
          return { success: true, endpoint: subscription.endpoint }
        } catch (error: unknown) {
          const err = error as { statusCode?: number; endpoint?: string }
          console.error('Error sending to endpoint:', err)

          // If subscription is no longer valid, delete it
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', subscription.id)
          }

          return { success: false, endpoint: subscription.endpoint, error }
        }
      })
    )

    // Count successes and failures
    const successful = results.filter((r: any) => r.status === 'fulfilled' && r.value?.success).length
    const failed = results.length - successful

    return NextResponse.json({
      message: 'Notifications sent',
      successful,
      failed,
      total: results.length,
    })
  } catch (error) {
    console.error('Error in send endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
