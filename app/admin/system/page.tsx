'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin, adminLogout } from '@/lib/adminAuth'
import {
  getSystemSettings,
  updateSystemSetting,
  createSystemSetting,
  getFeatureFlags,
  updateFeatureFlag,
  createFeatureFlag,
  type SystemSetting,
  type FeatureFlag
} from '@/lib/adminSystem'
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit,
  Save,
  X,
  LogOut,
  Shield,
  Zap,
  DollarSign,
  AlertTriangle
} from '@/lib/icons'

export default function AdminSystemPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
  const [editingSetting, setEditingSetting] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newSetting, setNewSetting] = useState({
    category: '',
    key: '',
    value: '',
    description: ''
  })
  const [newFlag, setNewFlag] = useState({
    name: '',
    description: '',
    enabled: false
  })
  const [showNewSetting, setShowNewSetting] = useState(false)
  const [showNewFlag, setShowNewFlag] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const adminStatus = await isAdmin()
      if (!adminStatus) {
        router.push('/admin/login')
        return
      }

      const [settingsData, flagsData] = await Promise.all([
        getSystemSettings(),
        getFeatureFlags()
      ])

      setSettings(settingsData)
      setFeatureFlags(flagsData)
      setMounted(true)
    }

    loadData()
  }, [router])

  const handleSaveSetting = async (key: string) => {
    const success = await updateSystemSetting(key, editValue)
    if (success) {
      const updatedSettings = await getSystemSettings()
      setSettings(updatedSettings)
      setEditingSetting(null)
      setEditValue('')
    }
  }

  const handleCreateSetting = async () => {
    if (!newSetting.category || !newSetting.key || !newSetting.value) {
      alert('Please fill in all required fields')
      return
    }

    const success = await createSystemSetting(
      newSetting.category,
      newSetting.key,
      newSetting.value,
      newSetting.description
    )

    if (success) {
      const updatedSettings = await getSystemSettings()
      setSettings(updatedSettings)
      setNewSetting({ category: '', key: '', value: '', description: '' })
      setShowNewSetting(false)
    }
  }

  const handleToggleFlag = async (flagId: string, enabled: boolean) => {
    const success = await updateFeatureFlag(flagId, enabled)
    if (success) {
      const updatedFlags = await getFeatureFlags()
      setFeatureFlags(updatedFlags)
    }
  }

  const handleCreateFlag = async () => {
    if (!newFlag.name) {
      alert('Please enter a flag name')
      return
    }

    const success = await createFeatureFlag(
      newFlag.name,
      newFlag.description,
      newFlag.enabled
    )

    if (success) {
      const updatedFlags = await getFeatureFlags()
      setFeatureFlags(updatedFlags)
      setNewFlag({ name: '', description: '', enabled: false })
      setShowNewFlag(false)
    }
  }

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin/login')
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security':
        return <Shield className="w-4 h-4" />
      case 'ai':
        return <Zap className="w-4 h-4" />
      case 'billing':
        return <DollarSign className="w-4 h-4" />
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security':
        return 'text-red-400 bg-red-600/10'
      case 'ai':
        return 'text-purple-400 bg-purple-600/10'
      case 'billing':
        return 'text-green-400 bg-green-600/10'
      case 'maintenance':
        return 'text-orange-400 bg-orange-600/10'
      default:
        return 'text-blue-400 bg-blue-600/10'
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading system configuration...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">System Configuration</h1>
            <p className="text-sm text-gray-400">Manage platform settings and feature flags</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Feature Flags Section */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ToggleLeft className="w-5 h-5" />
                Feature Flags
              </h2>
              <p className="text-sm text-gray-400">Control platform features and functionality</p>
            </div>
            <button
              onClick={() => setShowNewFlag(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Flag
            </button>
          </div>

          <div className="space-y-4">
            {featureFlags.map((flag) => (
              <div key={flag.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-medium">{flag.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      flag.enabled
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {flag.description && (
                    <p className="text-sm text-gray-400">{flag.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Updated {new Date(flag.updated_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleFlag(flag.id, !flag.enabled)}
                  className={`p-2 rounded-lg transition-all ${
                    flag.enabled
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-slate-600 hover:bg-slate-700 text-gray-400'
                  }`}
                >
                  {flag.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
            ))}

            {featureFlags.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No feature flags configured
              </div>
            )}
          </div>
        </div>

        {/* System Settings Section */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Settings
              </h2>
              <p className="text-sm text-gray-400">Configure platform behavior and limits</p>
            </div>
            <button
              onClick={() => setShowNewSetting(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Setting
            </button>
          </div>

          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.key} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(setting.category)}`}>
                      {getCategoryIcon(setting.category)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{setting.key}</h3>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{setting.category}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated {new Date(setting.updated_at).toLocaleString()}
                  </div>
                </div>

                {setting.description && (
                  <p className="text-sm text-gray-400 mb-3">{setting.description}</p>
                )}

                <div className="flex items-center gap-3">
                  {editingSetting === setting.key ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 h-9 px-3 rounded border border-slate-600 bg-slate-900 text-white focus:border-blue-600 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveSetting(setting.key)}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded text-white transition-all"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingSetting(null)
                          setEditValue('')
                        }}
                        className="p-2 bg-slate-600 hover:bg-slate-700 rounded text-white transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="text-white font-mono text-sm bg-slate-900 px-3 py-2 rounded border border-slate-600 break-words">
                          {typeof setting.value === 'string' 
                            ? setting.value 
                            : JSON.stringify(setting.value, null, 2)}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingSetting(setting.key)
                          setEditValue(typeof setting.value === 'string' 
                            ? setting.value 
                            : JSON.stringify(setting.value, null, 2))
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {settings.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No system settings configured
              </div>
            )}
          </div>
        </div>

        {/* New Feature Flag Modal */}
        {showNewFlag && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNewFlag(false)}>
            <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Feature Flag
                </h3>
                <button
                  onClick={() => setShowNewFlag(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Flag Name *
                  </label>
                  <input
                    type="text"
                    value={newFlag.name}
                    onChange={(e) => setNewFlag({...newFlag, name: e.target.value})}
                    className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                    placeholder="e.g., enable_ai_chat"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newFlag.description}
                    onChange={(e) => setNewFlag({...newFlag, description: e.target.value})}
                    className="w-full h-20 px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                    placeholder="Describe what this flag controls..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="flag-enabled"
                    checked={newFlag.enabled}
                    onChange={(e) => setNewFlag({...newFlag, enabled: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-600 focus:ring-offset-slate-900"
                  />
                  <label htmlFor="flag-enabled" className="text-sm text-gray-300">
                    Enable flag by default
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCreateFlag}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                  >
                    Create Flag
                  </button>
                  <button
                    onClick={() => {
                      setShowNewFlag(false)
                      setNewFlag({ name: '', description: '', enabled: false })
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Setting Modal */}
        {showNewSetting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNewSetting(false)}>
            <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add System Setting
                </h3>
                <button
                  onClick={() => setShowNewSetting(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={newSetting.category}
                    onChange={(e) => setNewSetting({...newSetting, category: e.target.value})}
                    className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                  >
                    <option value="">Select category...</option>
                    <option value="security">Security</option>
                    <option value="ai">AI</option>
                    <option value="billing">Billing</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Setting Key *
                  </label>
                  <input
                    type="text"
                    value={newSetting.key}
                    onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                    className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                    placeholder="e.g., max_ai_requests_per_hour"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Value *
                  </label>
                  <input
                    type="text"
                    value={newSetting.value}
                    onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                    className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newSetting.description}
                    onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                    className="w-full h-20 px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                    placeholder="Describe what this setting controls..."
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCreateSetting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                  >
                    Create Setting
                  </button>
                  <button
                    onClick={() => {
                      setShowNewSetting(false)
                      setNewSetting({ category: '', key: '', value: '', description: '' })
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}