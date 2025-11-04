import { createServerSupabaseClient } from '@/lib/supabase/server'

export type PromptTemplate = {
  key: string
  system_preamble?: string | null
  template: string
  tokens_schema?: Record<string, unknown>
  model?: string | null
  temperature?: number | null
  max_tokens?: number | null
}

export async function getPromptTemplate(key: string): Promise<PromptTemplate | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('admin_prompt_templates')
    .select('key, system_preamble, template, tokens_schema, model, temperature, max_tokens')
    .eq('key', key)
    .eq('is_active', true)
    .maybeSingle()
  if (error) {
    console.warn('getPromptTemplate error', error)
    return null
  }
  if (!data) return null
  const tokensSchema = (data as any).tokens_schema as Record<string, unknown> | null
  return {
    key: data.key,
    system_preamble: data.system_preamble,
    template: data.template,
    tokens_schema: tokensSchema || undefined,
    model: data.model,
    temperature: data.temperature,
    max_tokens: data.max_tokens,
  }
}

