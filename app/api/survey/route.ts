import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, survey_type, responses } = body

    // Validate required fields
    if (!survey_type || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert survey response
    const { data: surveyData, error: surveyError } = await supabase
      .from('survey_responses')
      .insert({
        user_id: user.id,
        email: email || user.email,
        survey_type,
        responses,
      } as never)
      .select()
      .single()

    if (surveyError) {
      console.error('Error inserting survey response:', surveyError)
      return NextResponse.json(
        { error: 'Failed to save survey response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: surveyData
    })

  } catch (error) {
    console.error('Survey submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
