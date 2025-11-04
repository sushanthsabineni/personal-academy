import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', session.user.id).single()
  if (!(profile as any)?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase.from('pricing_plans').select('*').order('credits')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ plans: data || [] })
}

export async function PUT(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', session.user.id).single()
  if (!(profile as any)?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const plans = Array.isArray(body?.plans) ? body.plans : null
  if (!plans) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  if (plans.length > 3) return NextResponse.json({ error: 'Max 3 tiers allowed' }, { status: 400 })

  const allowedCredits = new Set([1000, 3000, 5000])
  for (const p of plans) {
    if (!p?.id || !p?.name || typeof p.credits !== 'number' || typeof p.price_in_inr !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!allowedCredits.has(p.credits)) {
      return NextResponse.json({ error: 'Only 1000/3000/5000 credit tiers are allowed' }, { status: 400 })
    }
  }

  const { error } = await supabase
    .from('pricing_plans')
    .upsert(plans.map((p: any) => ({
      id: String(p.id),
      name: p.name,
      credits: p.credits,
      price_in_inr: p.price_in_inr,
      price_in_usd: p.price_in_usd ?? null,
      features: p.features ?? [],
      is_popular: !!p.is_popular,
      is_active: p.is_active !== false,
      updated_at: new Date().toISOString(),
    })), { onConflict: 'id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
