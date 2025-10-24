import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Type for module data from the query
type ModuleBasic = {
  id: string
  title: string
  order_index: number
  is_approved: boolean
}

/**
 * GET /api/courses
 * List all courses for the current authenticated user
 * Returns courses with basic module information
 */
export async function GET() {
  try {
    // Create server-side Supabase client
    const supabase = createServerSupabaseClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access your courses' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get all courses for the user (exclude soft-deleted)
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        *,
        modules (
          id,
          title,
          order_index,
          is_approved
        )
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (coursesError) {
      console.error('Error fetching courses:', coursesError)
      return NextResponse.json(
        { error: 'Failed to fetch courses', details: coursesError.message },
        { status: 500 }
      )
    }

    // Return courses with computed statistics
    const coursesWithStats = courses?.map((course: { modules?: ModuleBasic[]; [key: string]: unknown }) => ({
      ...course,
      module_count: course.modules?.length || 0,
      modules: course.modules?.sort((a: ModuleBasic, b: ModuleBasic) => a.order_index - b.order_index)
    })) || []

    return NextResponse.json({
      success: true,
      data: coursesWithStats,
      count: coursesWithStats.length
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/courses:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses
 * Create a new course for the current authenticated user
 * Requires sufficient credits in the user's balance
 */
export async function POST(request: NextRequest) {
  try {
    // Create server-side Supabase client
    const supabase = createServerSupabaseClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create a course' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Course title is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Check user's credit balance before allowing course creation
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_balance, is_premium')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to verify user profile', details: profileError.message },
        { status: 500 }
      )
    }

    // Define minimum credits required to create a course
    const MINIMUM_CREDITS_REQUIRED = 100

    if (profile.credits_balance < MINIMUM_CREDITS_REQUIRED) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          message: `You need at least ${MINIMUM_CREDITS_REQUIRED} credits to create a course. Current balance: ${profile.credits_balance}`,
          current_balance: profile.credits_balance,
          required_credits: MINIMUM_CREDITS_REQUIRED
        },
        { status: 402 } // 402 Payment Required
      )
    }

    // Prepare course data
    const courseData = {
      user_id: userId,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      status: body.status || 'draft',
      current_step: body.current_step || 1,
      industry: body.industry?.trim() || null,
      target_audience: body.target_audience?.trim() || null,
      knowledge_level: body.knowledge_level || null,
      learning_outcomes: body.learning_outcomes?.trim() || null,
      duration: body.duration || null,
      methodology: body.methodology?.trim() || null,
      target_location: body.target_location?.trim() || null,
      file_notes: body.file_notes?.trim() || null,
    }

    // Validate status if provided
    const validStatuses = ['draft', 'in_progress', 'completed', 'archived']
    if (courseData.status && !validStatuses.includes(courseData.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate knowledge_level if provided
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert']
    if (courseData.knowledge_level && !validLevels.includes(courseData.knowledge_level)) {
      return NextResponse.json(
        { error: `Invalid knowledge_level. Must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      )
    }

    // Create the course
    const { data: newCourse, error: createError } = await supabase
      .from('courses')
      .insert(courseData)
      .select(`
        *,
        modules (
          id,
          title,
          order_index
        )
      `)
      .single()

    if (createError) {
      console.error('Error creating course:', createError)
      return NextResponse.json(
        { error: 'Failed to create course', details: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      data: newCourse
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in POST /api/courses:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
