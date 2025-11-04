/**
 * Custom error types for AI service
 * Separated from errorRecovery to avoid Server Action constraints
 */

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = true,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AIServiceError'
  }
}

export class RateLimitError extends AIServiceError {
  constructor(waitTimeMs: number) {
    super(`Rate limit exceeded. Wait ${waitTimeMs}ms before next request`, 'RATE_LIMIT_ERROR', true)
  }
}

export class CircuitBreakerOpenError extends AIServiceError {
  constructor() {
    super('Circuit breaker is open. Service temporarily unavailable.', 'CIRCUIT_BREAKER_OPEN', true)
  }
}

export class ModelNotAvailableError extends AIServiceError {
  constructor(modelId: string) {
    super(`Model ${modelId} is not available`, 'MODEL_NOT_AVAILABLE', false)
  }
}

export class InvalidConfigError extends AIServiceError {
  constructor(message: string) {
    super(message, 'INVALID_CONFIG', false)
  }
}

export class APIKeyError extends AIServiceError {
  constructor(message: string) {
    super(message, 'API_KEY_ERROR', false)
  }
}
