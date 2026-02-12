/**
 * API Rate Limiting
 *
 * Token bucket algorithm implementation for rate limiting.
 * Memory-based for single instance, can be extended to Redis for distributed deployments.
 *
 * @example
 * ```typescript
 * const limiter = new RateLimiter({ windowMs: 60000, max: 100 })
 * const result = await limiter.check(clientIp)
 * if (!result.allowed) {
 *   return new Response('Rate limit exceeded', { status: 429 })
 * }
 * ```
 */

import { TIMING } from '@/lib/config/constants'

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  /** Time window in milliseconds */
  windowMs: number
  /** Maximum requests per window */
  max: number
  /** Key prefix for namespacing */
  keyPrefix?: string
  /** Skip rate limiting for these paths */
  skipPaths?: string[]
  /** Custom key generator */
  keyGenerator?: (request: Request) => string
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  limit: number
}

/**
 * Client rate limit state
 */
interface ClientState {
  count: number
  resetAt: number
}

/**
 * In-memory rate limiter storage
 */
class MemoryRateLimitStore {
  private clients = new Map<string, ClientState>()
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    // Cleanup expired entries every minute
    if (typeof window === 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, TIMING.CLEANUP_INTERVAL)
    }
  }

  get(key: string): ClientState | undefined {
    return this.clients.get(key)
  }

  set(key: string, state: ClientState): void {
    this.clients.set(key, state)
  }

  delete(key: string): void {
    this.clients.delete(key)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, state] of this.clients.entries()) {
      if (now > state.resetAt) {
        this.clients.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

/**
 * Rate limiter implementation
 */
export class RateLimiter {
  private config: Required<RateLimiterConfig>
  private store = new MemoryRateLimitStore()

  constructor(config: RateLimiterConfig) {
    this.config = {
      windowMs: config.windowMs,
      max: config.max,
      keyPrefix: config.keyPrefix || 'rl',
      skipPaths: config.skipPaths || [],
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
    }
  }

  /**
   * Check if request is allowed
   */
  check(key: string): RateLimitResult {
    const fullKey = `${this.config.keyPrefix}:${key}`
    const now = Date.now()

    let state = this.store.get(fullKey)

    // Initialize or reset expired window
    if (!state || now > state.resetAt) {
      state = {
        count: 0,
        resetAt: now + this.config.windowMs,
      }
    }

    // Increment count
    state.count++
    this.store.set(fullKey, state)

    const allowed = state.count <= this.config.max
    const remaining = Math.max(0, this.config.max - state.count)

    return {
      allowed,
      remaining,
      resetAt: state.resetAt,
      limit: this.config.max,
    }
  }

  /**
   * Check if path should skip rate limiting
   */
  shouldSkip(path: string): boolean {
    return this.config.skipPaths.some((skip) => path.startsWith(skip))
  }

  /**
   * Default key generator using IP address
   */
  private defaultKeyGenerator(request: Request): string {
    // Try various headers for client IP
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
      const firstIp = forwardedFor.split(',')[0]
      return firstIp ? firstIp.trim() : 'unknown'
    }

    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
      return realIp
    }

    return 'unknown'
  }

  /**
   * Get key from request
   */
  getKeyFromRequest(request: Request): string {
    return this.config.keyGenerator(request)
  }

  /**
   * Clean up resources (cleanup interval)
   */
  destroy(): void {
    this.store.destroy()
  }

  /**
   * Generate rate limit headers
   */
  getHeaders(result: RateLimitResult): Record<string, string> {
    return {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
      ...(result.allowed
        ? {}
        : {
            'Retry-After': Math.ceil(
              (result.resetAt - Date.now()) / 1000
            ).toString(),
          }),
    }
  }
}

/**
 * Default rate limiter configuration
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimiterConfig = {
  windowMs: TIMING.CLEANUP_INTERVAL, // 1 minute
  max: 100, // 100 requests per minute
  keyPrefix: 'api',
  skipPaths: ['/api/health', '/api/v1/stats'], // Stats can be cached
}

/**
 * Create rate limiter with environment configuration
 */
export function createRateLimiter(
  overrides?: Partial<RateLimiterConfig>
): RateLimiter {
  const windowMs = process.env.API_RATE_LIMIT_WINDOW_MS
    ? parseInt(process.env.API_RATE_LIMIT_WINDOW_MS, 10)
    : DEFAULT_RATE_LIMIT_CONFIG.windowMs

  const max = process.env.API_RATE_LIMIT_MAX
    ? parseInt(process.env.API_RATE_LIMIT_MAX, 10)
    : DEFAULT_RATE_LIMIT_CONFIG.max

  return new RateLimiter({
    ...DEFAULT_RATE_LIMIT_CONFIG,
    windowMs,
    max,
    ...overrides,
  })
}

// Singleton rate limiter instance
export const apiRateLimiter = createRateLimiter()
