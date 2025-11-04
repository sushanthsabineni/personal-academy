import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DEFAULT_LIMITS } from './limits'

type ResolveParams = {
  courseId: string
  moduleId?: string
  lessonId?: string
  limits?: Partial<{ modules: number; lessonsPerModule: number; files: number; slidesPerLesson: number }>
}

type TokenMap = Record<string, string>

export async function resolveTokens(params: ResolveParams): Promise<TokenMap> {
  const supabase = await createServerSupabaseClient()
  const tokens: TokenMap = {}
  const limits = {
    ...DEFAULT_LIMITS,
    ...(params.limits || {}),
  }

  // Course base
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, description, knowledge_level, target_audience, voice_tone, course_type, instructional_model, course_blueprint_type, audio_narration, image_generation, video_content, animation_motion, engagement_percentage, knowledge_assessments, learning_outcomes')
    .eq('id', params.courseId)
    .maybeSingle()

  if (course) {
    tokens['course.title'] = course.title || ''
    tokens['course.description'] = course.description || ''
    tokens['course.knowledge_level'] = course.knowledge_level || ''
    tokens['course.target_audience'] = course.target_audience || ''
    tokens['essentials.methodology'] = (course as any).instructional_model || (course as any).methodology || ''
    tokens['instructional.model'] = (course as any).instructional_model || ''
    tokens['multimedia.voice_tone'] = (course as any).voice_tone || ''
    tokens['multimedia.course_type'] = (course as any).course_type || (course as any).course_blueprint_type || ''
    tokens['blueprint.type'] = (course as any).course_blueprint_type || ''
    // Multimedia booleans and assessments
    tokens['multimedia.audio_narration'] = String((course as any).audio_narration ?? '')
    tokens['multimedia.image_generation'] = String((course as any).image_generation ?? '')
    tokens['multimedia.video_content'] = String((course as any).video_content ?? '')
    tokens['multimedia.animation_motion'] = String((course as any).animation_motion ?? '')
    if ((course as any).engagement_percentage != null) {
      tokens['multimedia.engagement_percentage'] = String((course as any).engagement_percentage)
    }
    const assess = (course as any).knowledge_assessments as string | null
    tokens['multimedia.knowledge_assessments'] = assess || ''
    const assessTextMap: Record<string,string> = {
      every_module: 'Quiz at the end of every module',
      end_of_course: 'Single assessment at the end of course',
      pre_post: 'Pre-course and post-course assessments',
      ai_decide: 'Let AI decide the best assessment strategy',
    }
    tokens['multimedia.assessments_text'] = assess ? (assessTextMap[assess] || assess) : ''

    // Instructional descriptions & principles
    const instructionalMap: Record<string,{ description:string; principles:string[] }> = {
      addie: { description: 'Analyze, Design, Develop, Implement, Evaluate', principles: ['Analyze objectives','Design storyboard','Develop using blueprint','Implement per specs','Evaluate and iterate'] },
      sam: { description: 'Iterative rapid prototyping', principles: ['Prototype fast','Gather feedback','Iterate quickly','Refine via cycles'] },
      action_mapping: { description: 'Performance-first, action-centered', principles: ['Measurable goals','Scenario actions','Support performance','Cut extraneous info'] },
      blooms_taxonomy: { description: 'Cognitive levels aligned activities', principles: ['Remember','Understand','Apply','Analyze','Evaluate','Create'] },
      merrills_first_principles: { description: 'Task-centered, demonstrate & apply', principles: ['Task-centered','Activate prior knowledge','Demonstrate','Apply with coaching','Integrate & reflect'] },
      seventy_twenty_ten: { description: '70% experiential, 20% social, 10% formal', principles: ['Experiential','Social','Formal'] },
      ai_decide: { description: 'AI will select an appropriate model', principles: ['Auto-select based on inputs'] },
    }
    const iModel = (course as any).instructional_model as string | undefined
    if (iModel && instructionalMap[iModel]) {
      tokens['instructional.description'] = instructionalMap[iModel].description
      tokens['instructional.principles'] = instructionalMap[iModel].principles.join('\n')
    }

    // Blueprint columns
    const blueprintCols: Record<string,string[]> = {
      scenario_based: ['Character descriptions','Dialogue scripts','Decision points','Consequence mapping','Branching flowcharts'],
      software_sim: ['Screen captures','Click coordinates','Hotspot locations','Error scenarios','System responses'],
      video_based: ['Shot descriptions','Camera angles','B-roll footage','On-screen graphics','Caption timing'],
      game_based: ['Game mechanics','Scoring rules','Level progression','Power-ups/rewards','Leaderboard integration'],
      microlearning: ['Key concept (1-2 sentences)','Visual/Media','Interaction (if any)','Assessment (quick check)'],
    }
    const bType = (course as any).course_blueprint_type as string | undefined
    if (bType && blueprintCols[bType]) {
      tokens['blueprint.columns'] = blueprintCols[bType].join('\n')
    }
  }

  // Modules summary
  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, description, order_index')
    .eq('course_id', params.courseId)
    .order('order_index', { ascending: true })
    .limit(limits.modules)

  if (modules && modules.length) {
    tokens['modules.summary'] = modules
      .slice(0, limits.modules)
      .map((m: any, idx: number) => `${idx + 1}) ${m.title} – ${m.description || ''}`)
      .join('\n')
  }

  // Lessons summary (across all modules; lightweight)
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, module_id, title, description, order_index')
    .in('module_id', (modules || []).map((m: any) => m.id))
    .order('order_index', { ascending: true })

  if (lessons && lessons.length) {
    tokens['lessons.summary'] = lessons
      .slice(0, limits.lessonsPerModule * limits.modules)
      .map((l: any, idx: number) => `${idx + 1}) ${l.title} – ${l.description || ''}`)
      .join('\n')
  }

  // Single module/lesson tokens if provided
  if (params.moduleId) {
    const m = (modules || []).find((x: any) => x.id === params.moduleId)
    if (m) {
      tokens['module.title'] = m.title || ''
      tokens['module.description'] = m.description || ''
    }
  }
  if (params.lessonId) {
    const l = (lessons || []).find((x: any) => x.id === params.lessonId)
    if (l) {
      tokens['lesson.title'] = l.title || ''
      tokens['lesson.description'] = l.description || ''
    }
  }

  // Essentials outcomes
  tokens['essentials.learning_outcomes'] = (course as any)?.learning_outcomes || ''

  return tokens
}

export function renderTemplate(template: string, tokens: TokenMap): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_m, key) => {
    return (tokens[key] ?? '').toString()
  })
}
