import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAIPromptConfigWithDb } from '@/lib/serverConfig'
import { callOpenRouter } from '@/lib/ai/openrouter'
import { withRetry, withFallbackModels, logError } from '@/lib/ai/errorRecovery'
import { createErrorResponse } from '@/lib/ai/errorRecovery'
import { getPromptTemplate } from '@/lib/prompts/templates.server'
import { resolveTokens, renderTemplate } from '@/lib/prompts/tokenResolver.server'

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

    const { courseId, type, moduleId, lessonIndex, currentTitle, currentDescription } = await req.json()

    // Validate required fields
    if (!courseId || !type || !moduleId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: courseId, type, moduleId' },
        { status: 400 }
      )
    }

    if (type !== 'module' && type !== 'lesson') {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be "module" or "lesson"' },
        { status: 400 }
      )
    }

    if (type === 'lesson' && lessonIndex === undefined) {
      return NextResponse.json(
        { success: false, error: 'lessonIndex required when type is "lesson"' },
        { status: 400 }
      )
    }

    // Fetch course data
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('user_id', userId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    // Fetch all modules and lessons for context
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, description')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (modulesError || !modules) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch modules' },
        { status: 500 }
      )
    }

    // Fetch lessons for all modules
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, module_id, title, description, order_index')
      .in(
        'module_id',
        (modules as any[])?.map((m: any) => m.id)
      )
      .order('order_index', { ascending: true })

    if (lessonsError || !lessonsData) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch lessons' },
        { status: 500 }
      )
    }

    // Get AI config
    const config = await getAIPromptConfigWithDb()

    if (!config.openrouterApiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    // Build enhancement prompt based on type
    let prompt = ''
    if (type === 'module') {
      // Use admin template for module enhancement if available
      const tplM = await getPromptTemplate('module_enhance')
      if (tplM?.template) {
        const tokens = await resolveTokens({ courseId, moduleId })
        if (currentTitle) tokens['module.title'] = currentTitle
        if (currentDescription) tokens['module.description'] = currentDescription
        prompt = renderTemplate(tplM.template, tokens)
      } else {
        prompt = buildModuleEnhancementPrompt(course, modules, lessonsData, moduleId, currentTitle, currentDescription)
      }
    } else {
      // Use admin template for lesson enhancement if available
      const ordered = (lessonsData as any[])
        .filter((l: any) => l.module_id === moduleId)
        .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
      const targetLesson = ordered[(lessonIndex as number) ?? 0]
      const tpl = await getPromptTemplate('lesson_enhance')
      if (tpl?.template && targetLesson?.id) {
        const tokens = await resolveTokens({ courseId, moduleId, lessonId: targetLesson.id })
        // Attach current title/description overrides if provided
        if (currentTitle) tokens['lesson.title'] = currentTitle
        if (currentDescription) tokens['lesson.description'] = currentDescription
        prompt = `${tpl.system_preamble ? tpl.system_preamble + '\n\n' : ''}${renderTemplate(tpl.template, tokens)}`
      } else {
        prompt = buildLessonEnhancementPrompt(
          course,
          modules,
          lessonsData,
          moduleId,
          lessonIndex as number,
          currentTitle,
          currentDescription
        )
      }
    }

    try {
      // Call OpenRouter with enhancement prompt
      const { result, modelUsed } = await withFallbackModels(
        config.openrouterModel,
        async (model) => {
          return await withRetry(
            async () => {
              // Choose template for system role
              const tpl = type === 'lesson' ? await getPromptTemplate('lesson_enhance') : await getPromptTemplate('module_enhance')
              const systemText = tpl?.system_preamble || config.systemPromptText
              const response = await callOpenRouter(
                config.openrouterApiKey as string,
                {
                  model,
                  messages: [
                    { role: 'system', content: systemText },
                    { role: 'user', content: prompt },
                  ],
                  temperature: typeof (type==='lesson' ? tpl?.temperature : (await getPromptTemplate('module_enhance'))?.temperature) === 'number' ? (type==='lesson' ? (tpl!.temperature as number) : ((await getPromptTemplate('module_enhance'))!.temperature as number)) : 0.7,
                  maxTokens: 2000,
                },
                []
              )

              const content = response.choices[0]?.message?.content || ''

              // Parse based on type
              if (type === 'module') {
                // Module enhancement returns plain text
                return {
                  type: 'module',
                  description: content.trim(),
                }
              } else {
                // Lesson enhancement returns JSON
                const jsonMatch = content.match(/\{[\s\S]*\}/)
                if (!jsonMatch) {
                  throw new Error('Invalid JSON response from AI')
                }
                return JSON.parse(jsonMatch[0])
              }
            },
            `enhance${type}`
          )
        },
        `enhance${type}`
      )

      console.log(`Content enhanced using model: ${modelUsed}`)

      return NextResponse.json({
        success: true,
        type,
        enhancement: result,
        modelUsed,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logError(`enhance${type}`, error, { courseId, userId, moduleId, type })
      const errorResponse = createErrorResponse(error)
      return NextResponse.json(errorResponse, { status: 500 })
    }
  } catch (error) {
    console.error('enhance-content error:', error)
    const errorResponse = createErrorResponse(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

function buildModuleEnhancementPrompt(
  course: { title: string; industry?: string; target_audience?: string; knowledge_level?: string; learning_outcomes?: string; methodology?: string },
  modules: Array<{ id: string; title: string; description: string }>,
  lessons: Array<{ module_id: string; title: string; order_index: number }>,
  moduleId: string,
  currentTitle: string,
  currentDescription: string
): string {
  const moduleIndex = modules.findIndex(m => m.id === moduleId)
  const moduleLessons = lessons.filter(l => l.module_id === moduleId)
  const otherModuleTitles = modules.filter(m => m.id !== moduleId).map(m => m.title)

  return `You are an expert instructional designer. Enhance this course module description based on the course context and position within the course structure.

**Course Information:**
- Title: ${course.title}
- Industry: ${course.industry || 'General'}
- Target Audience: ${course.target_audience || 'General professionals'}
- Knowledge Level: ${course.knowledge_level || 'Intermediate'}
- Learning Outcomes: ${course.learning_outcomes || 'Not specified'}
- Methodology: ${course.methodology || 'Blended learning'}

**Course Structure Context:**
- Total Modules: ${modules.length}
- Module Position: ${moduleIndex + 1} of ${modules.length}
- Other Modules: ${otherModuleTitles.join(', ') || 'None'}

**Current Module:**
- Title: ${currentTitle}
- Current Description: ${currentDescription}
- Number of Lessons: ${moduleLessons.length}
- Lesson Titles: ${moduleLessons.map(l => l.title).join(', ') || 'No lessons yet'}

**Your Task:**
Enhance the module description to be:
1. More engaging and compelling for the target audience
2. Clearer about learning outcomes and what students will achieve
3. Well-positioned in the course progression (${moduleIndex === 0 ? 'foundational module' : moduleIndex === modules.length - 1 ? 'concluding module' : 'intermediate module'})
4. Aligned with the course goals and methodology
5. Appropriate for ${course.knowledge_level || 'intermediate'} level learners

Provide ONLY the enhanced description (2-3 sentences, clear and compelling, no JSON, no additional text).`
}

function buildLessonEnhancementPrompt(
  course: { title: string; industry?: string; target_audience?: string; knowledge_level?: string },
  modules: Array<{ id: string; title: string; description: string }>,
  lessons: Array<{ module_id: string; title: string; order_index: number }>,
  moduleId: string,
  lessonIndex: number,
  currentTitle: string,
  currentDescription: string
): string {
  const targetModule = modules.find(m => m.id === moduleId)
  const moduleLessons = lessons.filter(l => l.module_id === moduleId).sort((a, b) => a.order_index - b.order_index)
  const previousLesson = moduleLessons[lessonIndex - 1]
  const nextLesson = moduleLessons[lessonIndex + 1]
  const moduleIndex = modules.findIndex(m => m.id === moduleId)

  return `You are an expert course designer. Enhance this lesson to be more clear, engaging, and well-positioned within its module.

**Course Information:**
- Title: ${course.title}
- Industry: ${course.industry || 'General'}
- Target Audience: ${course.target_audience || 'General professionals'}
- Knowledge Level: ${course.knowledge_level || 'Intermediate'}

**Module Context:**
- Module Title: ${targetModule?.title || 'Unknown'}
- Module Position: ${moduleIndex + 1} of ${modules.length}
- Total Lessons in Module: ${moduleLessons.length}
- Lesson Position: ${lessonIndex + 1} of ${moduleLessons.length}

**Lesson Progression:**
- Previous Lesson: ${previousLesson?.title || 'This is the first lesson'}
- Current Lesson: ${currentTitle}
- Next Lesson: ${nextLesson?.title || 'This is the last lesson'}

**Current Lesson:**
- Title: ${currentTitle}
- Description: ${currentDescription}

**Your Task:**
Enhance the lesson to be:
1. More specific and clear about learning objectives
2. More engaging and descriptive title (10-15 words max)
3. Properly sequenced with adjacent lessons
4. Aligned with module progression
5. Appropriate for ${course.knowledge_level || 'intermediate'} level learners

${lessonIndex === 0 ? 'This is the entry point to the module - make it engaging and foundational.' : ''}
${lessonIndex === moduleLessons.length - 1 ? 'This is the final lesson in the module - ensure it consolidates learning.' : ''}

Respond with ONLY valid JSON (no markdown, no explanation) in this format:
{
  "title": "enhanced lesson title (specific and descriptive)",
  "description": "enhanced lesson description (2-3 sentences about learning objectives)"
}`
}
