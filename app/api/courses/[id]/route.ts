import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Types for nested data structures
type Slide = {
  slide_number: number
  [key: string]: unknown
}

type Lesson = {
  order_index: number
  duration: number | null
  slides?: Slide[]
  [key: string]: unknown
}

type Module = {
  order_index: number
  lessons?: Lesson[]
  [key: string]: unknown
}

// Type for the route params
type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/courses/[id]
 * Get a single course with all nested data (modules, lessons, slides)
 * Includes RLS verification - users can only access their own courses
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    // Create server-side Supabase client
    const supabase = createServerSupabaseClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this course' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id: courseId } = await params

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    // Get course with full nested structure
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        modules (
          *,
          lessons (
            *,
            slides (
              *
            )
          )
        )
      `)
      .eq('id', courseId)
      .is('deleted_at', null)
      .single()

    if (courseError) {
      if (courseError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Course not found or has been deleted' },
          { status: 404 }
        )
      }
      console.error('Error fetching course:', courseError)
      return NextResponse.json(
        { error: 'Failed to fetch course', details: courseError.message },
        { status: 500 }
      )
    }

    // Verify user owns this course (RLS should handle this, but double-check)
    if (course.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this course' },
        { status: 403 }
      )
    }

    // Sort nested data by order indices
    if (course.modules) {
      course.modules = (course.modules as Module[])
        .sort((a: Module, b: Module) => a.order_index - b.order_index)
        .map((module: Module) => ({
          ...module,
          lessons: module.lessons
            ?.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
            .map((lesson: Lesson) => ({
              ...lesson,
              slides: lesson.slides?.sort((a: Slide, b: Slide) => a.slide_number - b.slide_number) || []
            })) || []
        }))
    }

    // Add computed statistics
    const stats = {
      total_modules: course.modules?.length || 0,
      total_lessons: (course.modules as Module[] | undefined)?.reduce((sum: number, m: Module) => sum + (m.lessons?.length || 0), 0) || 0,
      total_slides: (course.modules as Module[] | undefined)?.reduce((sum: number, m: Module) => 
        sum + (m.lessons?.reduce((lessonSum: number, l: Lesson) => lessonSum + (l.slides?.length || 0), 0) || 0), 0) || 0,
      estimated_duration: (course.modules as Module[] | undefined)?.reduce((sum: number, m: Module) => 
        sum + (m.lessons?.reduce((lessonSum: number, l: Lesson) => lessonSum + (l.duration || 0), 0) || 0), 0) || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        ...course,
        stats
      }
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/courses/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/courses/[id]
 * Update an existing course
 * Includes status transition validation and automatic timestamp updates
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Create server-side Supabase client
    const supabase = createServerSupabaseClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to update this course' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id: courseId } = await params

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

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

    // First, verify the course exists and user owns it
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('id, user_id, status, deleted_at')
      .eq('id', courseId)
      .is('deleted_at', null)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Course not found or has been deleted' },
          { status: 404 }
        )
      }
      console.error('Error fetching course for update:', fetchError)
      return NextResponse.json(
        { error: 'Failed to verify course', details: fetchError.message },
        { status: 500 }
      )
    }

    // Verify ownership
    if (existingCourse.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to update this course' },
        { status: 403 }
      )
    }

    // Prepare update data (only allow specific fields to be updated)
    const updateData: Record<string, unknown> = {}

    // Validate and add allowed fields
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        )
      }
      updateData.title = body.title.trim()
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }

    if (body.status !== undefined) {
      const validStatuses = ['draft', 'in_progress', 'completed', 'archived']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }

      // Validate status transitions
      const currentStatus = existingCourse.status
      const newStatus = body.status

      // Business logic: Can't go from completed back to draft
      if (currentStatus === 'completed' && newStatus === 'draft') {
        return NextResponse.json(
          { error: 'Cannot change status from completed back to draft' },
          { status: 400 }
        )
      }

      updateData.status = newStatus

      // If status is being set to completed, set completed_at
      if (newStatus === 'completed' && currentStatus !== 'completed') {
        updateData.completed_at = new Date().toISOString()
      }
    }

    if (body.current_step !== undefined) {
      if (!Number.isInteger(body.current_step) || body.current_step < 1 || body.current_step > 4) {
        return NextResponse.json(
          { error: 'current_step must be an integer between 1 and 4' },
          { status: 400 }
        )
      }
      updateData.current_step = body.current_step
    }

    // Allow updating course metadata fields
    const metadataFields = [
      'industry', 
      'target_audience', 
      'knowledge_level', 
      'learning_outcomes', 
      'duration', 
      'methodology', 
      'target_location', 
      'file_notes'
    ]

    metadataFields.forEach(field => {
      if (body[field] !== undefined) {
        // Validate knowledge_level if present
        if (field === 'knowledge_level' && body[field] !== null) {
          const validLevels = ['beginner', 'intermediate', 'advanced', 'expert']
          if (!validLevels.includes(body[field])) {
            return NextResponse.json(
              { error: `Invalid knowledge_level. Must be one of: ${validLevels.join(', ')}` },
              { status: 400 }
            )
          }
        }
        updateData[field] = body[field]
      }
    })

    // Check if there's actually anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      )
    }

    // Perform the update (updated_at is automatically updated by trigger)
    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .select(`
        *,
        modules (
          id,
          title,
          order_index
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating course:', updateError)
      return NextResponse.json(
        { error: 'Failed to update course', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    })

  } catch (error) {
    console.error('Unexpected error in PUT /api/courses/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]
 * Soft delete a course by setting deleted_at timestamp
 * Does not physically remove the record from the database
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    // Create server-side Supabase client
    const supabase = createServerSupabaseClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to delete this course' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id: courseId } = await params

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    // First, verify the course exists and user owns it
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('id, user_id, deleted_at')
      .eq('id', courseId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching course for deletion:', fetchError)
      return NextResponse.json(
        { error: 'Failed to verify course', details: fetchError.message },
        { status: 500 }
      )
    }

    // Verify ownership
    if (existingCourse.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to delete this course' },
        { status: 403 }
      )
    }

    // Check if already deleted
    if (existingCourse.deleted_at) {
      return NextResponse.json(
        { error: 'Course has already been deleted' },
        { status: 410 } // 410 Gone
      )
    }

    // Perform soft delete
    const { error: deleteError } = await supabase
      .from('courses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', courseId)

    if (deleteError) {
      console.error('Error deleting course:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete course', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
      deleted_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/courses/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
