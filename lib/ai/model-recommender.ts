import { createClient } from '@supabase/supabase-js'

interface CourseInput {
  courseTitle: string
  industry: string
  // UPDATED: Duration with units
  durationValue: number // The number (e.g., 8)
  durationUnit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' // Unit selected
  audienceLevel: string
  priorKnowledge: string
  courseType: string
  context?: string
}

interface ModelRecommendation {
  modelKey: string
  modelName: string
  score: number
  confidence: number
  reasoning: string
  bestFor: string[]
  considerIf: string[]
}

interface RecommendationResult {
  topRecommendation: ModelRecommendation
  alternatives: ModelRecommendation[]
  allScores: Record<string, number>
  userInputs: CourseInput
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

/**
 * Helper: Convert duration to days for scoring
 * Input: {value: 8, unit: 'hours'} → Returns: 1 day (0.33)
 * Input: {value: 2, unit: 'weeks'} → Returns: 14 days
 */
function convertDurationToDays(value: number, unit: string): number {
  const conversions: Record<string, number> = {
    minutes: 1 / (24 * 60), // Convert minutes to days
    hours: 1 / 24, // Convert hours to days
    days: 1,
    weeks: 7,
    months: 30 // Approximate
  }

  return value * (conversions[unit] || 1)
}

/**
 * Helper: Categorize duration for scoring
 * Returns: 'micro' (< 1 hour), 'short', 'medium', 'long'
 */
function categorizeDuration(durationDays: number): string {
  if (durationDays < 0.042) return 'micro' // < 1 hour
  if (durationDays <= 1) return 'short' // < 1 day
  if (durationDays <= 7) return 'short' // 1-7 days
  if (durationDays <= 30) return 'medium' // 1-4 weeks
  return 'long' // > 1 month
}

/**
 * MAIN FUNCTION: Get AI Recommendations for Instructional Models
 * Now handles minutes/hours/days/weeks/months
 */
export async function getModelRecommendations(
  courseInput: CourseInput,
  courseId?: string,
  userId?: string
): Promise<RecommendationResult> {
  // 1. Fetch all model definitions from database
  const { data: models, error: modelsError } = await supabase
    .from('instructional_model_definitions')
    .select('*')
    .eq('is_active', true)

  if (modelsError || !models) {
    throw new Error('Failed to fetch instructional models')
  }

  // 2. Calculate score for each model
  const scores: Record<string, number> = {}
  const recommendations: Record<string, ModelRecommendation> = {}

  // Convert duration to days for scoring
  const durationInDays = convertDurationToDays(
    courseInput.durationValue,
    courseInput.durationUnit
  )

  for (const model of models) {
    const score = calculateModelScore(
      model,
      courseInput,
      durationInDays
    )
    scores[model.model_key] = score

    recommendations[model.model_key] = {
      modelKey: model.model_key,
      modelName: model.model_name,
      score,
      confidence: score / 100,
      reasoning: generateReasoning(
        model,
        courseInput,
        durationInDays,
        score
      ),
      bestFor: model.ideal_for_course_types || [],
      considerIf: model.characteristics?.best_for || []
    }
  }

  // 3. Sort by score (highest first)
  const sortedRecommendations = Object.values(recommendations).sort(
    (a, b) => b.score - a.score
  )

  // 4. Save recommendation to database
  if (courseId && userId) {
    await saveRecommendationToDatabase(
      courseId,
      userId,
      courseInput,
      sortedRecommendations[0],
      sortedRecommendations.slice(1, 3)
    )
  }

  return {
    topRecommendation: sortedRecommendations[0],
    alternatives: sortedRecommendations.slice(1, 3),
    allScores: scores,
    userInputs: courseInput
  }
}

/**
 * UPDATED SCORING ENGINE: Account for new duration categories
 */
function calculateModelScore(
  model: any,
  courseInput: CourseInput,
  durationInDays: number
): number {
  let score = 50 // Base score

  // Factor 1: Course Type Match (0-25 pts)
  score += scoreByType(model, courseInput.courseType)

  // Factor 2: Industry Match (0-20 pts)
  score += scoreByIndustry(model, courseInput.industry)

  // UPDATED Factor 3: Duration Match with new categories
  score += scoreByDuration(model, durationInDays)

  // Factor 4: Audience Level Match (0-20 pts)
  score += scoreByAudienceLevel(model, courseInput.audienceLevel)

  // Factor 5: Prior Knowledge Match (0-15 pts)
  score += scoreByPriorKnowledge(model, courseInput.priorKnowledge)

  // Cap at 100
  return Math.min(score, 100)
}

/**
 * UPDATED: Duration scoring with new micro/short categories
 */
function scoreByDuration(model: any, durationDays: number): number {
  const durationCategory = categorizeDuration(durationDays)

  const durationScores: Record<string, Record<string, number>> = {
    ADDIE: {
      micro: -10, // Not good for 1-hour courses
      short: 8,
      medium: 18,
      long: 20 // ADDIE loves long courses
    },
    SAM: {
      micro: 15, // Perfect for rapid 1-hour training
      short: 18, // Great for quick courses
      medium: 12,
      long: -5 // Not ideal for long courses
    },
    Bloom: {
      micro: 5,
      short: 12,
      medium: 18,
      long: 20 // Works great for long-term skill progression
    },
    Gagne: {
      micro: 8,
      short: 15,
      medium: 16,
      long: 10 // Good for structured medium-term
    },
    Merrill: {
      micro: 3,
      short: 10,
      medium: 18,
      long: 18 // Good for case studies and scenarios
    },
    ActionMapping: {
      micro: 12, // Works for quick performance fixes
      short: 16, // Good for rapid training
      medium: 15,
      long: 10
    },
    '70-20-10': {
      micro: -8, // Doesn't work for micro-learning
      short: 5,
      medium: 12,
      long: 20 // Perfect for long-term blended learning
    }
  }

  const modelScores = durationScores[model.model_key] || {}
  const baseScore = modelScores[durationCategory] || 10

  // Clamp negative scores to 0 for this factor
  return Math.max(baseScore, 0)
}

/**
 * Other scoring functions (unchanged)
 */
function scoreByType(model: any, courseType: string): number {
  const typeScores: Record<string, Record<string, number>> = {
    ADDIE: {
      technical: 15,
      compliance: 15,
      certification: 12,
      default: 8
    },
    SAM: {
      'product-training': 15,
      'agile-course': 15,
      'rapid-onboarding': 12,
      default: 5
    },
    Bloom: {
      'skills-development': 18,
      academic: 15,
      'knowledge-based': 15,
      default: 10
    },
    Gagne: {
      procedural: 18,
      'software-training': 16,
      technical: 12,
      default: 8
    },
    Merrill: {
      'problem-solving': 18,
      'case-study': 16,
      'scenario-based': 15,
      default: 8
    },
    ActionMapping: {
      'performance-improvement': 20,
      'sales-training': 18,
      'customer-service': 16,
      default: 8
    },
    '70-20-10': {
      leadership: 18,
      'soft-skills': 18,
      management: 15,
      default: 8
    }
  }

  const modelScores = typeScores[model.model_key] || {}
  return modelScores[courseType] || modelScores.default || 5
}

function scoreByIndustry(model: any, industry: string): number {
  const idealIndustries = model.ideal_for_course_types || []
  if (idealIndustries.includes(industry.toLowerCase())) {
    return 20
  }
  if (idealIndustries.length > 0) {
    return 12
  }
  return 8
}

function scoreByAudienceLevel(model: any, level: string): number {
  const idealLevels = model.ideal_for_audience_levels || []

  if (idealLevels.includes(level)) {
    return 20
  }
  if (level === 'beginner' && idealLevels.includes('intermediate')) {
    return 15
  }
  if (idealLevels.length > 0) {
    return 12
  }
  return 10
}

function scoreByPriorKnowledge(model: any, knowledge: string): number {
  if (knowledge === 'none') {
    if (['Bloom', 'Gagne', 'ADDIE'].includes(model.model_key)) {
      return 15
    }
    return 10
  }
  if (knowledge === 'extensive') {
    if (['Merrill', 'ActionMapping', 'SAM'].includes(model.model_key)) {
      return 15
    }
    return 10
  }
  return 12
}

/**
 * UPDATED: Generate reasoning with duration awareness
 */
function generateReasoning(
  model: any,
  courseInput: CourseInput,
  durationInDays: number,
  score: number
): string {
  const reasons: string[] = []
  const durationCategory = categorizeDuration(durationInDays)

  // Format duration for display
  const durationDisplay = formatDuration(
    courseInput.durationValue,
    courseInput.durationUnit
  )

  // Build reasoning based on duration
  if (durationCategory === 'micro') {
    if (['SAM', 'ActionMapping'].includes(model.model_key)) {
      reasons.push(`Perfect for quick ${durationDisplay} training`)
    }
  }

  if (durationCategory === 'short') {
    if (['SAM', 'ActionMapping'].includes(model.model_key)) {
      reasons.push(`Ideal for short-duration ${durationDisplay} courses`)
    }
  }

  if (durationCategory === 'long') {
    if (['ADDIE', 'Bloom', '70-20-10'].includes(model.model_key)) {
      reasons.push(`Excellent for comprehensive ${durationDisplay} courses`)
    }
  }

  // Course type reasoning
  if (courseInput.courseType === 'technical') {
    if (['ADDIE', 'Gagne'].includes(model.model_key)) {
      reasons.push(`Strong fit for technical training`)
    }
  }

  // Audience level reasoning
  if (courseInput.audienceLevel === 'beginner') {
    if (['Bloom', 'ADDIE', 'Gagne'].includes(model.model_key)) {
      reasons.push(`Great for progressive beginner learning`)
    }
  }

  if (reasons.length === 0) {
    reasons.push(
      `Strong match for ${courseInput.courseType} in ${courseInput.industry}`
    )
  }

  return reasons.join(' | ')
}

/**
 * Helper: Format duration for display
 */
function formatDuration(value: number, unit: string): string {
  const pluralUnit = value > 1 ? `${unit}s` : unit
  return `${value} ${pluralUnit}`
}

/**
 * Save recommendation to database
 */
async function saveRecommendationToDatabase(
  courseId: string,
  userId: string,
  courseInput: CourseInput,
  topRecommendation: ModelRecommendation,
  alternatives: ModelRecommendation[]
): Promise<void> {
  try {
    await supabase.from('ai_model_recommendations').insert([
      {
        course_id: courseId,
        user_id: userId,
        user_inputs: {
          ...courseInput,
          // Store both raw and converted values
          durationInDays: convertDurationToDays(
            courseInput.durationValue,
            courseInput.durationUnit
          ),
          durationCategory: categorizeDuration(
            convertDurationToDays(
              courseInput.durationValue,
              courseInput.durationUnit
            )
          )
        },
        recommended_model: topRecommendation.modelKey,
        confidence_score: topRecommendation.confidence,
        reasoning: topRecommendation.reasoning,
        alternative_models: alternatives.map((alt) => ({
          model: alt.modelKey,
          score: alt.score,
          reason: alt.reasoning
        })),
        created_at: new Date()
      }
    ])
  } catch (error) {
    console.error('Failed to save recommendation:', error)
  }
}

/**
 * Track user response to recommendation
 */
export async function trackRecommendationResponse(
  recommendationId: string,
  userAccepted: boolean,
  userSelectedModel?: string,
  userFeedback?: string
): Promise<void> {
  try {
    await supabase
      .from('ai_model_recommendations')
      .update({
        user_accepted: userAccepted,
        user_selected_model: userSelectedModel,
        user_feedback: userFeedback,
        user_response_at: new Date()
      })
      .eq('id', recommendationId)
  } catch (error) {
    console.error('Failed to track recommendation response:', error)
  }
}

/**
 * Analytics: Get model performance statistics
 */
export async function getModelPerformanceStats(
  model: string,
  daysBack: number = 30
): Promise<any> {
  const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)

  const { data } = await supabase
    .from('generation_metrics')
    .select('output_quality_score, user_satisfaction')
    .eq('instructional_model_used', model)
    .gte('recorded_at', startDate.toISOString())

  if (!data || data.length === 0) {
    return null
  }

  const avgQuality =
    data.reduce((sum: number, m: any) => sum + (m.output_quality_score || 0), 0) /
    data.length

  const avgSatisfaction =
    data.reduce(
      (sum: number, m: any) => sum + (m.user_satisfaction || 0),
      0
    ) / data.length

  return {
    model,
    sampleSize: data.length,
    avgQuality: Math.round(avgQuality * 10) / 10,
    avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
    trend: avgQuality > 8.0 ? 'improving' : 'stable'
  }
}

/**
 * Get all model performance stats
 */
export async function getAllModelPerformanceStats(
  daysBack: number = 30
): Promise<any[]> {
  const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)

  const { data } = await supabase
    .from('generation_metrics')
    .select('instructional_model_used, output_quality_score, user_satisfaction')
    .gte('recorded_at', startDate.toISOString())

  if (!data || data.length === 0) {
    return []
  }

  // Group by model
  const modelStats: Record<string, any> = {}

  data.forEach((metric: any) => {
    const model = metric.instructional_model_used
    if (!modelStats[model]) {
      modelStats[model] = {
        qualityScores: [],
        satisfactionScores: []
      }
    }
    modelStats[model].qualityScores.push(metric.output_quality_score || 0)
    modelStats[model].satisfactionScores.push(metric.user_satisfaction || 0)
  })

  // Calculate averages
  return Object.entries(modelStats).map(([model, stats]: [string, any]) => ({
    model,
    sampleSize: stats.qualityScores.length,
    avgQuality: Math.round((stats.qualityScores.reduce((a: number, b: number) => a + b, 0) / stats.qualityScores.length) * 10) / 10,
    avgSatisfaction: Math.round((stats.satisfactionScores.reduce((a: number, b: number) => a + b, 0) / stats.satisfactionScores.length) * 10) / 10,
    trend: (stats.qualityScores.reduce((a: number, b: number) => a + b, 0) / stats.qualityScores.length) > 8.0 ? 'improving' : 'stable'
  }))
}

/**
 * Get recommendations for comparison (multiple models)
 */
export async function getComparativeModelAnalysis(
  models: string[],
  daysBack: number = 30
): Promise<Record<string, any>> {
  const results: Record<string, any> = {}

  for (const model of models) {
    const stats = await getModelPerformanceStats(model, daysBack)
    if (stats) {
      results[model] = stats
    }
  }

  return results
}
