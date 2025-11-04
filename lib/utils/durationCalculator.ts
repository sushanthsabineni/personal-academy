/**
 * Duration Calculator for Course Creation
 * 
 * Calculates approximate course duration based on selections from Step 1 (Essentials)
 * and Step 2 (Multimedia) of the course creation flow.
 * 
 * Algorithm:
 *   Total Duration = Base Duration × CourseType Multiplier × Multimedia Multiplier × Quiz Multiplier
 *   Per Module = Total Duration ÷ Number of Modules
 */

/**
 * Course type affects the complexity multiplier
 */
type CourseType = 'simple' | 'interactive' | 'highly_interactive' | 'scenario_driven'

/**
 * Quiz strategy affects the time multiplier for assessments
 */
type QuizStrategy = 'every_module' | 'end_of_course' | 'pre_post' | 'ai_decide'

/**
 * Input configuration for duration calculation
 */
interface DurationCalculationInput {
  /** Base duration from Step 1 (in minutes) */
  baseDuration: number
  
  /** Course type from Step 2 */
  courseType: CourseType
  
  /** Quiz/Assessment strategy from Step 2 */
  quizStrategy: QuizStrategy
  
  /** Individual multimedia selections from Step 2 */
  audioNarration: boolean
  imageGeneration: boolean
  videoContent: boolean
  knowledgeAssessments: boolean
  animationMotion: boolean
  
  /** Number of modules (for per-module calculation) */
  numberOfModules: number
}

/**
 * Output of duration calculation
 */
interface DurationCalculationOutput {
  totalDuration: number
  perModuleDuration: number
}

/**
 * Output for per-module durations with variation
 */
interface ModuleDurationsOutput {
  totalDuration: number
  moduleDurations: number[] // Individual duration for each module
}

/**
 * Course type complexity multipliers
 * Ranges from simple text-based (1.0x) to scenario-driven (1.5x)
 */
const COURSE_TYPE_MULTIPLIERS: Record<CourseType, number> = {
  simple: 1.0,               // Text-based, minimal interactions
  interactive: 1.15,         // Some interactive elements
  highly_interactive: 1.3,   // Rich interactions, videos, animations
  scenario_driven: 1.5,      // Complex branching, decision trees, simulations
}

/**
 * Multimedia option impacts (added as percentages)
 * Each selected option adds time for creation, narration, or assessment
 */
const MULTIMEDIA_IMPACTS: Record<string, number> = {
  audioNarration: 0.1,       // +10% for voiceover scripts and narration
  imageGeneration: 0.05,     // +5% for visual content creation
  videoContent: 0.15,        // +15% for video content (most time-intensive)
  knowledgeAssessments: 0.2, // +20% for quiz/assessment creation
  animationMotion: 0.1,      // +10% for animation and motion effects
}

/**
 * Quiz strategy multipliers
 * Affects how much time is added for assessments based on frequency
 */
const QUIZ_MULTIPLIERS: Record<QuizStrategy, number> = {
  every_module: 1.2,         // +20% for assessments in every module
  pre_post: 1.1,             // +10% for pre-course and post-course assessments
  end_of_course: 1.05,       // +5% for single end-of-course assessment
  ai_decide: 1.12,           // +12% average (AI decides strategy)
}

/**
 * Minimum course duration to enforce practical limits
 */
const MIN_TOTAL_DURATION = 15  // minutes

/**
 * Maximum course duration to enforce practical limits
 */
const MAX_TOTAL_DURATION = 600 // minutes (10 hours)

/**
 * Minimum per-module duration
 */
const MIN_MODULE_DURATION = 5  // minutes

/**
 * Maximum per-module duration
 */
const MAX_MODULE_DURATION = 120 // minutes

/**
 * Calculate approximate course duration based on Step 1 and Step 2 selections
 * 
 * @param input - Configuration with base duration, course type, and multimedia selections
 * @returns Object containing total duration and per-module duration
 * 
 * @example
 * const result = calculateApproximateDuration({
 *   baseDuration: 60,
 *   courseType: 'highly_interactive',
 *   quizStrategy: 'every_module',
 *   audioNarration: true,
 *   imageGeneration: true,
 *   videoContent: true,
 *   knowledgeAssessments: true,
 *   animationMotion: false,
 *   numberOfModules: 5,
 * })
 * // result: { totalDuration: 121, perModuleDuration: 24 }
 */
export function calculateApproximateDuration(
  input: DurationCalculationInput
): DurationCalculationOutput {
  // Validate input
  if (input.baseDuration < 1) {
    console.warn('Base duration must be at least 1 minute')
    return { totalDuration: MIN_TOTAL_DURATION, perModuleDuration: MIN_MODULE_DURATION }
  }

  if (input.numberOfModules < 1) {
    console.warn('Number of modules must be at least 1')
    return { totalDuration: MIN_TOTAL_DURATION, perModuleDuration: MIN_MODULE_DURATION }
  }

  // Step 1: Start with base duration
  let calculatedDuration = input.baseDuration

  // Step 2: Apply course type complexity multiplier
  const typeMultiplier = COURSE_TYPE_MULTIPLIERS[input.courseType] || 1.0
  calculatedDuration *= typeMultiplier

  // Step 3: Calculate and apply multimedia impact
  let multimediaImpact = 0
  const multimediaSelections = {
    audioNarration: input.audioNarration,
    imageGeneration: input.imageGeneration,
    videoContent: input.videoContent,
    knowledgeAssessments: input.knowledgeAssessments,
    animationMotion: input.animationMotion,
  }

  for (const [option, isSelected] of Object.entries(multimediaSelections)) {
    if (isSelected) {
      multimediaImpact += MULTIMEDIA_IMPACTS[option] || 0
    }
  }

  // Apply multimedia impact as multiplier (1 + impact percentage)
  calculatedDuration *= 1 + multimediaImpact

  // Step 4: Apply quiz strategy multiplier
  const quizMultiplier = QUIZ_MULTIPLIERS[input.quizStrategy] || 1.0
  calculatedDuration *= quizMultiplier

  // Step 5: Apply bounds and rounding
  calculatedDuration = Math.max(MIN_TOTAL_DURATION, calculatedDuration)
  calculatedDuration = Math.min(MAX_TOTAL_DURATION, calculatedDuration)
  calculatedDuration = Math.round(calculatedDuration) // Round to nearest minute

  // Step 6: Calculate per-module duration
  let perModuleDuration = calculatedDuration / input.numberOfModules
  perModuleDuration = Math.max(MIN_MODULE_DURATION, perModuleDuration)
  perModuleDuration = Math.min(MAX_MODULE_DURATION, perModuleDuration)
  perModuleDuration = Math.round(perModuleDuration) // Round to nearest minute

  return {
    totalDuration: calculatedDuration,
    perModuleDuration,
  }
}

/**
 * Calculate realistic per-module durations with natural variation
 * Creates varied durations across modules to reflect realistic learning patterns
 * (earlier modules typically shorter for foundational concepts, later modules longer for advanced topics)
 * 
 * @param input - Configuration with base duration and course settings
 * @returns Object containing total duration and array of individual module durations
 */
export function calculateModuleDurations(
  input: DurationCalculationInput
): ModuleDurationsOutput {
  // First calculate the total duration
  const totalResult = calculateApproximateDuration(input)
  const totalDuration = totalResult.totalDuration
  const numberOfModules = input.numberOfModules

  if (numberOfModules === 1) {
    return {
      totalDuration,
      moduleDurations: [totalDuration],
    }
  }

  // Create varied durations: early modules shorter, late modules longer (realistic progression)
  // This follows a natural learning curve
  const moduleDurations: number[] = []
  
  // Calculate base duration per module
  const baseDurationPerModule = totalDuration / numberOfModules
  
  // Create variation pattern: 0.7x to 1.4x multiplier
  // Early modules: 0.7x - 0.9x (foundational, quicker)
  // Middle modules: 0.9x - 1.1x (core content)
  // Late modules: 1.1x - 1.4x (advanced, deeper)
  
  for (let i = 0; i < numberOfModules; i++) {
    let multiplier = 0.7
    
    if (numberOfModules <= 2) {
      // For 1-2 modules, distribute more evenly
      multiplier = i === 0 ? 0.8 : 1.2
    } else if (numberOfModules <= 4) {
      // For 3-4 modules, slight progression
      multiplier = 0.8 + (i / (numberOfModules - 1)) * 0.6 // 0.8 to 1.4
    } else {
      // For 5+ modules, smoother progression
      multiplier = 0.7 + (i / (numberOfModules - 1)) * 0.7 // 0.7 to 1.4
    }
    
    let duration = Math.round(baseDurationPerModule * multiplier)
    
    // Apply bounds
    duration = Math.max(MIN_MODULE_DURATION, duration)
    duration = Math.min(MAX_MODULE_DURATION, duration)
    
    moduleDurations.push(duration)
  }
  
  // Recalculate actual total to ensure it matches target (due to rounding)
  const actualTotal = moduleDurations.reduce((sum, d) => sum + d, 0)
  
  // If there's a difference due to rounding, adjust the last module
  if (actualTotal !== totalDuration) {
    const difference = totalDuration - actualTotal
    moduleDurations[numberOfModules - 1] += difference
  }
  
  return {
    totalDuration,
    moduleDurations,
  }
}

/**
 * Get default multimedia selections (all disabled)
 */
export function getDefaultMultimediaSelections() {
  return {
    audioNarration: false,
    imageGeneration: false,
    videoContent: false,
    knowledgeAssessments: false,
    animationMotion: false,
  }
}

/**
 * Format duration for display
 * @param minutes - Duration in minutes
 * @returns Formatted string like "23 min" or "1h 15m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (mins === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${mins}m`
}

/**
 * Calculate duration with fallback for missing Step 2 data
 * Uses sensible defaults when multimedia selections are unavailable
 * 
 * @param baseDuration - Base duration from Step 1
 * @param courseType - Course type from Step 2 (or default)
 * @param numberOfModules - Number of modules
 * @returns Duration calculation with defaults applied
 */
export function calculateApproximateDurationWithDefaults(
  baseDuration: number,
  courseType?: CourseType,
  numberOfModules: number = 1
): DurationCalculationOutput {
  return calculateApproximateDuration({
    baseDuration,
    courseType: courseType || 'interactive',
    quizStrategy: 'ai_decide',
    // Use reasonable defaults: audio and assessments enabled
    audioNarration: true,
    imageGeneration: true,
    videoContent: false,
    knowledgeAssessments: true,
    animationMotion: false,
    numberOfModules,
  })
}

/**
 * Get all available multiplier values for reference
 * Useful for debugging or UI display
 */
export function getMultiplierReference() {
  return {
    courseTypes: COURSE_TYPE_MULTIPLIERS,
    multimediaImpacts: MULTIMEDIA_IMPACTS,
    quizStrategies: QUIZ_MULTIPLIERS,
  }
}
