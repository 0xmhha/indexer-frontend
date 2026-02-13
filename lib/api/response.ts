/**
 * API Response Utilities
 * Helper functions for creating standardized API responses
 */

import { NextResponse } from 'next/server'
import { ApiError } from './errors'
import { HTTP_STATUS } from '@/lib/config/constants'

/**
 * Create a success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      status: 'success',
      data,
    },
    { status }
  )
}

/**
 * Create an error response from message and status
 */
export function errorResponse(
  message: string,
  status: number = 500,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      error: {
        message,
        code: code || 'INTERNAL_ERROR',
      },
    },
    { status }
  )
}

/**
 * Create an error response from ApiError
 */
export function apiErrorResponse(error: ApiError): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      error: {
        message: error.message,
        code: error.code,
      },
    },
    { status: error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR }
  )
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): NextResponse {
  return NextResponse.json({
    status: 'success',
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    },
  })
}

/**
 * Parse pagination query parameters
 */
export function parsePaginationParams(
  searchParams: URLSearchParams
): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Add CORS headers to response
 */
export function withCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleCorsOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}
