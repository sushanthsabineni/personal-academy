import { createServerSupabaseClient } from './server'

export type PricingPlan = {
  id: string
  name: string
  credits: number
  price_in_inr: number
  price_in_usd?: number | null
  features?: string[] | null
  is_popular?: boolean | null
  is_active?: boolean | null
}

export async function getActivePricingPlans(): Promise<PricingPlan[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('is_active', true)
    .order('credits', { ascending: true })
  if (error) {
    console.error('pricing:getActivePricingPlans', error)
    return []
  }
  return (data || []) as PricingPlan[]
}

export async function getPricingPlanById(id: string): Promise<PricingPlan | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  if (error) return null
  return data as PricingPlan
}
