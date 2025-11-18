/**
 * Core TypeScript types for Blockchain Explorer
 */

// Result type for error handling
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }

// Application-level error types
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string,
    originalError?: unknown
  ) {
    super('VALIDATION_ERROR', message, originalError)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super('NETWORK_ERROR', message, originalError)
    this.name = 'NetworkError'
  }
}

export class GraphQLError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super('GRAPHQL_ERROR', message, originalError)
    this.name = 'GraphQLError'
  }
}

// Pagination types
export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResult<T> {
  nodes: T[]
  totalCount: number
  pageInfo: PageInfo
}
