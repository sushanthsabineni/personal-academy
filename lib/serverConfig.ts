/**
 * Server-only configuration functions
 * This module should ONLY be imported in Server Components, Server Actions, and API routes
 * Never import this in client components
 */

import { type AIPromptConfig } from './adminConfig'

// Default AI Prompt Config
const DEFAULT_AI_PROMPT_CONFIG: AIPromptConfig = {
  // OpenRouter configuration (primary)
  aiProvider: 'openrouter',
  openrouterApiKey: undefined,
  openrouterModel: 'openai/gpt-4o',
  openrouterFallbackModels: [
    'openai/gpt-4-turbo',
    'anthropic/claude-3-opus',
    'anthropic/claude-3-sonnet',
    'google/gemini-1.5-pro',
  ],

  // Direct API configuration (legacy)
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  courseStructurePrompt: `You are an expert instructional designer. Generate a comprehensive course structure based on the provided information. Include modules with learning objectives, and suggested lesson topics.`,
  moduleGenerationPrompt: `You are an expert course creator. Generate detailed modules with lessons for the given course topic. Each module should have 3-5 lessons with clear descriptions.`,
  lessonGenerationPrompt: `You are an expert educator. Create detailed lesson content including learning objectives, key concepts, examples, and practice questions.`,
  quizGenerationPrompt: `You are an expert assessment designer. Create challenging quiz questions that test understanding of the concepts. Include multiple-choice and short-answer questions.`,
  assessmentPrompt: `You are an expert in creating comprehensive assessments. Design a full assessment that evaluates learners' mastery of the course material.`,
  contentEnhancementPrompt: `You are an expert content editor. Improve and enhance the provided content to make it more engaging, clear, and pedagogically sound.`,
  narrativePrompt: `You are an expert scriptwriter. Write engaging narration scripts for course content that are suitable for voice-over.`,
  useSystemPrompt: true,
  systemPromptText: `You are Personal Academy's AI instructor assistant. Your role is to help create high-quality, engaging educational content. Follow these guidelines:
- Be clear and concise
- Use pedagogically sound approaches
- Include real-world examples
- Encourage active learning
- Maintain professional but friendly tone
- Adapt to the target audience level`,
};

/**
 * Get AI Prompt Config with database support (for Server Actions/API routes)
 * This is an async version that can fetch from Supabase admin_settings table
 * Falls back to environment variable if not found in database
 * 
 * @server Only use this in Server Components, Server Actions, or API routes
 */
export async function getAIPromptConfigWithDb(): Promise<AIPromptConfig> {
  try {
    // Try to fetch from database first (server-side only)
    const { getAdminSettingsFromDb } = await import('./supabase/adminSettings.server')
    const dbSettings = await getAdminSettingsFromDb()
    
    if (dbSettings && dbSettings.openrouter_api_key) {
      // Parse fallback models from database
      let fallbackModels = DEFAULT_AI_PROMPT_CONFIG.openrouterFallbackModels
      if (dbSettings.openrouter_fallback_models) {
        try {
          fallbackModels = JSON.parse(dbSettings.openrouter_fallback_models)
        } catch (e) {
          console.warn('Failed to parse fallback models from database, using defaults:', e)
        }
      }
      
      // Merge database settings with defaults
      return {
        ...DEFAULT_AI_PROMPT_CONFIG,
        openrouterApiKey: dbSettings.openrouter_api_key,
        openrouterModel: dbSettings.openrouter_model || DEFAULT_AI_PROMPT_CONFIG.openrouterModel,
        openrouterFallbackModels: fallbackModels,
        temperature: dbSettings.temperature || DEFAULT_AI_PROMPT_CONFIG.temperature,
        maxTokens: dbSettings.max_tokens || DEFAULT_AI_PROMPT_CONFIG.maxTokens,
      };
    }
  } catch (error) {
    console.warn('Failed to fetch AI config from database:', error);
  }
  
  // Fallback to environment variable if no database config found
  const apiKeyFromEnv = process.env.OPENROUTER_API_KEY;
  if (apiKeyFromEnv) {
    return {
      ...DEFAULT_AI_PROMPT_CONFIG,
      openrouterApiKey: apiKeyFromEnv,
    };
  }
  
  // Fallback to default (no API key configured)
  return DEFAULT_AI_PROMPT_CONFIG;
}
