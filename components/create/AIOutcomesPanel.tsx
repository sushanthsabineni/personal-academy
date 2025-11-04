'use client'

import { useState } from 'react'
import { Wand2 } from '@/lib/icons'

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
  } = props

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEnhance = async () => {
    if (!courseTitle?.trim()) {
      setError('Please enter a course title first')
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
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to enhance outcomes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleEnhance}
        disabled={loading}
        className="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:border-brand-teal hover:text-brand-teal transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wand2 size={14} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Enhancing...' : 'AI Enhance'}
      </button>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  )
}

