'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { getAICreditRates, updateAICreditRates, type AICreditRates } from '@/lib/adminConfig'
import { Zap, Save, RotateCcw } from '@/lib/icons'

export default function AICreditConfigPage() {
  const router = useRouter()
  const [rates, setRates] = useState<AICreditRates>(getAICreditRates())
  const [hasChanges, setHasChanges] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin/login')
    }
  }, [router])

  const handleChange = (field: keyof AICreditRates, value: number) => {
    setRates(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    updateAICreditRates(rates)
    setHasChanges(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleReset = () => {
    setRates(getAICreditRates())
    setHasChanges(false)
  }

  const sections = [
    {
      key: 'learningOutcomes' as keyof AICreditRates,
      title: 'Learning Outcomes',
      description: 'Credits required to generate learning outcomes for a course section',
      icon: '🎯',
    },
    {
      key: 'modules' as keyof AICreditRates,
      title: 'Modules',
      description: 'Credits required to generate a course module with topics',
      icon: '📚',
    },
    {
      key: 'lessons' as keyof AICreditRates,
      title: 'Lessons',
      description: 'Credits required to generate detailed lesson content',
      icon: '📖',
    },
    {
      key: 'quiz' as keyof AICreditRates,
      title: 'Quiz Questions',
      description: 'Credits required to generate quiz questions and answers',
      icon: '❓',
    },
    {
      key: 'assessments' as keyof AICreditRates,
      title: 'Assessments',
      description: 'Credits required to generate comprehensive assessments',
      icon: '📝',
    },
    {
      key: 'certificates' as keyof AICreditRates,
      title: 'Certificates',
      description: 'Credits required to generate course completion certificates',
      icon: '🏆',
    },
  ]

  const totalCreditsPerCourse = Object.values(rates).reduce((sum, val) => sum + val, 0)

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
            <Zap className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">AI Credit Rate Configuration</h1>
          </div>
          <p className="text-gray-400">
            Configure how many AI credits are required for each course generation section
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-900/50 border border-green-700 rounded-lg p-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-green-300 font-medium">Configuration saved successfully!</p>
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-700/50 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 mb-1">Total Credits Per Complete Course</p>
              <p className="text-4xl font-bold text-white">{totalCreditsPerCourse}</p>
              <p className="text-sm text-gray-400 mt-2">
                This is the total number of credits a user will consume to generate a full course with all sections
              </p>
            </div>
            <div className="text-6xl">⚡</div>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.key}
              className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{section.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{section.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={rates[section.key]}
                        onChange={(e) => handleChange(section.key, parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1</span>
                        <span>25</span>
                        <span>50</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={rates[section.key]}
                        onChange={(e) => handleChange(section.key, parseInt(e.target.value) || 1)}
                        className="w-20 bg-slate-700 text-white text-center rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-gray-400 font-medium">credits</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            How AI Credits Work
          </h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• Users consume credits when generating each section of their course</li>
            <li>• Free users start with 100 credits, Premium users get 1000 credits per month</li>
            <li>• Adjusting these rates affects how many courses users can create</li>
            <li>• Higher credit costs = fewer courses per user, but more revenue opportunity</li>
            <li>• Lower credit costs = more courses per user, higher platform engagement</li>
            <li>• Changes take effect immediately for all new course generations</li>
          </ul>
        </div>

        {/* Warning if unsaved changes */}
        {hasChanges && (
          <div className="mt-6 bg-orange-900/20 border border-orange-700/50 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-orange-300 font-medium">You have unsaved changes</p>
              <p className="text-gray-400 text-sm mt-1">
                Click &quot;Save Changes&quot; to apply your new credit rates to the platform
              </p>
            </div>
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
