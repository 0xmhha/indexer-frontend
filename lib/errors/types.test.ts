import { describe, it, expect } from 'vitest'
import {
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

describe('AppError', () => {
  it('should create error with message', () => {
    const error = new AppError('Test error')
    expect(error.message).toBe('Test error')
    expect(error.name).toBe('AppError')
  })

  it('should create error with code and status', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 400)
    expect(error.code).toBe('TEST_ERROR')
    expect(error.statusCode).toBe(400)
  })

  it('should create error with details', () => {
    const details = { field: 'email', value: 'invalid' }
    const error = new AppError('Test error', 'TEST_ERROR', 400, details)
    expect(error.details).toEqual(details)
  })

  it('should have stack trace', () => {
    const error = new AppError('Test error')
    expect(error.stack).toBeDefined()
  })
})

describe('NetworkError', () => {
  it('should create network error', () => {
    const error = new NetworkError('Connection failed')
    expect(error.message).toBe('Connection failed')
    expect(error.name).toBe('NetworkError')
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.statusCode).toBe(0)
  })

  it('should create network error with details', () => {
    const details = { url: 'http://example.com' }
    const error = new NetworkError('Connection failed', details)
    expect(error.details).toEqual(details)
  })
})

describe('GraphQLError', () => {
  it('should create GraphQL error', () => {
    const error = new GraphQLError('Query failed')
    expect(error.message).toBe('Query failed')
    expect(error.name).toBe('GraphQLError')
    expect(error.code).toBe('GRAPHQL_ERROR')
    expect(error.statusCode).toBe(400)
  })

  it('should store GraphQL errors', () => {
    const graphQLErrors = [{ message: 'Field error' }]
    const error = new GraphQLError('Query failed', graphQLErrors)
    expect(error.graphQLErrors).toEqual(graphQLErrors)
  })
})

describe('ValidationError', () => {
  it('should create validation error', () => {
    const error = new ValidationError('Invalid input')
    expect(error.message).toBe('Invalid input')
    expect(error.name).toBe('ValidationError')
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.statusCode).toBe(400)
  })

  it('should store field name', () => {
    const error = new ValidationError('Invalid email', 'email')
    expect(error.field).toBe('email')
  })
})

describe('NotFoundError', () => {
  it('should create not found error', () => {
    const error = new NotFoundError('User')
    expect(error.message).toBe('User not found')
    expect(error.name).toBe('NotFoundError')
    expect(error.code).toBe('NOT_FOUND')
    expect(error.statusCode).toBe(404)
  })
})

describe('TimeoutError', () => {
  it('should create timeout error', () => {
    const error = new TimeoutError('Fetch data')
    expect(error.message).toBe('Operation timed out: Fetch data')
    expect(error.name).toBe('TimeoutError')
    expect(error.code).toBe('TIMEOUT')
    expect(error.statusCode).toBe(408)
  })
})

describe('Web3Error', () => {
  it('should create Web3 error', () => {
    const error = new Web3Error('Transaction failed')
    expect(error.message).toBe('Transaction failed')
    expect(error.name).toBe('Web3Error')
    expect(error.code).toBe('WEB3_ERROR')
    expect(error.statusCode).toBe(400)
  })

  it('should create Web3 error with details', () => {
    const details = { txHash: '0x123' }
    const error = new Web3Error('Transaction failed', details)
    expect(error.details).toEqual(details)
  })
})

describe('isAppError', () => {
  it('should return true for AppError instances', () => {
    expect(isAppError(new AppError('Test'))).toBe(true)
    expect(isAppError(new NetworkError('Test'))).toBe(true)
    expect(isAppError(new GraphQLError('Test'))).toBe(true)
    expect(isAppError(new ValidationError('Test'))).toBe(true)
    expect(isAppError(new NotFoundError('Test'))).toBe(true)
    expect(isAppError(new TimeoutError('Test'))).toBe(true)
    expect(isAppError(new Web3Error('Test'))).toBe(true)
  })

  it('should return false for non-AppError instances', () => {
    expect(isAppError(new Error('Test'))).toBe(false)
    expect(isAppError('string error')).toBe(false)
    expect(isAppError(null)).toBe(false)
    expect(isAppError(undefined)).toBe(false)
    expect(isAppError({})).toBe(false)
  })
})

describe('getErrorMessage', () => {
  it('should extract message from Error instance', () => {
    const error = new Error('Test error')
    expect(getErrorMessage(error)).toBe('Test error')
  })

  it('should extract message from AppError instance', () => {
    const error = new AppError('App error')
    expect(getErrorMessage(error)).toBe('App error')
  })

  it('should return string error as-is', () => {
    expect(getErrorMessage('String error')).toBe('String error')
  })

  it('should return default message for unknown errors', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred')
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred')
    expect(getErrorMessage({})).toBe('An unexpected error occurred')
    expect(getErrorMessage(123)).toBe('An unexpected error occurred')
  })
})

describe('isNetworkError', () => {
  it('should return true for NetworkError instances', () => {
    expect(isNetworkError(new NetworkError('Test'))).toBe(true)
  })

  it('should return true for errors with network keywords', () => {
    expect(isNetworkError(new Error('network failed'))).toBe(true)
    expect(isNetworkError(new Error('fetch error'))).toBe(true)
    expect(isNetworkError(new Error('timeout occurred'))).toBe(true)
    expect(isNetworkError(new Error('ECONNREFUSED'))).toBe(true)
  })

  it('should return false for non-network errors', () => {
    expect(isNetworkError(new Error('validation failed'))).toBe(false)
    expect(isNetworkError(new ValidationError('Test'))).toBe(false)
    expect(isNetworkError('string error')).toBe(false)
    expect(isNetworkError(null)).toBe(false)
  })
})

describe('isRetryableError', () => {
  it('should return true for network errors', () => {
    expect(isRetryableError(new NetworkError('Test'))).toBe(true)
    expect(isRetryableError(new Error('network failed'))).toBe(true)
  })

  it('should return true for timeout errors', () => {
    expect(isRetryableError(new TimeoutError('Test'))).toBe(true)
  })

  it('should return true for specific status codes', () => {
    expect(isRetryableError(new AppError('Test', 'TIMEOUT', 408))).toBe(true)
    expect(isRetryableError(new AppError('Test', 'RATE_LIMIT', 429))).toBe(true)
    expect(isRetryableError(new AppError('Test', 'UNAVAILABLE', 503))).toBe(true)
  })

  it('should return false for non-retryable errors', () => {
    expect(isRetryableError(new ValidationError('Test'))).toBe(false)
    expect(isRetryableError(new NotFoundError('Test'))).toBe(false)
    expect(isRetryableError(new AppError('Test', 'BAD_REQUEST', 400))).toBe(false)
    expect(isRetryableError(new Error('unknown error'))).toBe(false)
  })
})
