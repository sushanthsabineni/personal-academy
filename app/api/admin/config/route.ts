import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAIPromptConfigWithDb } from '@/lib/serverConfig'

/**
 * GET /api/admin/config
 * Retrieves the admin configuration including OpenRouter API key
 * Only accessible to authenticated users (will be validated)
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the AI prompt config (includes OpenRouter API key if configured)
    const config = await getAIPromptConfigWithDb()

    // Return only the public parts of the config (don't expose full API key to client if sensitive)
    // But we do need to indicate if it's configured
    return NextResponse.json({
      success: true,
      config: {
        openrouterModel: config.openrouterModel,
        openrouterFallbackModels: config.openrouterFallbackModels,
        hasOpenrouterApiKey: !!config.openrouterApiKey,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        useSystemPrompt: config.useSystemPrompt,
        systemPromptText: config.systemPromptText,
      },
    })
  } catch (error) {
    console.error('Error fetching admin config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin config' },
      { status: 500 }
    )
  }
}
