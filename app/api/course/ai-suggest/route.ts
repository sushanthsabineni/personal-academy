import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateCourseStructure } from '@/lib/ai/courseGeneration'
import { createErrorResponse, getCircuitBreakerStatus, getRateLimiterStatus } from '@/lib/ai/errorRecovery'
import { AIServiceError } from '@/lib/ai/errors'

export async function POST(req: NextRequest) {
  let userId: string | undefined

  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    userId = session.user.id

    const { courseTitle, learningOutcomes, targetAudience, duration, knowledgeLevel } = await req.json()

    if (!courseTitle || !learningOutcomes) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Generate course structure using OpenRouter AI with error recovery
    const courseStructure = await generateCourseStructure({
      courseTitle,
      learningOutcomes,
      targetAudience: targetAudience || 'General professionals',
      duration: duration || 30,
      knowledgeLevel: knowledgeLevel || 'Intermediate',
    })

    return NextResponse.json({
      success: true,
      suggestion: courseStructure,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    // Enhanced error handling with circuit breaker and rate limiter status
    const errorResponse = createErrorResponse(error)

    // Determine HTTP status code based on error type
    let statusCode = 400

    if (error instanceof AIServiceError) {
      if (error.code === 'RATE_LIMIT_ERROR') {
        statusCode = 429
        const rateLimitStatus = getRateLimiterStatus()
        return NextResponse.json({ ...errorResponse, rateLimitStatus }, { status: statusCode })
      }

      if (error.code === 'CIRCUIT_BREAKER_OPEN') {
        statusCode = 503
        const circuitBreakerStatus = getCircuitBreakerStatus()
        return NextResponse.json({ ...errorResponse, circuitBreakerStatus }, { status: statusCode })
      }

      if (error.code === 'MAX_RETRIES_EXCEEDED') {
        statusCode = 503
      }
    }

    // Log error for monitoring
    console.error('ai-suggest error:', {
      error: errorResponse,
      timestamp: new Date().toISOString(),
      userId,
    })

    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
