import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (prefError && prefError.code !== 'PGRST116') {
      console.error('Error fetching preferences:', prefError)
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    // Return default preferences if none exist
    if (!preferences) {
      return NextResponse.json({
        preferences: {
          // Notifications
          email_new_features: true,
          email_product_updates: true,
          email_tips: false,
          email_marketing: false,
          push_course_complete: true,
          push_credits_low: true,
          push_referrals: true,
          // Preferences
          language: 'en',
          timezone: 'America/Los_Angeles',
          date_format: 'MM/DD/YYYY',
          default_export_format: 'pdf',
        }
      })
    }

    return NextResponse.json({ preferences })

  } catch (error) {
    console.error('Error in preferences API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Check if preferences exist
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('user_id', session.user.id)
      .single()

    if (existing) {
      // Update existing preferences
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update(body as never)
        .eq('user_id', session.user.id)

      if (updateError) {
        console.error('Error updating preferences:', updateError)
        return NextResponse.json(
          { error: 'Failed to update preferences' },
          { status: 500 }
        )
      }
    } else {
      // Insert new preferences
      const { error: insertError } = await supabase
        .from('user_preferences')
        .insert({ user_id: session.user.id, ...body } as never)

      if (insertError) {
        console.error('Error creating preferences:', insertError)
        return NextResponse.json(
          { error: 'Failed to create preferences' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      message: 'Preferences updated successfully'
    })

  } catch (error) {
    console.error('Error in preferences update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
