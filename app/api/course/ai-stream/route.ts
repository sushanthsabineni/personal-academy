import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createStreamingResponse } from '@/lib/ai/streaming'

/**
 * POST /api/course/ai-stream
 * Stream AI-generated content with real-time updates via Server-Sent Events
 *
 * Request body:
 * {
 *   generationType: 'course_structure' | 'lesson_content' | 'quiz_questions' | 'assessment' | 'full_course'
 *   topic: string
 *   courseId?: string
 *   context?: Record<string, any>
 *   model?: string
 * }
 *
 * Response: Server-Sent Events stream with chunks:
 * - metadata: Initial setup and cost info
 * - content: Streamed chunks of generated content
 * - complete: Final result with metadata
 * - error: Error information
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const supabase = await createServerSupabaseClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData?.session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userId = sessionData.session.user.id
    const body = await request.json()

    const {
      generationType = 'course_structure',
      topic,
      courseId,
      context,
      model,
    } = body

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create streaming response
    const response = await createStreamingResponse({
      userId,
      courseId,
      generationType,
      topic,
      context,
      model,
    })

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return new Response(
      JSON.stringify({
        error: 'Streaming failed',
        message: errorMessage,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
