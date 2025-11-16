/**
 * AI Error Recovery & Resilience Service
 * Handles automatic retries, fallback models, rate limiting, and circuit breaker pattern
 */

import {
  AIServiceError,
  RateLimitError,
  CircuitBreakerOpenError,
} from './errors'

// Configuration for retry strategy
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
} as const

// Circuit breaker states
type CircuitState = 'closed' | 'open' | 'half-open'

interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeoutMs: number
  successThreshold: number
}

class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failureCount = 0
  private successCount = 0
  private lastFailureTime: number | null = null
  private readonly config: CircuitBreakerConfig

  constructor(config: CircuitBreakerConfig) {
    this.config = config
  }

  canExecute(): boolean {
    if (this.state === 'closed') return true

    if (this.state === 'open') {
      if (Date.now() - (this.lastFailureTime || 0) > this.config.resetTimeoutMs) {
        this.state = 'half-open'
        this.successCount = 0
        return true
      }
      return false
    }

    // half-open state
    return true
  }

  recordSuccess(): void {
    this.failureCount = 0

    if (this.state === 'half-open') {
      this.successCount++
      if (this.successCount >= this.config.successThreshold) {
        this.state = 'closed'
      }
    }
  }

  recordFailure(): void {
    this.lastFailureTime = Date.now()
    this.failureCount++

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'open'
    }
  }

  getState(): CircuitState {
    return this.state
  }
}

// Global circuit breaker for OpenRouter
const openRouterCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeoutMs: 30000, // 30 seconds
  successThreshold: 2,
})

// Rate limiter
interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

class RateLimiter {
  private requests: number[] = []
  private readonly config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  canMakeRequest(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter((time) => now - time < this.config.windowMs)

    if (this.requests.length < this.config.maxRequests) {
      this.requests.push(now)
      return true
    }

    return false
  }

  getWaitTimeMs(): number {
    if (this.requests.length === 0) return 0
    const oldestRequest = this.requests[0]
    const waitTime = this.config.windowMs - (Date.now() - oldestRequest)
    return Math.max(0, waitTime)
  }

  getRemainingRequests(): number {
    return Math.max(0, this.config.maxRequests - this.requests.length)
  }
}

// Rate limiter for OpenRouter (e.g., 60 requests per minute)
const openRouterRateLimiter = new RateLimiter({
  maxRequests: 60,
  windowMs: 60000,
})

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  customMaxRetries?: number
): Promise<T> {
  const maxRetries = customMaxRetries ?? RETRY_CONFIG.maxRetries
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Check rate limiter
      if (!openRouterRateLimiter.canMakeRequest()) {
        const waitTime = openRouterRateLimiter.getWaitTimeMs()
        await sleep(waitTime)
      }

      // Check circuit breaker
      if (!openRouterCircuitBreaker.canExecute()) {
        throw new CircuitBreakerOpenError()
      }

      // Execute operation
      const result = await operation()
      openRouterCircuitBreaker.recordSuccess()
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Record failure for circuit breaker
      if (
        error instanceof RateLimitError ||
        (error instanceof AIServiceError && error.code.includes('5'))
      ) {
        openRouterCircuitBreaker.recordFailure()
      }

      // Check if error is retryable
      const isRetryable =
        error instanceof AIServiceError
          ? error.retryable
          : error instanceof Error &&
            (error.message.includes('timeout') ||
              error.message.includes('429') ||
              error.message.includes('503'))

      if (!isRetryable || attempt === maxRetries) {
        throw error
      }

      // Calculate exponential backoff
      const delayMs = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
        RETRY_CONFIG.maxDelayMs
      )

      console.log(
        `[${operationName}] Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`,
        lastError.message
      )

      await sleep(delayMs)
    }
  }

  throw new AIServiceError(
    `Operation failed after ${maxRetries + 1} attempts: ${operationName}`,
    'MAX_RETRIES_EXCEEDED',
    false,
    lastError || undefined
  )
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Get fallback models for a given primary model
 * Returns list of models to try if primary fails
 */
export function getFallbackModels(primaryModel: string): string[] {
  const fallbackMap: Record<string, string[]> = {
    // OpenAI models
    'openai/gpt-4o': [
      'openai/gpt-4-turbo',
      'anthropic/claude-3-opus',
      'anthropic/claude-3-sonnet',
      'google/gemini-1.5-pro',
    ],
    'openai/gpt-4-turbo': [
      'openai/gpt-3.5-turbo',
      'anthropic/claude-3-opus',
      'anthropic/claude-3-sonnet',
      'google/gemini-1.5-pro',
    ],
    'openai/gpt-3.5-turbo': [
      'anthropic/claude-3-sonnet',
      'anthropic/claude-3-haiku',
      'google/gemini-pro',
    ],

    // Anthropic models
    'anthropic/claude-3-opus': [
      'anthropic/claude-3-sonnet',
      'openai/gpt-4-turbo',
      'google/gemini-1.5-pro',
      'openai/gpt-3.5-turbo',
    ],
    'anthropic/claude-3-sonnet': [
      'anthropic/claude-3-haiku',
      'openai/gpt-4-turbo',
      'google/gemini-1.5-pro',
      'openai/gpt-3.5-turbo',
    ],
    'anthropic/claude-3-haiku': [
      'openai/gpt-3.5-turbo',
      'google/gemini-pro',
      'anthropic/claude-3-sonnet',
    ],

    // Google models
    'google/gemini-1.5-pro': [
      'google/gemini-pro',
      'anthropic/claude-3-sonnet',
      'openai/gpt-4-turbo',
      'openai/gpt-3.5-turbo',
    ],
    'google/gemini-pro': [
      'google/gemini-1.5-pro',
      'anthropic/claude-3-sonnet',
      'openai/gpt-4-turbo',
      'openai/gpt-3.5-turbo',
    ],

    // Meta models
    'meta-llama/llama-2-70b': [
      'anthropic/claude-3-sonnet',
      'openai/gpt-4-turbo',
      'google/gemini-1.5-pro',
      'openai/gpt-3.5-turbo',
    ],
    'meta-llama/llama-2-13b': [
      'anthropic/claude-3-haiku',
      'openai/gpt-3.5-turbo',
      'google/gemini-pro',
      'anthropic/claude-3-sonnet',
    ],
  }

  // Safe default fallbacks - all verified to work with OpenRouter
  return fallbackMap[primaryModel] || [
    'anthropic/claude-3-sonnet',
    'openai/gpt-3.5-turbo',
    'google/gemini-pro',
  ]
}

/**
 * Execute operation with automatic model fallback
 * Tries primary model, then falls back to alternatives on failure
 */
export async function withFallbackModels<T>(
  primaryModel: string,
  operation: (model: string) => Promise<T>,
  operationName: string
): Promise<{ result: T; modelUsed: string }> {
  const modelsToTry = [primaryModel, ...getFallbackModels(primaryModel)]
  let lastError: Error | null = null

  for (const model of modelsToTry) {
    try {
      console.log(`[${operationName}] Attempting with model: ${model}`)

      const result = await withRetry(
        () => operation(model),
        `${operationName} (${model})`
      )

      console.log(`[${operationName}] Success with model: ${model}`)
      return { result, modelUsed: model }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`[${operationName}] Failed with model ${model}:`, lastError.message)

      // Skip rate limit and circuit breaker errors for fallback logic
      if (error instanceof RateLimitError || error instanceof CircuitBreakerOpenError) {
        throw error
      }

      // Continue to next model
    }
  }

  throw new AIServiceError(
    `All fallback models exhausted for ${operationName}. Last error: ${lastError?.message}`,
    'ALL_MODELS_FAILED',
    false,
    lastError || undefined
  )
}

/**
 * Get circuit breaker status for monitoring
 */
export function getCircuitBreakerStatus() {
  return {
    state: openRouterCircuitBreaker.getState(),
    timestamp: new Date().toISOString(),
  }
}

/**
 * Get rate limiter status for monitoring
 */
export function getRateLimiterStatus() {
  return {
    remaining: openRouterRateLimiter.getRemainingRequests(),
    windowMs: 60000,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create error response for API
 */
export function createErrorResponse(error: unknown) {
  if (error instanceof AIServiceError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      retryable: error.retryable,
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: 'UNKNOWN_ERROR',
      retryable: true,
    }
  }

  return {
    success: false,
    error: 'Unknown error occurred',
    code: 'UNKNOWN_ERROR',
    retryable: true,
  }
}

/**
 * Log error with context for debugging
 */
export function logError(
  operationName: string,
  error: unknown,
  context?: Record<string, unknown>
) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorCode = error instanceof AIServiceError ? error.code : 'UNKNOWN'

  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      operation: operationName,
      error: errorMessage,
      code: errorCode,
      context,
    })
  )
}
