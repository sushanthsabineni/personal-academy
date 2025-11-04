import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendPushNotification } from '@/lib/pushNotifications'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile || !(profile as any).is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get request body
    const {
      userIds,
      title,
      body,
      type,
      icon,
      link,
      sendPush,
      sendEmail,
      emailSubject,
      emailBody,
      respectPreferences,
    } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'User IDs are required' }, { status: 400 })
    }

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
    }

    let sentCount = 0
    let emailCount = 0

    // Process each user
    for (const userId of userIds) {
      try {
        // Send push notification (this also creates in-app notification)
        if (sendPush) {
          await sendPushNotification(userId, title, body, {
            icon,
            url: link,
            tag: 'admin-notification',
          })
          sentCount++
        } else {
          // If not sending push, just create in-app notification
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              title,
              body,
              type: (type || 'info') as any,
              icon,
              link,
            } as never)

          if (!notifError) {
            sentCount++
          }
        }

        // Send email if requested
        if (sendEmail && emailSubject && emailBody) {
          // Get user preferences if respectPreferences is true
          if (respectPreferences) {
            const { data: prefs } = await supabase
              .from('user_preferences')
              .select('email_new_features')
              .eq('user_id', userId)
              .single()

            if (!prefs || !(prefs as any).email_new_features) {
              continue // Skip this user
            }
          }

          // Get user email
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single()

          if ((userProfile as any)?.email) {
            // Send email via your email service (you'll need to implement this)
            // For now, we'll use a placeholder API endpoint
            try {
              await fetch('/api/admin/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: (userProfile as any)?.email as string,
                  subject: emailSubject,
                  html: emailBody,
                }),
              })
              emailCount++
            } catch (emailError) {
              console.error('Error sending email:', emailError)
            }
          }
        }
      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      emailsSent: emailCount,
    })
  } catch (error) {
    console.error('Error in admin notifications endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
