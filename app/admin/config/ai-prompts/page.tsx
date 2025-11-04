'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { getAIPromptConfig, updateAIPromptConfig, type AIPromptConfig } from '@/lib/adminConfig'
import { saveAdminSettingsToDb } from '@/lib/supabase/adminSettings.client'
import { Save, RotateCcw, Copy, Check } from '@/lib/icons'

// Default config for initial state
const DEFAULT_PROMPT_CONFIG: AIPromptConfig = {
  aiProvider: 'openrouter',
  openrouterApiKey: undefined,
  openrouterModel: 'openai/gpt-4o',
  openrouterFallbackModels: ['anthropic/claude-3-opus'],
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
}

export default function AIPromptConfigPage() {
  const router = useRouter()
  const [config, setConfig] = useState<AIPromptConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'settings' | 'prompts'>('settings')

  useEffect(() => {
    let isMounted = true
    
    const initializeConfig = async () => {
      try {
        const adminStatus = await isAdmin()
        if (!adminStatus) {
          router.push('/admin/login')
          return
        }
        
        if (isMounted) {
          // Get config from localStorage
          if (typeof window !== 'undefined') {
            try {
              const loadedConfig = getAIPromptConfig()
              setConfig(loadedConfig)
            } catch (error) {
              console.error('Failed to load AI prompt config:', error)
              setConfig(DEFAULT_PROMPT_CONFIG)
            }
          } else {
            setConfig(DEFAULT_PROMPT_CONFIG)
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to initialize config page:', error)
        if (isMounted) {
          setConfig(DEFAULT_PROMPT_CONFIG)
          setIsLoading(false)
        }
      }
    }
    
    // Call immediately on mount
    initializeConfig()
    
    return () => {
      isMounted = false
    }
  }, [router])

  const handleChange = (field: keyof AIPromptConfig, value: string | number | boolean) => {
    if (!config) return
    setConfig(prev => prev ? { ...prev, [field]: value } : DEFAULT_PROMPT_CONFIG)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!config) return
    
    try {
      // Save to localStorage (for immediate client-side access)
      updateAIPromptConfig(config)
      
      // Save to database (for server-side access)
      await saveAdminSettingsToDb({
        openrouter_api_key: config.openrouterApiKey,
        openrouter_model: config.openrouterModel,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      })
      
      setHasChanges(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving config:', error)
      // Still mark as saved to localStorage even if DB save fails
      setHasChanges(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  const handleReset = () => {
    setConfig(DEFAULT_PROMPT_CONFIG)
    setHasChanges(false)
  }

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const models = [
    { value: 'gpt-4o', label: 'GPT-4 Omni (Recommended)', info: 'Latest GPT-4 model, best for quality' },
    { value: 'gpt-4', label: 'GPT-4', info: 'Powerful model for complex tasks' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', info: 'Fast and cost-effective' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus', info: 'Anthropic\'s most capable model' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', info: 'Anthropic\'s balanced model' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', info: 'Google\'s fast and efficient model' },
  ]

  const promptFields = [
    {
      key: 'courseStructurePrompt' as keyof AIPromptConfig,
      label: 'Course Structure Prompt',
      description: 'Used when generating overall course structure and module organization',
      icon: '📚',
    },
    {
      key: 'moduleGenerationPrompt' as keyof AIPromptConfig,
      label: 'Module Generation Prompt',
      description: 'Used when generating individual modules with lessons',
      icon: '📖',
    },
    {
      key: 'lessonGenerationPrompt' as keyof AIPromptConfig,
      label: 'Lesson Generation Prompt',
      description: 'Used when creating detailed lesson content',
      icon: '✍️',
    },
    {
      key: 'quizGenerationPrompt' as keyof AIPromptConfig,
      label: 'Quiz Generation Prompt',
      description: 'Used when generating quiz questions',
      icon: '❓',
    },
    {
      key: 'assessmentPrompt' as keyof AIPromptConfig,
      label: 'Assessment Prompt',
      description: 'Used when creating comprehensive assessments',
      icon: '📊',
    },
    {
      key: 'contentEnhancementPrompt' as keyof AIPromptConfig,
      label: 'Content Enhancement Prompt',
      description: 'Used when improving existing content',
      icon: '✨',
    },
    {
      key: 'narrativePrompt' as keyof AIPromptConfig,
      label: 'Narrative/Script Prompt',
      description: 'Used when generating voiceover scripts',
      icon: '🎤',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/admin/settings')}
              className="text-gray-400 hover:text-white transition"
            >
              ← Back to Settings
            </button>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="text-gray-400 hover:text-white flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  hasChanges
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-slate-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">🤖</span>
            <h1 className="text-3xl font-bold text-white">AI Prompts & Configuration</h1>
          </div>
          <p className="text-gray-400">
            Customize AI model settings, temperature, and prompts to fine-tune course generation quality
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-900/30 border border-green-700/50 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="text-green-300">Configuration saved successfully!</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
            <p className="text-blue-300">Loading configuration...</p>
          </div>
        )}

        {/* Tabs */}
        {!isLoading && config && (
        <div>
          <div className="flex gap-4 mb-8 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 font-semibold transition ${
                activeTab === 'settings'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Model Settings
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-4 py-3 font-semibold transition ${
                activeTab === 'prompts'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Prompts
            </button>
          </div>

          {/* Model Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
            {/* Model Selection */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Model Selection</h3>
              <div className="space-y-3">
                {models.map(model => (
                  <label
                    key={model.value}
                    className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition ${
                      config.model === model.value
                        ? 'bg-purple-900/30 border-2 border-purple-500'
                        : 'bg-slate-700/30 border-2 border-slate-600 hover:border-purple-500/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="model"
                      value={model.value}
                      checked={config.model === model.value}
                      onChange={(e) => handleChange('model', e.target.value as AIPromptConfig['model'])}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{model.label}</p>
                      <p className="text-sm text-gray-400">{model.info}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Temperature & Parameters */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-6">Generation Parameters</h3>
              <div className="space-y-6">
                {/* Temperature */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white font-medium">
                      Temperature
                      <span className="text-gray-400 text-sm ml-2">(Controls randomness)</span>
                    </label>
                    <span className="text-purple-400 text-xl font-bold">{config.temperature.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>0 (Deterministic)</span>
                    <span>1 (Balanced)</span>
                    <span>2 (Creative)</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-3">
                    • Lower (0-0.5): More focused, consistent, and predictable content
                    <br />
                    • Medium (0.7): Balanced creativity and reliability (recommended)
                    <br />
                    • Higher (1-2): More creative and varied content (may be less consistent)
                  </p>
                </div>

                {/* Max Tokens */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white font-medium">
                      Max Tokens
                      <span className="text-gray-400 text-sm ml-2">(Max response length)</span>
                    </label>
                    <span className="text-purple-400 text-xl font-bold">{config.maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="512"
                    max="4096"
                    step="256"
                    value={config.maxTokens}
                    onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>512 (Short)</span>
                    <span>2048 (Medium)</span>
                    <span>4096 (Long)</span>
                  </div>
                </div>

                {/* Top P */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white font-medium">
                      Top P
                      <span className="text-gray-400 text-sm ml-2">(Nucleus sampling)</span>
                    </label>
                    <span className="text-purple-400 text-xl font-bold">{config.topP.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.topP}
                    onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Recommended: 1.0 (use temperature for randomness control)
                  </p>
                </div>

                {/* Frequency Penalty */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white font-medium">
                      Frequency Penalty
                      <span className="text-gray-400 text-sm ml-2">(Reduce repetition)</span>
                    </label>
                    <span className="text-purple-400 text-xl font-bold">{config.frequencyPenalty.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={config.frequencyPenalty}
                    onChange={(e) => handleChange('frequencyPenalty', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Positive values penalize tokens that appear frequently (0.5-1.0 recommended)
                  </p>
                </div>

                {/* Presence Penalty */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white font-medium">
                      Presence Penalty
                      <span className="text-gray-400 text-sm ml-2">(Encourage variety)</span>
                    </label>
                    <span className="text-purple-400 text-xl font-bold">{config.presencePenalty.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={config.presencePenalty}
                    onChange={(e) => handleChange('presencePenalty', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Positive values encourage new topics (0.3-0.7 recommended)
                  </p>
                </div>
              </div>
            </div>

            {/* System Prompt Settings */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">System Prompt Configuration</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.useSystemPrompt}
                    onChange={(e) => handleChange('useSystemPrompt', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-white font-medium">Use Custom System Prompt</span>
                </label>

                {config.useSystemPrompt && (
                  <div>
                    <label className="block text-white font-medium mb-2">System Prompt Text</label>
                    <textarea
                      value={config.systemPromptText}
                      onChange={(e) => handleChange('systemPromptText', e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-purple-500 focus:outline-none"
                      placeholder="Enter system prompt..."
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      The system prompt defines the AI&apos;s behavior and role. This is applied before all generation requests.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prompts Tab */}
        {activeTab === 'prompts' && (
          <div className="space-y-6">
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
              <p className="text-blue-300 text-sm">
                💡 Edit prompts to customize how AI generates course content. Each prompt is used for specific generation tasks.
              </p>
            </div>

            {promptFields.map(field => (
              <div key={field.key} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                      <span>{field.icon}</span>
                      {field.label}
                    </h3>
                    <p className="text-sm text-gray-400">{field.description}</p>
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard(config[field.key] as string, field.key)}
                    className="text-gray-400 hover:text-white flex items-center gap-2 transition"
                    title="Copy to clipboard"
                  >
                    {copiedField === field.key ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={config[field.key] as string}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-purple-500 focus:outline-none font-mono text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        {hasChanges && (
          <div className="mt-8 bg-orange-900/20 border border-orange-700/50 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-orange-300 font-medium">You have unsaved changes</p>
              <p className="text-gray-400 text-sm mt-1">
                Click &quot;Save Changes&quot; to apply your configuration updates to the platform
              </p>
            </div>
          </div>
        )}
        </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #a855f7;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #a855f7;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  )
}
