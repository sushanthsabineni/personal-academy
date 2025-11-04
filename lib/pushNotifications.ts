import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Create an in-app notification
 * @param userId - User ID to send notification to
 * @param title - Notification title
 * @param body - Notification body/message
 * @param options - Additional notification options
 */
export async function createInAppNotification(
  userId: string,
  title: string,
  body: string,
  options?: {
    type?: string
    icon?: string
    link?: string
  }
) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        body,
        type: options?.type || 'info',
        icon: options?.icon || null,
        link: options?.link || null,
      })

    if (error) {
      console.error('Error creating in-app notification:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Exception creating in-app notification:', error)
    return false
  }
}

/**
 * Send push notification to a user
 * @param userId - User ID to send notification to
 * @param title - Notification title
 * @param body - Notification body/message
 * @param options - Additional notification options
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  options?: {
    icon?: string
    url?: string
    tag?: string
  }
) {
  try {
    // Always create an in-app notification
    await createInAppNotification(userId, title, body, {
      type: options?.tag === 'course-complete' ? 'course' : 
            options?.tag === 'credits-low' ? 'credits' : 
            options?.tag === 'referral' ? 'referral' : 'info',
      icon: options?.icon,
      link: options?.url,
    })

    // Check if user has push notifications enabled
    const supabase = await createServerSupabaseClient()
    
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('push_course_complete, push_credits_low, push_referrals')
      .eq('user_id', userId)
      .single() as {
        data: {
          push_course_complete?: boolean
          push_credits_low?: boolean
          push_referrals?: boolean
        } | null
      }

    // Determine which preference to check based on tag
    let isEnabled = false
    if (options?.tag === 'course-complete') {
      isEnabled = preferences?.push_course_complete ?? false
    } else if (options?.tag === 'credits-low') {
      isEnabled = preferences?.push_credits_low ?? false
    } else if (options?.tag === 'referral') {
      isEnabled = preferences?.push_referrals ?? false
    }

    // If notifications are disabled for this type, don't send push
    if (!isEnabled) {
      console.log(`Push notifications disabled for user ${userId}, tag: ${options?.tag}`)
      return { sent: false, reason: 'disabled' }
    }

    // Call the send API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/push/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        body,
        icon: options?.icon || '/logo.png',
        url: options?.url || '/',
        tag: options?.tag || 'general',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send push notification')
    }

    const result = await response.json()
    return { sent: true, result }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { sent: false, error }
  }
}

/**
 * Send course completion notification
 */
export async function sendCourseCompleteNotification(
  userId: string,
  courseTitle: string,
  courseId: string
) {
  return sendPushNotification(
    userId,
    '🎉 Course Ready!',
    `Your course "${courseTitle}" is ready to view and edit.`,
    {
      icon: '/logo.png',
      url: `/create/storyboard?courseId=${courseId}`,
      tag: 'course-complete',
    }
  )
}

/**
 * Send credits low notification
 */
export async function sendCreditsLowNotification(
  userId: string,
  remainingCredits: number
) {
  return sendPushNotification(
    userId,
    '⚠️ Credits Running Low',
    `You have ${remainingCredits} credits remaining. Top up to continue creating courses.`,
    {
      icon: '/logo.png',
      url: '/account/credits',
      tag: 'credits-low',
    }
  )
}

/**
 * Send referral reward notification
 */
export async function sendReferralRewardNotification(
  userId: string,
  rewardAmount: number
) {
  return sendPushNotification(
    userId,
    '🎁 Referral Reward Earned!',
    `You've earned ${rewardAmount} credits from a successful referral!`,
    {
      icon: '/logo.png',
      url: '/account/referrals',
      tag: 'referral',
    }
  )
}
