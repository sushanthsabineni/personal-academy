import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAIPromptConfigWithDb } from '@/lib/serverConfig'
import { callOpenRouter } from '@/lib/ai/openrouter'
import { getPromptTemplate } from '@/lib/prompts/templates.server'
import { resolveTokens, renderTemplate } from '@/lib/prompts/tokenResolver.server'
import { withRetry, withFallbackModels, logError } from '@/lib/ai/errorRecovery'
import { createErrorResponse } from '@/lib/ai/errorRecovery'

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

    const { courseId, isRegenerate } = await req.json()

    if (!courseId) {
      return NextResponse.json({ success: false, error: 'Missing courseId' }, { status: 400 })
    }

    // Fetch course data from database
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('user_id', userId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    // Get AI config
    const config = await getAIPromptConfigWithDb()

    if (!config.openrouterApiKey) {
      return NextResponse.json({ success: false, error: 'OpenRouter API key not configured' }, { status: 500 })
    }

    // Build the prompt using admin template if available
    let prompt = ''
    const tpl = await getPromptTemplate('course_structure')
    if (tpl?.template) {
      const limits = (tpl.tokens_schema as any)?.limits || undefined
      const tokens = await resolveTokens({ courseId, limits })
      prompt = `${tpl.system_preamble ? tpl.system_preamble + '\n\n' : ''}${renderTemplate(tpl.template, tokens)}`
      if (isRegenerate) {
        prompt += `\n\nIMPORTANT: This is a regeneration request. Vary the structure, consider alternative approaches, and increase granularity where helpful.`
      }
    } else {
      prompt = buildCoursGenerationPrompt(course, config, isRegenerate)
    }

    try {
      // Use fallback models with automatic retry and error recovery
      const { result, modelUsed } = await withFallbackModels(
        config.openrouterModel,
        async (model) => {
          return await withRetry(
            async () => {
              const response = await callOpenRouter(
                config.openrouterApiKey as string,
                {
                  model,
                  messages: [
                    { role: 'system', content: (tpl?.system_preamble || config.systemPromptText) },
                    { role: 'user', content: prompt },
                  ],
                  temperature: typeof tpl?.temperature === 'number' ? tpl!.temperature! : (isRegenerate ? 0.8 : config.temperature),
                  maxTokens: typeof tpl?.max_tokens === 'number' ? tpl!.max_tokens! : 4000,
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
            'generateCourseStructure'
          )
        },
        'generateCourseStructure'
      )

      console.log(`Course structure generated using model: ${modelUsed}`)

      return NextResponse.json({
        success: true,
        structure: result,
        modelUsed,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logError('generateCourseStructure', error, { courseId, userId })
      const errorResponse = createErrorResponse(error)
      return NextResponse.json(errorResponse, { status: 500 })
    }
  } catch (error) {
    console.error('generate-structure error:', error)
    const errorResponse = createErrorResponse(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

function buildCoursGenerationPrompt(
  course: any,
  config: any,
  isRegenerate: boolean
): string {
  const userPreferences = buildUserPreferencesText(course)
  const basePrompt = `${config.systemPromptText}

You are an expert course designer. Generate a comprehensive course structure based on:

**Course Details:**
- Title: ${course.title}
- Description: ${course.description || 'Not provided'}
- Industry: ${course.industry || 'General'}
- Target Audience: ${course.target_audience || 'General professionals'}
- Knowledge Level: ${course.knowledge_level || 'Intermediate'}
- Duration: ${course.duration || 'Flexible'} hours
- Learning Outcomes: ${course.learning_outcomes || 'To be determined'}

${userPreferences}

${config.courseStructurePrompt || ''}

Generate a detailed, well-structured course with:
1. Clear module progression
2. Descriptive module titles and descriptions
3. Appropriate number of lessons per module
4. Realistic time estimates
5. Clear learning objectives

Respond ONLY with valid JSON (no markdown, no explanation) in this exact format:
{
  "modules": [
    {
      "title": "string (compelling module title)",
      "description": "string (2-3 sentences describing what learners will achieve)",
      "lessons": [
        {
          "title": "string (specific lesson title)",
          "description": "string (what will be covered in this lesson)"
        }
      ]
    }
  ]
}`

  if (isRegenerate) {
    return `${basePrompt}

IMPORTANT: This is a REGENERATION REQUEST. Think more deeply and creatively:
- Vary the structure from the previous version
- Consider alternative pedagogical approaches
- Ensure comprehensive topic coverage
- Make lessons more granular and focused
- Add more practical, hands-on lessons where appropriate`
  }

  return basePrompt
}

function buildUserPreferencesText(course: any): string {
  const parts: string[] = []

  if (course.approx_modules) {
    const modulesMap: { [key: string]: string } = {
      'let-ai-decide': 'Let AI decide the optimal number',
      '3-5': '3-5 modules',
      '6-8': '6-8 modules',
      '8+': '8 or more modules',
    }
    parts.push(`**Preferred Number of Modules:** ${modulesMap[course.approx_modules] || course.approx_modules}`)
  }

  if (course.approx_lessons_per_module) {
    const lessonsMap: { [key: string]: string } = {
      'let-ai-decide': 'Let AI decide the optimal number',
      '2-3': '2-3 lessons per module',
      '4-5': '4-5 lessons per module',
      '6-7': '6-7 lessons per module',
    }
    parts.push(`**Lessons per Module:** ${lessonsMap[course.approx_lessons_per_module] || course.approx_lessons_per_module}`)
  }

  if (course.knowledge_assessments) {
    const assessmentsMap: { [key: string]: string } = {
      'every_module': 'Quiz at the end of every module',
      'end_of_course': 'Single assessment at the end of course',
      'pre_post': 'Pre-course and post-course assessments',
      'ai_decide': 'Let AI decide the best assessment strategy',
    }
    parts.push(`**Assessment Strategy:** ${assessmentsMap[course.knowledge_assessments] || course.knowledge_assessments}`)
  }

  if (course.audio_narration) {
    parts.push(`**Multimedia:** Audio narration enabled`)
  }
  if (course.video_content) {
    parts.push(`**Multimedia:** Video content enabled`)
  }
  if (course.image_generation) {
    parts.push(`**Multimedia:** AI-generated images enabled`)
  }
  if (course.animation_motion) {
    parts.push(`**Multimedia:** Animations and motion graphics enabled`)
  }

  if (parts.length === 0) {
    return '**User Preferences:** Default settings - optimal course structure'
  }

  return `**User Preferences:**\n${parts.map(p => `- ${p}`).join('\n')}`
}
