import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { callOpenRouter } from '@/lib/ai/openrouter'
import { getAIPromptConfigWithDb } from '@/lib/serverConfig'
import { getPromptTemplate } from '@/lib/prompts/templates.server'
import { resolveTokens, renderTemplate } from '@/lib/prompts/tokenResolver.server'
import { withRetry, withFallbackModels } from '@/lib/ai/errorRecovery'
import { AIServiceError } from '@/lib/ai/errors'
import { createErrorResponse, getCircuitBreakerStatus, getRateLimiterStatus } from '@/lib/ai/errorRecovery'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const CREDITS_COST = 25

    // Check user has enough credits
    const { data: userProfile } = await (supabase
      .from('profiles') as any)
      .select('credits_balance')
      .eq('id', userId)
      .single()

    const currentCredits = userProfile?.credits_balance || 0
    if (currentCredits < CREDITS_COST) {
      return NextResponse.json(
        { success: false, error: `Insufficient credits. You need ${CREDITS_COST} credits but have ${currentCredits}` },
        { status: 402 } // 402 Payment Required
      )
    }

    const {
      courseTitle,
      targetAudience,
      knowledgeLevel,
      duration,
      methodology,
      approxModules,
      approxLessonsPerModule,
      existingOutcomes,
    } = await req.json()

    if (!courseTitle) {
      return NextResponse.json({ success: false, error: 'Missing course title' }, { status: 400 })
    }

    // Get AI configuration with database support
    const config = await getAIPromptConfigWithDb()

    if (!config.openrouterApiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenRouter API key not configured in admin settings' },
        { status: 503 }
      )
    }

    // Build prompt from admin template (fallback to legacy if missing)
    const tpl = await getPromptTemplate('learning_outcomes')
    let prompt: string
    if (tpl?.template) {
      const tokens = await resolveTokens({ courseId: '' }) // courseId not known here; build minimal tokens
      // Fill minimally with request body where tokens are not DB-derived
      tokens['course.title'] = courseTitle
      tokens['course.target_audience'] = targetAudience || 'General professionals'
      tokens['course.knowledge_level'] = knowledgeLevel || 'Intermediate'
      tokens['essentials.learning_outcomes'] = existingOutcomes || ''
      prompt = renderTemplate(tpl.template, tokens)
    } else {
      prompt = `${config.systemPromptText}\n\nYou are creating enhanced, specific learning outcomes for an educational course. Consider ALL the following context:\n\nCourse Context:\n- Title: ${courseTitle}\n- Target Audience: ${targetAudience || 'General professionals'}\n- Knowledge Level: ${knowledgeLevel || 'Intermediate'}\n- Expected Duration: ${duration || 30} minutes\n- Teaching Methodology: ${methodology || 'Lecture-based'}\n- Approximate Modules: ${approxModules || 'To be determined'}\n- Lessons per Module: ${approxLessonsPerModule || 'To be determined'}\n\n${existingOutcomes ? `User's Initial Outcomes:\n${existingOutcomes}\n` : ''}\n\nTask: Create detailed, specific, measurable learning outcomes that:\n1. Are aligned with the ${knowledgeLevel} knowledge level\n2. Use action verbs (create, analyze, implement, evaluate, etc.)\n3. Are achievable within ${duration || 30} minutes per module\n4. Complement the ${methodology} teaching methodology\n5. Work well with ${approxModules || 'multiple'} modules and ${approxLessonsPerModule || 'multiple'} lessons each\n6. Are specific enough to guide AI in generating focused lessons and assessments\n${existingOutcomes ? '7. Build upon or refine the user\'s initial outcomes if provided' : ''}\n\nReturn ONLY a JSON object (no markdown, no explanation) with this structure:\n{\n  \"outcomes\": [\n    {\n      \"id\": 1,\n      \"outcome\": \"Specific, measurable learning outcome with action verb\",\n      \"taxonomy\": \"remember|understand|apply|analyze|evaluate|create\",\n      \"relatedTopics\": [\"topic1\", \"topic2\"]\n    }\n  ],\n  \"summary\": \"Brief summary of the comprehensive learning outcomes\"\n}`
    }

    const enhancedOutcomes = await withFallbackModels(
      config.openrouterModel,
      async (model) => {
        return await withRetry(
          async () => {
            // Build messages with separate system/user roles
            const systemText = tpl?.system_preamble || config.systemPromptText
            const userText = prompt
            const response = await callOpenRouter(
              config.openrouterApiKey as string,
              {
                model,
                messages: [
                  { role: 'system', content: systemText },
                  { role: 'user', content: userText },
                ],
                temperature: typeof tpl?.temperature === 'number' ? tpl!.temperature! : config.temperature,
                maxTokens: typeof tpl?.max_tokens === 'number' ? tpl!.max_tokens! : 2000,
              },
              []
            )

            const content = response.choices[0]?.message?.content || ''
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
              throw new Error('Invalid JSON response from AI')
            }

            return JSON.parse(jsonMatch[0])
          },
          'enhance-outcomes'
        )
      },
      'enhance-learning-outcomes'
    )

    // Deduct credits from user
    const newCreditsBalance = currentCredits - CREDITS_COST
    await (supabase
      .from('profiles') as any)
      .update({ credits_balance: newCreditsBalance })
      .eq('id', userId)

    // Create transaction record for audit trail
    await (supabase
      .from('credits_transactions') as any)
      .insert({
        user_id: userId,
        amount: -CREDITS_COST,
        transaction_type: 'ai_enhance_outcomes',
        description: 'AI Learning Outcomes Enhancement',
        balance_after: newCreditsBalance,
        created_at: new Date().toISOString(),
      })

    return NextResponse.json({
      success: true,
      outcomes: enhancedOutcomes.result,
      modelUsed: enhancedOutcomes.modelUsed,
      newCreditsBalance,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const errorResponse = createErrorResponse(error)
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

    return NextResponse.json(errorResponse, { status: statusCode })
  }
}
