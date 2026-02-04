/**
 * API Relay Error Classes
 * Centralized error handling for REST API endpoints
 */

/**
 * Base API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Invalid address format error
 */
export class InvalidAddressError extends ApiError {
  constructor(address: string) {
    super(`Invalid address format: ${address}`, 'INVALID_ADDRESS', 400)
    this.name = 'InvalidAddressError'
  }
}

/**
 * Invalid hash format error
 */
export class InvalidHashError extends ApiError {
  constructor(hash: string) {
    super(`Invalid hash format: ${hash}`, 'INVALID_HASH', 400)
    this.name = 'InvalidHashError'
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends ApiError {
  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

/**
 * Indexer server connection error
 */
export class IndexerConnectionError extends ApiError {
  constructor(originalError?: Error) {
    super('Failed to connect to Indexer Server', 'INDEXER_CONNECTION_ERROR', 502)
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
    super(message, 'INDEXER_ERROR', 500)
    this.name = 'IndexerQueryError'
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends ApiError {
  constructor() {
    super('Rate limit exceeded', 'RATE_LIMITED', 429)
    this.name = 'RateLimitError'
  }
}

/**
 * Request timeout error
 */
export class TimeoutError extends ApiError {
  constructor() {
    super('Request timeout', 'TIMEOUT', 504)
    this.name = 'TimeoutError'
  }
}

/**
 * Invalid pagination parameters error
 */
export class InvalidPaginationError extends ApiError {
  constructor(message: string) {
    super(message, 'INVALID_PAGINATION', 400)
    this.name = 'InvalidPaginationError'
  }
}

/**
 * Unauthorized error (API key authentication)
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'UnauthorizedError'
  }
}
