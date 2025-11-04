import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', session.user.id).single()
  if (!(profile as any)?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (key) {
    const { data: template } = await supabase
      .from('admin_prompt_templates')
      .select('id, key, system_preamble, template, model, temperature, max_tokens, tokens_schema, version, is_active, updated_at')
      .eq('key', key)
      .maybeSingle()
    const { data: versions } = await supabase
      .from('admin_prompt_template_versions')
      .select('version, snapshot, created_at, created_by')
      .order('version', { ascending: false })
      .limit(10)
    return NextResponse.json({ template, versions: versions || [] })
  } else {
    const { data, error } = await supabase
      .from('admin_prompt_templates')
      .select('id, key, system_preamble, template, model, temperature, max_tokens, tokens_schema, version, is_active, updated_at')
      .order('key')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ templates: data || [] })
  }
}

export async function PUT(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', session.user.id).single()
  if (!(profile as any)?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const tpl = body?.template
  if (!tpl?.key || !tpl?.template) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  // Fetch existing for versioning
  const { data: existing } = await supabase
    .from('admin_prompt_templates')
    .select('*')
    .eq('key', tpl.key)
    .maybeSingle()

  // Upsert template
  const nextVersion = (((existing as any)?.version || 1) as number) + 1
  const { error: upsertError, data: saved } = await supabase
    .from('admin_prompt_templates')
    .upsert({
      key: tpl.key,
      system_preamble: tpl.system_preamble ?? null,
      template: tpl.template,
      tokens_schema: tpl.tokens_schema ?? null,
      model: tpl.model ?? null,
      temperature: typeof tpl.temperature === 'number' ? tpl.temperature : null,
      max_tokens: typeof tpl.max_tokens === 'number' ? tpl.max_tokens : null,
      is_active: tpl.is_active !== false,
      version: nextVersion,
      updated_at: new Date().toISOString(),
      created_by: session.user.id,
    } as never, { onConflict: 'key' })
    .select('*')
    .maybeSingle()

  if (upsertError || !saved) return NextResponse.json({ error: upsertError?.message || 'Failed to save' }, { status: 500 })

  // Save version snapshot
  await supabase
    .from('admin_prompt_template_versions')
    .insert({
      template_id: (saved as any).id,
      version: (saved as any).version,
      snapshot: saved as any,
      created_by: session.user.id,
    } as never)

  return NextResponse.json({ success: true, template: saved })
}
