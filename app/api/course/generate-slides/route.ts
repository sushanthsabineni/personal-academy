import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAIPromptConfigWithDb } from '@/lib/serverConfig'
import { generateSlidesFromLesson, formatSlidesForDatabase } from '@/lib/utils/slideGenerator'
import { getPromptTemplate } from '@/lib/prompts/templates.server'
import { resolveTokens, renderTemplate } from '@/lib/prompts/tokenResolver.server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => null) as { courseId?: string }
    const courseId = body?.courseId?.trim()
    if (!courseId) {
      return NextResponse.json({ error: 'courseId required' }, { status: 400 })
    }

    // Verify course ownership
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, description, knowledge_level, target_audience, user_id, course_blueprint_type')
      .eq('id', courseId)
      .single()

    if (courseError) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    if ((course as any).user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const config = await getAIPromptConfigWithDb()
    if (!config.openrouterApiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 })
    }

    // Fetch modules
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, description, order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (modulesError) {
      return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
    }

    let totalSlidesGenerated = 0
    let nextSlideNumber = 1
    const batches: Array<{ moduleId: string; lessonId: string; count: number }> = []

    const blueprint = (course as any).course_blueprint_type as string | null
    const tplKey = blueprint
      ? (
        blueprint === 'scenario_based' ? 'slides_scenario_based' :
        blueprint === 'software_sim' ? 'slides_software_sim' :
        blueprint === 'video_based' ? 'slides_video_based' :
        blueprint === 'game_based' ? 'slides_game_based' :
        blueprint === 'microlearning' ? 'slides_microlearning' :
        'slides'
      )
      : 'slides'
    const tpl = await getPromptTemplate(tplKey)
    const defaultSystem = (await getAIPromptConfigWithDb()).systemPromptText

    for (const m of modules || []) {
      // Fetch lessons per module
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, description, order_index')
        .eq('module_id', (m as any).id)
        .order('order_index', { ascending: true })

      if (lessonsError) continue
      if (!lessons || lessons.length === 0) continue

      const lessonData = (lessons as any[]).map(l => ({
        id: l.id as string,
        title: (l.title || 'Untitled Lesson') as string,
        description: (l.description || '') as string,
      }))

      // Generate slides via server using API key (not exposed to client)
      const generated = [] as Array<{ lessonId: string; lessonTitle: string; slides: any[] }>
      for (const lesson of lessonData) {
        const tokens = await resolveTokens({ courseId, moduleId: (m as any).id as string, lessonId: lesson.id })
        if (tpl?.template) {
          const userPrompt = renderTemplate(tpl.template, tokens)
          const slides = await generateSlidesFromLesson(
            {
              lessonTitle: lesson.title,
              lessonDescription: lesson.description,
              moduleTitle: ((m as any).title || 'Module') as string,
              moduleDescription: ((m as any).description || '') as string,
              courseTitle: (course as any).title as string,
              courseDescription: ((course as any).description || '') as string,
              courseDifficulty: ((course as any).knowledge_level || 'intermediate') as any,
              courseLanguage: 'English',
              targetAudience: ((course as any).target_audience || 'Adult learners') as string,
              slidesPerLesson: 3,
            },
            config.openrouterApiKey as string
          )
          generated.push({ lessonId: lesson.id, lessonTitle: lesson.title, slides })
        } else {
          const slides = await generateSlidesFromLesson(
            {
              lessonTitle: lesson.title,
              lessonDescription: lesson.description,
              moduleTitle: ((m as any).title || 'Module') as string,
              moduleDescription: ((m as any).description || '') as string,
              courseTitle: (course as any).title as string,
              courseDescription: ((course as any).description || '') as string,
              courseDifficulty: ((course as any).knowledge_level || 'intermediate') as any,
              courseLanguage: 'English',
              targetAudience: ((course as any).target_audience || 'Adult learners') as string,
              slidesPerLesson: 3,
            },
            config.openrouterApiKey as string
          )
          generated.push({ lessonId: lesson.id, lessonTitle: lesson.title, slides })
        }
        await new Promise(r => setTimeout(r, 300))
      }

      for (const lessonSlides of generated) {
        const formatted = formatSlidesForDatabase(
          lessonSlides.slides,
          courseId,
          (m as any).id as string,
          lessonSlides.lessonId,
          nextSlideNumber
        )
        if (formatted.length > 0) {
          const { error: insertError } = await supabase
            .from('slides')
            .insert(formatted as never[])
          if (!insertError) {
            totalSlidesGenerated += formatted.length
            batches.push({ moduleId: (m as any).id as string, lessonId: lessonSlides.lessonId, count: formatted.length })
            nextSlideNumber += formatted.length
          }
        }
      }
      // small throttle between modules
      await new Promise(r => setTimeout(r, 300))
    }

    return NextResponse.json({ success: true, totalSlidesGenerated, batches })
  } catch (error) {
    console.error('generate-slides error:', error)
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
