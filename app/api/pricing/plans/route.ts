import { NextResponse } from 'next/server'
import { getActivePricingPlans } from '@/lib/supabase/pricing.server'

export async function GET() {
  const plans = await getActivePricingPlans()
  return NextResponse.json({ plans })
}
