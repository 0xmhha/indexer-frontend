/**
 * Custom Error Types for type-safe error handling
 */

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', 0, details)
  }
}

/**
 * GraphQL API errors
 */
export class GraphQLError extends AppError {
  constructor(
    message: string,
    public graphQLErrors?: unknown[],
    details?: unknown
  ) {
    super(message, 'GRAPHQL_ERROR', 400, details)
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, public field?: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends AppError {
  constructor(operation: string) {
    super(`Operation timed out: ${operation}`, 'TIMEOUT', 408)
  }
}

/**
 * Wallet/Contract interaction errors
 */
export class Web3Error extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'WEB3_ERROR', 400, details)
  }
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return true
  }
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED')
    )
  }
  return false
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (isNetworkError(error)) {
    return true
  }
  if (error instanceof TimeoutError) {
    return true
  }
  if (isAppError(error)) {
    return error.statusCode === 408 || error.statusCode === 429 || error.statusCode === 503
  }
  return false
}
