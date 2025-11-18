/**
 * Error handling utilities
 * Centralized error types, logging, and recovery strategies
 */

export {
  AppError,
  NetworkError,
  GraphQLError,
  ValidationError,
  NotFoundError,
  TimeoutError,
  Web3Error,
  isAppError,
  getErrorMessage,
  isNetworkError,
  isRetryableError,
} from './types'

export {
  errorLogger,
  useErrorLogger,
  withErrorLogging,
} from './logger'

export {
  withRetry,
  withTimeout,
  withRetryAndTimeout,
  withFallback,
  withParallelFallback,
  CircuitBreaker,
} from './recovery'
