'use client'

import { useState } from 'react'
import { Wand2, AlertCircle } from '@/lib/icons'

const ENHANCE_CREDITS_COST = 25

type Props = {
  courseTitle: string
  targetAudience: string
  knowledgeLevel: string
  duration: number
  methodology: string
  approxModules: string
  approxLessonsPerModule: string
  existingOutcomes: string
  onEnhanced: (text: string) => void
  userCredits?: number
  onCreditsUpdate?: (newBalance: number) => void
}

export default function AIOutcomesPanel(props: Props) {
  const {
    courseTitle,
    targetAudience,
    knowledgeLevel,
    duration,
    methodology,
    approxModules,
    approxLessonsPerModule,
    existingOutcomes,
    onEnhanced,
    userCredits = 0,
    onCreditsUpdate,
  } = props

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreditWarning, setShowCreditWarning] = useState(false)
  
  const hasEnoughCredits = userCredits >= ENHANCE_CREDITS_COST

  const handleEnhance = async () => {
    if (!courseTitle?.trim()) {
      setError('Please enter a course title first')
      return
    }

    if (!hasEnoughCredits) {
      setShowCreditWarning(true)
      setError(`Insufficient credits. You need ${ENHANCE_CREDITS_COST} credits but have ${userCredits}`)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/course/enhance-outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle,
          targetAudience: targetAudience || 'General professionals',
          knowledgeLevel,
          duration,
          methodology,
          approxModules,
          approxLessonsPerModule,
          existingOutcomes,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to enhance learning outcomes')
      if (data.outcomes && data.outcomes.outcomes) {
        const outcomesText = (data.outcomes.outcomes as Array<{ id: number; outcome: string; taxonomy: string }>)
          .map(o => `• ${o.outcome} (${o.taxonomy})`)
          .join('\n')
        onEnhanced(outcomesText)
        
        // Update credits if callback provided
        if (onCreditsUpdate && data.newCreditsBalance !== undefined) {
          onCreditsUpdate(data.newCreditsBalance)
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to enhance outcomes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <button
          type="button"
          onClick={handleEnhance}
          disabled={loading || !hasEnoughCredits}
          title={!hasEnoughCredits ? `Insufficient credits. Need ${ENHANCE_CREDITS_COST}, have ${userCredits}` : `Use ${ENHANCE_CREDITS_COST} credits to enhance outcomes with AI`}
          className={`text-xs px-3 py-1.5 rounded-lg hover:shadow-sm transition-all flex items-center gap-1.5 font-medium ${
            !hasEnoughCredits
              ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 cursor-not-allowed opacity-60'
              : loading
              ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30'
              : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600 hover:border-brand-teal hover:text-brand-teal'
          }`}
        >
          <Wand2 size={14} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Enhancing...' : 'AI Enhance'}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            !hasEnoughCredits
              ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 font-semibold'
              : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
          }`}>
            {ENHANCE_CREDITS_COST}
          </span>
        </button>
        
        {/* Tooltip */}
        <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg p-2 whitespace-nowrap shadow-lg z-50">
          {!hasEnoughCredits ? (
            <span>💳 Not enough credits ({ENHANCE_CREDITS_COST} needed)</span>
          ) : (
            <span>✨ {ENHANCE_CREDITS_COST} credits will be deducted</span>
          )}
        </div>
      </div>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  )
}

