'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { 
  getPlatformSettings, 
  updatePlatformSettings,
  type PlatformConfig 
} from '@/lib/platformConfig'
import { Globe, Save, RotateCcw, Mail, Shield } from '@/lib/icons'

export default function PlatformSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<PlatformConfig['platformSettings']>(getPlatformSettings())
  const [hasChanges, setHasChanges] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin/login')
    }
  }, [router])

  const handleChange = (field: keyof typeof settings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    updatePlatformSettings(settings)
    setHasChanges(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleReset = () => {
    setSettings(getPlatformSettings())
    setHasChanges(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Platform Settings</h1>
          </div>
          <p className="text-gray-400">
            Configure global platform settings, branding, and behavior
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-900/50 border border-green-700 rounded-lg p-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-green-300 font-medium">Settings saved successfully!</p>
          </div>
        )}

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Branding Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Branding
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => handleChange('platformName', e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:border-purple-500"
                  placeholder="Personal Academy"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This appears in the header, emails, and throughout the app
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:border-purple-500"
                  placeholder="Create AI-Powered Course Storyboards in Minutes"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Displayed on landing pages and marketing materials
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4" />
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:border-purple-500"
                  placeholder="support@personalacademy.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Users will contact this email for help and support
                </p>
              </div>
            </div>
          </div>

          {/* Currency & Localization */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Currency & Localization
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Currency
                </label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:border-purple-500"
                >
                  <option value="INR">INR - Indian Rupee (₹)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="AUD">AUD - Australian Dollar (A$)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Currency shown to users when auto-detection is disabled
                </p>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="autoDetect"
                  checked={settings.enableAutoDetectCurrency}
                  onChange={(e) => handleChange('enableAutoDetectCurrency', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-700"
                />
                <div>
                  <label htmlFor="autoDetect" className="text-sm font-medium text-gray-300 cursor-pointer">
                    Auto-detect currency based on user location
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically show prices in user&apos;s local currency using IP geolocation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-orange-400" />
              Maintenance Mode
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-700"
                />
                <div>
                  <label htmlFor="maintenance" className="text-sm font-medium text-gray-300 cursor-pointer">
                    Enable Maintenance Mode
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Show maintenance message to all users (except admins)
                  </p>
                </div>
              </div>

              {settings.maintenanceMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maintenance Message
                  </label>
                  <textarea
                    value={settings.maintenanceMessage}
                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:border-purple-500"
                    rows={3}
                    placeholder="We are currently undergoing maintenance..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This message will be displayed to users during maintenance
                  </p>
                </div>
              )}

              {settings.maintenanceMode && (
                <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                  <p className="text-orange-300 text-sm font-medium">
                    ⚠️ Maintenance mode is active! Users will see a maintenance page.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-2">{settings.platformName}</h2>
              <p className="text-gray-400 mb-4">{settings.tagline}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">Support: {settings.supportEmail}</span>
                <span className="text-gray-500">Currency: {settings.defaultCurrency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning if unsaved changes */}
        {hasChanges && (
          <div className="mt-6 bg-orange-900/20 border border-orange-700/50 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-orange-300 font-medium">You have unsaved changes</p>
              <p className="text-gray-400 text-sm mt-1">
                Click &quot;Save Changes&quot; to apply your new platform settings
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
