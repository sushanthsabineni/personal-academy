'use client'

import { useState, useEffect, useRef } from 'react'
import { useModelRecommender } from '@/hooks/useModelRecommender'
import type { AlternativeRecommendation } from '@/hooks/useModelRecommender'
import { Brain, Zap, TrendingUp, CheckCircle2, Clock } from '@/lib/icons'

interface AIModelRecommenderProps {
  courseTitle: string
  industry: string
  durationValue: number
  durationUnit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
  audienceLevel: string
  priorKnowledge: string
  courseType: string
  onModelSelect?: (modelKey: string, modelName: string) => void
}

export function AIModelRecommender({
  courseTitle,
  industry,
  durationValue,
  durationUnit,
  audienceLevel,
  priorKnowledge,
  courseType,
  onModelSelect,
}: AIModelRecommenderProps) {
  const { loading, recommendation, getRecommendation } = useModelRecommender()
  const [hasRecommendation, setHasRecommendation] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Trigger recommendation when key fields change with debounce
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced recommendation
    timeoutRef.current = setTimeout(async () => {
      if (industry && durationValue && audienceLevel) {
        try {
          await getRecommendation({
            courseTitle,
            industry,
            duration: durationValue,
            durationUnit,
            audienceLevel,
            priorKnowledge,
            courseType,
          })
          setHasRecommendation(true)
        } catch (error) {
          console.error('Failed to get recommendation:', error)
          setHasRecommendation(false)
        }
      }
    }, 1500)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [courseTitle, industry, durationValue, durationUnit, audienceLevel, priorKnowledge, courseType, getRecommendation])

  if (!hasRecommendation || !recommendation) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-blue-50/80 via-purple-50/50 to-pink-50/30 dark:from-slate-800/80 dark:via-slate-900/50 dark:to-slate-800/30 border-2 border-brand-teal/20 dark:border-brand-teal/10 rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center flex-shrink-0">
          <Brain size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🤖 AI-Recommended Instructional Model
            {loading && (
              <span className="inline-flex items-center gap-1 text-sm font-normal text-brand-teal">
                <span className="animate-spin">⟳</span> Analyzing...
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Based on your course parameters, here&apos;s the best instructional design approach
          </p>
        </div>
      </div>

      {/* Top Recommendation */}
      {recommendation.topRecommendation && (
        <div className="bg-white dark:bg-slate-900 border-l-4 border-brand-teal rounded-xl p-5 mb-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                {recommendation.topRecommendation.modelName}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                Confidence Score
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="badge badge-lg badge-success text-white font-bold">
                {Math.round(recommendation.topRecommendation.confidence * 100)}%
              </div>
              <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
            </div>
          </div>

          {/* Reasoning */}
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {recommendation.topRecommendation.reasoning}
          </p>

          {/* Key Benefits */}
          {recommendation.topRecommendation.keyBenefits && recommendation.topRecommendation.keyBenefits.length > 0 && (
            <div className="mb-4 p-3 bg-brand-teal/5 dark:bg-brand-teal/10 rounded-lg">
              <p className="text-xs font-semibold text-brand-teal dark:text-brand-cyan mb-2">Key Benefits:</p>
              <ul className="text-xs space-y-1">
                {recommendation.topRecommendation.keyBenefits.slice(0, 3).map((benefit: string, idx: number) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <Zap size={12} className="text-brand-teal mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => {
              onModelSelect?.(
                recommendation.topRecommendation.modelKey,
                recommendation.topRecommendation.modelName
              )
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-teal to-brand-cyan text-white font-semibold text-sm rounded-lg hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
          >
            ✓ Use This Model
          </button>
        </div>
      )}

      {/* Alternative Models */}
      {recommendation.alternatives && recommendation.alternatives.length > 0 && (
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-brand-teal" />
            Other Recommended Options
          </p>

          <div className="space-y-2">
            {recommendation.alternatives.slice(0, 3).map((alt: AlternativeRecommendation) => (
              <button
                key={alt.modelKey}
                onClick={() => {
                  onModelSelect?.(alt.modelKey, alt.modelName)
                }}
                className="w-full text-left p-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-lg hover:border-brand-teal hover:bg-brand-teal/5 transition-all group"
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-teal transition-colors">
                    {alt.modelName}
                  </span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {Math.round(alt.confidence * 100)}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {alt.reasoning}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Duration Helper */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <strong>Duration analyzed:</strong> {durationValue} {durationUnit}
          {durationUnit === 'minutes' && ` (${(durationValue / 60).toFixed(1)} hours)`}
          {durationUnit === 'hours' && ` (${durationValue} hours)`}
        </p>
      </div>
    </div>
  )
}
