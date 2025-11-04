import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { resolveTokens, renderTemplate } from '@/lib/prompts/tokenResolver.server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', session.user.id).single()
  if (!(profile as any)?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null) as { template?: string; courseId?: string; moduleId?: string; lessonId?: string }
  const template = body?.template || ''
  if (!template) return NextResponse.json({ error: 'template required' }, { status: 400 })

  try {
    const tokens = body?.courseId ? await resolveTokens({
      courseId: body.courseId,
      moduleId: body?.moduleId,
      lessonId: body?.lessonId,
    }) : {}
    const rendered = renderTemplate(template, tokens as any)
    return NextResponse.json({ success: true, rendered, tokens })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Render error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
