/**
 * Error Recovery Utilities
 * Provides retry logic and error recovery strategies
 */

import { isRetryableError, TimeoutError } from './types'
import { errorLogger } from './logger'

interface RetryOptions {
  maxRetries?: number
  delayMs?: number
  backoffMultiplier?: number
  onRetry?: (error: unknown, attempt: number) => void
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if error is not retryable or we've exceeded max retries
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = delayMs * Math.pow(backoffMultiplier, attempt)

      // Log retry attempt
      errorLogger.warn(error, {
        action: 'retry',
        metadata: {
          attempt: attempt + 1,
          maxRetries,
          nextDelay: delay,
        },
      })

      // Call onRetry callback
      if (onRetry) {
        onRetry(error, attempt + 1)
      }

      // Wait before retrying
      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * Execute function with timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  operation = 'Operation'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(operation))
    }, timeoutMs)

    fn()
      .then((result) => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

/**
 * Execute function with retry and timeout
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  options: RetryOptions & { timeoutMs?: number; operation?: string } = {}
): Promise<T> {
  const { timeoutMs = 30000, operation = 'Operation', ...retryOptions } = options

  return withRetry(
    () => withTimeout(fn, timeoutMs, operation),
    retryOptions
  )
}

/**
 * Fallback value on error
 */
export async function withFallback<T>(
  fn: () => Promise<T>,
  fallbackValue: T,
  logError = true
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (logError) {
      errorLogger.warn(error, { action: 'fallback' })
    }
    return fallbackValue
  }
}

/**
 * Execute multiple functions in parallel with fallback
 */
export async function withParallelFallback<T>(
  fns: (() => Promise<T>)[],
  fallbackValue: T
): Promise<T> {
  const promises = fns.map((fn) =>
    fn().catch((error) => {
      errorLogger.warn(error, { action: 'parallel_fallback' })
      return null
    })
  )

  const results = await Promise.all(promises)
  const successfulResult = results.find((result) => result !== null)

  return successfulResult ?? fallbackValue
}

/**
 * Circuit breaker for preventing cascading failures
 */
export class CircuitBreaker {
  private failureCount = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private threshold = 5,
    private timeout = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        // Try to close circuit
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }

    try {
      const result = await fn()

      // Success - reset circuit
      if (this.state === 'half-open') {
        this.state = 'closed'
      }
      this.failureCount = 0

      return result
    } catch (error) {
      this.failureCount++
      this.lastFailureTime = Date.now()

      // Open circuit if threshold exceeded
      if (this.failureCount >= this.threshold) {
        this.state = 'open'
        errorLogger.error(
          new Error(`Circuit breaker opened after ${this.failureCount} failures`),
          { action: 'circuit_breaker_open' }
        )
      }

      throw error
    }
  }

  reset(): void {
    this.failureCount = 0
    this.lastFailureTime = 0
    this.state = 'closed'
  }

  getState(): { state: string; failureCount: number; lastFailureTime: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    }
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
