/**
 * Next.js Middleware for API Relay
 *
 * Handles:
 * - Rate limiting for /api/v1/* routes
 * - CORS headers
 * - Request logging (optional)
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { TIMING } from '@/lib/config/constants'

// ============================================================================
// Configuration
// ============================================================================

const RATE_LIMIT_CONFIG = {
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.API_RATE_LIMIT_MAX || '100', 10),
}

const CORS_CONFIG = {
  allowedOrigins: process.env.API_CORS_ORIGINS?.split(',') || ['*'],
  allowedMethods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
  maxAge: 86400, // 24 hours
}

// Skip rate limiting for these paths
const SKIP_RATE_LIMIT_PATHS = ['/api/health', '/api/v1/stats']

// ============================================================================
// In-Memory Rate Limiter
// ============================================================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup interval (every 60 seconds)
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key)
      }
    }
  }, TIMING.CLEANUP_INTERVAL)
}

function checkRateLimit(clientKey: string): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  let entry = rateLimitStore.get(clientKey)

  // Initialize or reset expired window
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + RATE_LIMIT_CONFIG.windowMs,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(clientKey, entry)

  return {
    allowed: entry.count <= RATE_LIMIT_CONFIG.max,
    remaining: Math.max(0, RATE_LIMIT_CONFIG.max - entry.count),
    resetAt: entry.resetAt,
  }
}

function getClientKey(request: NextRequest): string {
  // Try various headers for client identification
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]
    return firstIp ? firstIp.trim() : 'unknown'
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback when no IP headers are available
  return 'unknown'
}

// ============================================================================
// CORS Helper
// ============================================================================

function getCorsHeaders(origin: string | null): Record<string, string> {
  let allowedOrigin = '*'

  if (CORS_CONFIG.allowedOrigins.includes('*')) {
    allowedOrigin = origin || '*'
  } else if (origin && CORS_CONFIG.allowedOrigins.includes(origin)) {
    allowedOrigin = origin
  } else if (CORS_CONFIG.allowedOrigins[0]) {
    allowedOrigin = CORS_CONFIG.allowedOrigins[0]
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': CORS_CONFIG.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders.join(', '),
    'Access-Control-Max-Age': CORS_CONFIG.maxAge.toString(),
  }
}

// ============================================================================
// Middleware
// ============================================================================

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')

  // Only apply to API v1 routes
  if (!pathname.startsWith('/api/v1')) {
    return NextResponse.next()
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    })
  }

  // Skip rate limiting for certain paths
  const shouldSkipRateLimit = SKIP_RATE_LIMIT_PATHS.some((path) =>
    pathname.startsWith(path)
  )

  if (!shouldSkipRateLimit) {
    // Check rate limit
    const clientKey = getClientKey(request)
    const rateLimit = checkRateLimit(clientKey)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            message: 'Rate limit exceeded. Please try again later.',
            code: 'RATE_LIMITED',
          },
        },
        {
          status: 429,
          headers: {
            ...getCorsHeaders(origin),
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetAt / 1000).toString(),
            'Retry-After': Math.ceil(
              (rateLimit.resetAt - Date.now()) / 1000
            ).toString(),
          },
        }
      )
    }

    // Add rate limit headers to successful response
    const response = NextResponse.next()

    // Add CORS headers
    Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.max.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set(
      'X-RateLimit-Reset',
      Math.ceil(rateLimit.resetAt / 1000).toString()
    )

    return response
  }

  // For skipped paths, just add CORS headers
  const response = NextResponse.next()
  Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: '/api/v1/:path*',
}
