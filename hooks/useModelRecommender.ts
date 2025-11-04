'use client'

import { useState, useCallback } from 'react'

export interface TopRecommendation {
  modelKey: string
  modelName: string
  confidence: number
  reasoning: string
  keyBenefits?: string[]
}

export interface AlternativeRecommendation {
  modelKey: string
  modelName: string
  confidence: number
  reasoning: string
}

export interface RecommendationResponse {
  topRecommendation: TopRecommendation
  alternatives: AlternativeRecommendation[]
}

export interface RecommendationData {
  courseTitle: string
  industry: string
  duration: number
  durationUnit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
  audienceLevel: string
  priorKnowledge: string
  courseType: string
}

export function useModelRecommender() {
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getRecommendation = useCallback(async (data: RecommendationData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/models/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      setRecommendation(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendation'
      setError(errorMessage)
      console.error('useModelRecommender error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    recommendation,
    error,
    getRecommendation,
  }
}
