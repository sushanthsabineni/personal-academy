import { createServerSupabaseClient } from '@/lib/supabase/server'

export const MODEL_COSTS = {
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-4': { input: 30, output: 60 },
  'claude-3-sonnet': { input: 3, output: 15 },
  'default': { input: 2, output: 6 },
} as const

export async function trackAIUsage(
  userId: string,
  courseId: string | undefined,
  generationType: string,
  modelName: string,
  inputTokens: number,
  outputTokens: number,
  processingTimeMs: number,
  status: 'success' | 'failed' | 'partial',
  errorMessage?: string
) {
  const supabase = await createServerSupabaseClient()
  const modelKey = modelName.toLowerCase() as keyof typeof MODEL_COSTS
  const costs = MODEL_COSTS[modelKey] || MODEL_COSTS.default
  const inputCost = (inputTokens / 1_000_000) * costs.input
  const outputCost = (outputTokens / 1_000_000) * costs.output
  const creditsUsed = Math.ceil((inputCost + outputCost) * 100)

  await supabase.from('ai_generations').insert({
    user_id: userId,
    course_id: courseId || null,
    generation_type: generationType,
    credits_used: creditsUsed,
    status,
    error_message: errorMessage || null,
    ai_provider: 'openrouter',
    model_name: modelName,
    tokens_used: inputTokens + outputTokens,
    processing_time_ms: processingTimeMs,
    input_data: null,
    output_data: null,
  } as never)

  return { creditsUsed, inputCost, outputCost }
}

export function estimateCost(modelName: string, inputTokens: number, outputTokens: number) {
  const modelKey = modelName.toLowerCase() as keyof typeof MODEL_COSTS
  const costs = MODEL_COSTS[modelKey] || MODEL_COSTS.default
  const inputCost = (inputTokens / 1_000_000) * costs.input
  const outputCost = (outputTokens / 1_000_000) * costs.output
  return { creditsUsed: Math.ceil((inputCost + outputCost) * 100), total: inputCost + outputCost }
}

export async function checkUserCredits(userId: string, requiredCredits: number) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('profiles').select('credits_balance').eq('id', userId).single()
  const balance = (data as { credits_balance: number } | null)?.credits_balance || 0
  return { hasSufficientCredits: balance >= requiredCredits, balance }
}
