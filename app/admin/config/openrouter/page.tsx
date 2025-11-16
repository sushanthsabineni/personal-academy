'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { getAIPromptConfig, updateAIPromptConfig, type AIPromptConfig } from '@/lib/adminConfig'
import { getAvailableModels, callOpenRouter } from '@/lib/ai/openrouter'
import { saveAdminSettingsToDb } from '@/lib/supabase/adminSettings.client'
import { Save, RotateCcw, Copy } from '@/lib/icons'

export default function OpenRouterConfigPage() {
  const router = useRouter()
  const [config, setConfig] = useState<AIPromptConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState<string | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)

  const models = getAvailableModels()

  useEffect(() => {
    let isMounted = true

    const initializeConfig = async () => {
      try {
        // Check admin status first
        const adminStatus = await isAdmin()
        
        // If not admin, redirect and don't set any state
        if (!adminStatus) {
          if (isMounted) {
            router.push('/admin/login')
          }
          return
        }

        // Admin is authorized, proceed to load config
        if (isMounted) {
          try {
            // Try to load config (with defensive merging)
            const loadedConfig = getAIPromptConfig()
            
            // Ensure we have a valid config object
            if (loadedConfig) {
              setConfig(loadedConfig)
              setShowError(null)
            } else {
              // Config is null or undefined - shouldn't happen with new defensive code
              console.error('getAIPromptConfig() returned null or undefined - clearing and reinitializing')
              // Force reinitialize
              localStorage.removeItem('adminConfig')
              setConfig(null)
              setShowError('Configuration was corrupted. Reloading...')
              // Reload page after 1 second
              setTimeout(() => {
                window.location.reload()
              }, 1000)
              return
            }
          } catch (error) {
            console.error('Failed to load config:', error)
            setConfig(null)
            setShowError('Failed to load configuration. Please try refreshing the page.')
          } finally {
            // Always set loading to false when done, regardless of outcome
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error('Failed to initialize:', error)
        if (isMounted) {
          setConfig(null)
          setShowError('Failed to initialize page. Please refresh.')
          setIsLoading(false)
        }
      }
    }

    initializeConfig()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleApiKeyChange = (value: string) => {
    if (!config) return
    setConfig({
      ...config,
      openrouterApiKey: value,
    })
    setHasChanges(true)
    setTestResult(null)
  }

  const handleModelChange = (value: string) => {
    if (!config) return
    setConfig({
      ...config,
      openrouterModel: value,
    })
    setHasChanges(true)
  }

  const handleFallbackToggle = (model: string) => {
    if (!config) return
    const fallbacks = config.openrouterFallbackModels || []
    const updated = fallbacks.includes(model)
      ? fallbacks.filter(m => m !== model)
      : [...fallbacks, model]
    setConfig({
      ...config,
      openrouterFallbackModels: updated,
    })
    setHasChanges(true)
  }

  const handleTestConnection = async () => {
    if (!config?.openrouterApiKey) {
      setTestResult({
        success: false,
        message: 'Please enter your OpenRouter API key first',
      })
      return
    }

    setTestingConnection(true)
    setTestResult(null)

    try {
      const result = await callOpenRouter(
        config.openrouterApiKey,
        {
          model: config.openrouterModel,
          messages: [
            {
              role: 'user',
              content: 'Say "Connection successful!" in exactly 2 words.',
            },
          ],
          temperature: 0.7,
          maxTokens: 20,
        }
      )

      setTestResult({
        success: true,
        message: `✅ Connection successful! Model: ${result.model}, Tokens used: ${result.usage.total_tokens}`,
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setTestingConnection(false)
    }
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
        openrouter_fallback_models: JSON.stringify(config.openrouterFallbackModels || []),
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      })
      
      setHasChanges(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving config:', error)
      setShowError('Failed to save configuration to database. Config saved to browser only.')
    }
  }

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      try {
        const reloadedConfig = getAIPromptConfig()
        setConfig(reloadedConfig)
        setHasChanges(false)
      } catch (error) {
        console.error('Failed to reset:', error)
      }
    }
  }

  const handleCopyApiKey = () => {
    if (config?.openrouterApiKey) {
      navigator.clipboard.writeText(config.openrouterApiKey)
    }
  }

  const primaryModel = models.find(m => m.value === config?.openrouterModel)
  const fallbackModelsList = models.filter(m => config?.openrouterFallbackModels?.includes(m.value))

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
                disabled={!hasChanges || !config?.openrouterApiKey}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  hasChanges && config?.openrouterApiKey
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-slate-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Save Configuration
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
            <span className="text-4xl">🚀</span>
            <h1 className="text-3xl font-bold text-white">OpenRouter Configuration</h1>
          </div>
          <p className="text-gray-400">
            Configure your OpenRouter API key and select which AI models to use for course generation
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-900/30 border border-green-700/50 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="text-green-300">Configuration saved successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {showError && (
          <div className="mb-6 bg-red-900/30 border border-red-700/50 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <p className="text-red-300">{showError}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
            <p className="text-blue-300">Loading configuration...</p>
          </div>
        )}

        {/* Configuration Section */}
        {!isLoading && !config && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-6">
            <p className="text-red-300">Configuration failed to load. Please refresh the page.</p>
          </div>
        )}

        {!isLoading && config && (
          <div className="space-y-6">
            {/* API Key Section */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🔑</span>
                OpenRouter API Key
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Get your free API key from{' '}
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  openrouter.ai
                </a>
              </p>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.openrouterApiKey || ''}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="sk-or-..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showApiKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                {config.openrouterApiKey && (
                  <button
                    onClick={handleCopyApiKey}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition"
                  >
                    <Copy className="w-3 h-3" />
                    Copy API Key
                  </button>
                )}

                {/* Test Connection Button */}
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection || !config.openrouterApiKey}
                  className={`w-full mt-4 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                    testingConnection
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : config.openrouterApiKey
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {testingConnection ? '⏳ Testing...' : '🧪 Test Connection'}
                </button>

                {/* Test Result */}
                {testResult && (
                  <div
                    className={`p-4 rounded-lg text-sm font-mono ${
                      testResult.success
                        ? 'bg-green-900/20 border border-green-700/50 text-green-300'
                        : 'bg-red-900/20 border border-red-700/50 text-red-300'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>

            {/* Primary Model Section */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎯</span>
                Primary Model
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Select your preferred AI model. This will be used for all course generation unless it fails.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Model Selection
                  </label>
                  <select
                    value={config.openrouterModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    {models.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label} ({model.provider}) - ${model.pricing.input}/1k input
                      </option>
                    ))}
                  </select>
                </div>

                {primaryModel && (
                  <div className="bg-slate-900/50 rounded p-4 border border-slate-700">
                    <p className="text-gray-300 text-sm">
                      <strong>{primaryModel.label}</strong> by {primaryModel.provider}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">{primaryModel.description}</p>
                    <div className="text-gray-400 text-sm mt-3">
                      <div>Input: ${primaryModel.pricing.input} per 1000 tokens</div>
                      <div>Output: ${primaryModel.pricing.output} per 1000 tokens</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fallback Models Section */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🔄</span>
                Fallback Models
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                If your primary model fails, these models will be tried in order. Select at least 1 for reliability.
              </p>

              <div className="space-y-2">
                {models
                  .filter((m) => m.value !== config.openrouterModel)
                  .map((model) => (
                    <label
                      key={model.value}
                      className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={config.openrouterFallbackModels?.includes(model.value) || false}
                        onChange={() => handleFallbackToggle(model.value)}
                        className="w-5 h-5 rounded border-slate-600 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">{model.label}</p>
                        <p className="text-gray-400 text-sm">{model.provider}</p>
                      </div>
                      <div className="text-gray-400 text-sm text-right">
                        <div>${model.pricing.input}/1k in</div>
                        <div>${model.pricing.output}/1k out</div>
                      </div>
                    </label>
                  ))}
              </div>

              {/* Selected Fallbacks Summary */}
              {fallbackModelsList.length > 0 && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <p className="text-green-300 text-sm font-semibold mb-2">
                    ✅ {fallbackModelsList.length} fallback model{fallbackModelsList.length === 1 ? '' : 's'} selected:
                  </p>
                  <div className="space-y-1">
                    {fallbackModelsList.map((model) => (
                      <p key={model.value} className="text-green-300 text-sm">
                        • {model.label}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {!fallbackModelsList.length && (
                <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    ⚠️ No fallback models selected. Your API calls might fail if the primary model is unavailable.
                  </p>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>ℹ️</span>
                How This Works
              </h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>✅ Your API key is stored locally in your browser</li>
                <li>✅ When generating courses, we use your selected primary model</li>
                <li>✅ If that model fails, we automatically try fallback models</li>
                <li>✅ You only pay for successful requests</li>
                <li>✅ You can change models anytime without restarting the app</li>
                <li>✅ All models are available immediately - no setup needed</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
