/**
 * API Relay Error Classes
 * Centralized error handling for REST API endpoints
 *
 * All API errors extend AppError for unified error handling across the app.
 */

import { HTTP_STATUS } from '@/lib/config/constants'
import { AppError } from '@/lib/errors/types'

/**
 * Base API Error class — extends AppError for a single error hierarchy
 */
export class ApiError extends AppError {
  constructor(
    message: string,
    code: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
  ) {
    super(message, code, statusCode)
    this.name = 'ApiError'
  }
}

/**
 * Invalid address format error
 */
export class InvalidAddressError extends ApiError {
  constructor(address: string) {
    super(`Invalid address format: ${address}`, 'INVALID_ADDRESS', HTTP_STATUS.BAD_REQUEST)
    this.name = 'InvalidAddressError'
  }
}

/**
 * Invalid hash format error
 */
export class InvalidHashError extends ApiError {
  constructor(hash: string) {
    super(`Invalid hash format: ${hash}`, 'INVALID_HASH', HTTP_STATUS.BAD_REQUEST)
    this.name = 'InvalidHashError'
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends ApiError {
  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`, 'NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    this.name = 'NotFoundError'
  }
}

/**
 * Indexer server connection error
 */
export class IndexerConnectionError extends ApiError {
  constructor(originalError?: Error) {
    super('Failed to connect to Indexer Server', 'INDEXER_CONNECTION_ERROR', HTTP_STATUS.BAD_GATEWAY)
    this.name = 'IndexerConnectionError'
    if (originalError) {
      this.cause = originalError
    }
  }
}

/**
 * Indexer server query error
 */
export class IndexerQueryError extends ApiError {
  constructor(message: string) {
    super(message, 'INDEXER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    this.name = 'IndexerQueryError'
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends ApiError {
  constructor() {
    super('Rate limit exceeded', 'RATE_LIMITED', HTTP_STATUS.TOO_MANY_REQUESTS)
    this.name = 'RateLimitError'
  }
}

/**
 * Request timeout error
 */
export class TimeoutError extends ApiError {
  constructor() {
    super('Request timeout', 'TIMEOUT', HTTP_STATUS.GATEWAY_TIMEOUT)
    this.name = 'TimeoutError'
  }
}

/**
 * Invalid pagination parameters error
 */
export class InvalidPaginationError extends ApiError {
  constructor(message: string) {
    super(message, 'INVALID_PAGINATION', HTTP_STATUS.BAD_REQUEST)
    this.name = 'InvalidPaginationError'
  }
}

/**
 * Unauthorized error (API key authentication)
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 'UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
    this.name = 'UnauthorizedError'
  }
}
