/**
 * Error Monitoring API
 *
 * POST /api/v1/errors - Receive error reports from clients
 * GET /api/v1/errors - Get error statistics and recent errors
 * DELETE /api/v1/errors - Clear error logs (admin only)
 */

import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleCorsOptions,
} from '@/lib/api/response'
import { errorLogger } from '@/lib/errors/logger'
import { HTTP_STATUS } from '@/lib/config/constants'

export const dynamic = 'force-dynamic'

// In-memory error storage for server-side
// In production, this should use a proper database or monitoring service
interface ServerErrorLog {
  timestamp: string
  message: string
  stack?: string
  context?: {
    component?: string
    action?: string
    userId?: string
    metadata?: Record<string, unknown>
  }
  severity: 'error' | 'warning' | 'info'
  userAgent?: string
  url?: string
  ip?: string
}

interface ErrorBatch {
  errors: ServerErrorLog[]
  timestamp: string
}

// Server-side error storage (in-memory for now)
// Replace with database in production
const serverErrors: ServerErrorLog[] = []
const MAX_SERVER_ERRORS = 1000

// Error statistics
interface ErrorStats {
  totalErrors: number
  errorsBySeverity: {
    error: number
    warning: number
    info: number
  }
  errorsByComponent: Record<string, number>
  recentErrors: ServerErrorLog[]
  lastErrorTime: string | null
}

/**
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return handleCorsOptions()
}

/**
 * POST /api/v1/errors
 * Receive error reports from clients
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ErrorBatch

    if (!body.errors || !Array.isArray(body.errors)) {
      return errorResponse('Invalid error batch format', HTTP_STATUS.BAD_REQUEST, 'INVALID_FORMAT')
    }

    // Get client IP (for tracking)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'

    // Process each error
    for (const error of body.errors) {
      const serverError: ServerErrorLog = {
        timestamp: error.timestamp || new Date().toISOString(),
        message: error.message || 'Unknown error',
        severity: error.severity || 'error',
      }

      // Only add optional properties if they have values
      if (ip) {serverError.ip = ip}
      if (error.stack) {serverError.stack = error.stack}
      if (error.context) {serverError.context = error.context}
      if (error.userAgent) {serverError.userAgent = error.userAgent}
      if (error.url) {serverError.url = error.url}

      // Add to server storage
      serverErrors.push(serverError)

      // Keep only recent errors
      if (serverErrors.length > MAX_SERVER_ERRORS) {
        serverErrors.shift()
      }

      // Log to server-side logger with context
      const logContext = error.context
        ? { ...error.context, metadata: { ...error.context.metadata, ip } }
        : { component: 'client', metadata: { ip } }

      errorLogger.log(
        new Error(error.message),
        logContext,
        error.severity || 'error'
      )
    }

    return successResponse({
      received: body.errors.length,
      timestamp: new Date().toISOString(),
    }, HTTP_STATUS.ACCEPTED)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/errors', action: 'receive-batch' })
    return errorResponse('Failed to process error batch', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'PROCESSING_ERROR')
  }
}

/**
 * GET /api/v1/errors
 * Get error statistics and recent errors
 *
 * Query params:
 * - limit: number of recent errors to return (default: 50, max: 200)
 * - severity: filter by severity (error, warning, info)
 * - component: filter by component
 * - since: ISO timestamp to get errors after
 */
export async function GET(request: NextRequest) {
  try {
    // Check for admin authorization (simple API key check)
    // In production, use proper authentication
    const apiKey = request.headers.get('x-api-key')
    const expectedKey = process.env.ERROR_MONITORING_API_KEY

    // If API key is configured, require it
    if (expectedKey && apiKey !== expectedKey) {
      return errorResponse('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED')
    }

    const { searchParams } = new URL(request.url)
    const MAX_ERROR_QUERY_LIMIT = 200
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), MAX_ERROR_QUERY_LIMIT)
    const severity = searchParams.get('severity') as 'error' | 'warning' | 'info' | null
    const component = searchParams.get('component')
    const since = searchParams.get('since')

    // Filter errors
    let filteredErrors = [...serverErrors]

    if (severity) {
      filteredErrors = filteredErrors.filter(e => e.severity === severity)
    }

    if (component) {
      filteredErrors = filteredErrors.filter(e => e.context?.component === component)
    }

    if (since) {
      const sinceDate = new Date(since)
      filteredErrors = filteredErrors.filter(e => new Date(e.timestamp) > sinceDate)
    }

    // Get recent errors (most recent first)
    const recentErrors = filteredErrors.slice(-limit).reverse()

    // Get last error for timestamp
    const lastError = serverErrors.length > 0 ? serverErrors[serverErrors.length - 1] : null

    // Calculate statistics
    const stats: ErrorStats = {
      totalErrors: serverErrors.length,
      errorsBySeverity: {
        error: serverErrors.filter(e => e.severity === 'error').length,
        warning: serverErrors.filter(e => e.severity === 'warning').length,
        info: serverErrors.filter(e => e.severity === 'info').length,
      },
      errorsByComponent: getErrorsByComponent(serverErrors),
      recentErrors,
      lastErrorTime: lastError?.timestamp ?? null,
    }

    return successResponse(stats)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/errors', action: 'get-stats' })
    return errorResponse('Failed to fetch error statistics', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'FETCH_ERROR')
  }
}

/**
 * DELETE /api/v1/errors
 * Clear error logs (requires admin API key)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require API key for deletion
    const apiKey = request.headers.get('x-api-key')
    const expectedKey = process.env.ERROR_MONITORING_API_KEY

    if (!expectedKey || apiKey !== expectedKey) {
      return errorResponse('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED')
    }

    const clearedCount = serverErrors.length
    serverErrors.length = 0

    return successResponse({
      cleared: clearedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/errors', action: 'clear-logs' })
    return errorResponse('Failed to clear error logs', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'CLEAR_ERROR')
  }
}

/**
 * Get error counts by component
 */
function getErrorsByComponent(errors: ServerErrorLog[]): Record<string, number> {
  const counts: Record<string, number> = {}

  for (const error of errors) {
    const component = error.context?.component || 'unknown'
    counts[component] = (counts[component] || 0) + 1
  }

  return counts
}
