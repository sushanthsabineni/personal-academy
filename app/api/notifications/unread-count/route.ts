import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
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

    // Get unread notification count
    const { data, error } = await supabase
      .rpc('get_unread_notification_count' as any, { user_uuid: user.id } as any)

    if (error) {
      console.error('Error fetching unread count:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notification count' },
        { status: 500 }
      )
    }

    return NextResponse.json({ count: data || 0 })
  } catch (error) {
    console.error('Error in notification count endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
