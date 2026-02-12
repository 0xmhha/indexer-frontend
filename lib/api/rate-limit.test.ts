import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  RateLimiter,
  createRateLimiter,
  DEFAULT_RATE_LIMIT_CONFIG,
  type RateLimitResult,
} from '@/lib/api/rate-limit'

describe('RateLimiter', () => {
  let limiter: RateLimiter

  afterEach(() => {
    limiter?.destroy()
    vi.useRealTimers()
  })

  describe('check', () => {
    it('allows the first request with remaining = max - 1', () => {
      limiter = new RateLimiter({ windowMs: 60_000, max: 10 })

      const result = limiter.check('client-1')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
      expect(result.limit).toBe(10)
      expect(result.resetAt).toBeGreaterThan(Date.now() - 1)
    })

    it('allows all requests within the limit and decrements remaining', () => {
      limiter = new RateLimiter({ windowMs: 60_000, max: 5 })

      const results: RateLimitResult[] = []
      for (let i = 0; i < 5; i++) {
        results.push(limiter.check('client-1'))
      }

      expect(results.every((r) => r.allowed)).toBe(true)
      expect(results.map((r) => r.remaining)).toEqual([4, 3, 2, 1, 0])
    })

    it('rejects requests that exceed the limit', () => {
      limiter = new RateLimiter({ windowMs: 60_000, max: 3 })

      // Exhaust the limit
      limiter.check('client-1')
      limiter.check('client-1')
      limiter.check('client-1')

      const result = limiter.check('client-1')

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.limit).toBe(3)
    })

    it('resets the count after the window expires', () => {
      vi.useFakeTimers()

      limiter = new RateLimiter({ windowMs: 10_000, max: 2 })

      // Exhaust limit
      limiter.check('client-1')
      limiter.check('client-1')
      const blocked = limiter.check('client-1')
      expect(blocked.allowed).toBe(false)

      // Advance past the window
      vi.advanceTimersByTime(10_001)

      const afterReset = limiter.check('client-1')
      expect(afterReset.allowed).toBe(true)
      expect(afterReset.remaining).toBe(1)
    })

    it('tracks separate keys independently', () => {
      limiter = new RateLimiter({ windowMs: 60_000, max: 1 })

      const resultA = limiter.check('client-a')
      const resultB = limiter.check('client-b')

      expect(resultA.allowed).toBe(true)
      expect(resultB.allowed).toBe(true)

      // Now both are exhausted
      expect(limiter.check('client-a').allowed).toBe(false)
      expect(limiter.check('client-b').allowed).toBe(false)
    })

    it('uses the configured key prefix for namespacing', () => {
      limiter = new RateLimiter({
        windowMs: 60_000,
        max: 1,
        keyPrefix: 'custom',
      })

      // Prefix should not affect external key behavior;
      // two limiters with different prefixes should not collide.
      const result = limiter.check('client-1')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(0)
    })
  })

  describe('shouldSkip', () => {
    it('returns true for a path matching a skip path', () => {
      limiter = new RateLimiter({
        windowMs: 60_000,
        max: 10,
        skipPaths: ['/api/health', '/api/v1/stats'],
      })

      expect(limiter.shouldSkip('/api/health')).toBe(true)
      expect(limiter.shouldSkip('/api/v1/stats')).toBe(true)
    })

    it('returns true for a path that starts with a skip path', () => {
      limiter = new RateLimiter({
        windowMs: 60_000,
        max: 10,
        skipPaths: ['/api/health'],
      })

      expect(limiter.shouldSkip('/api/health/check')).toBe(true)
    })

    it('returns false for a non-matching path', () => {
      limiter = new RateLimiter({
        windowMs: 60_000,
        max: 10,
        skipPaths: ['/api/health'],
      })

      expect(limiter.shouldSkip('/api/users')).toBe(false)
    })

    it('returns false when no skip paths are configured', () => {
      limiter = new RateLimiter({ windowMs: 60_000, max: 10 })

      expect(limiter.shouldSkip('/api/anything')).toBe(false)
    })
  })

  describe('getHeaders', () => {
    beforeEach(() => {
      limiter = new RateLimiter({ windowMs: 60_000, max: 10 })
    })

    it('includes Limit, Remaining, and Reset headers when allowed', () => {
      const result: RateLimitResult = {
        allowed: true,
        remaining: 9,
        resetAt: 1700000060000,
        limit: 10,
      }

      const headers = limiter.getHeaders(result)

      expect(headers['X-RateLimit-Limit']).toBe('10')
      expect(headers['X-RateLimit-Remaining']).toBe('9')
      expect(headers['X-RateLimit-Reset']).toBe(
        Math.ceil(1700000060000 / 1000).toString()
      )
      expect(headers['Retry-After']).toBeUndefined()
    })

    it('includes Retry-After header when not allowed', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))

      const resetAt = Date.now() + 30_000

      const result: RateLimitResult = {
        allowed: false,
        remaining: 0,
        resetAt,
        limit: 10,
      }

      const headers = limiter.getHeaders(result)

      expect(headers['X-RateLimit-Limit']).toBe('10')
      expect(headers['X-RateLimit-Remaining']).toBe('0')
      expect(headers['Retry-After']).toBe('30')
    })
  })

  describe('getKeyFromRequest', () => {
    it('uses the first IP from x-forwarded-for header', () => {
      limiter = new RateLimiter({ windowMs: 60_000, max: 10 })

      const request = new Request('http://localhost/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
        },
      })

      expect(limiter.getKeyFromRequest(request)).toBe('192.168.1.1')
    })

    it('trims whitespace from the first IP in x-forwarded-for', () => {
      limiter = new RateLimiter({ windowMs: 60_000, max: 10 })

      const request = new Request('http://localhost/api/test', {
        headers: {
          'x-forwarded-for': '  10.0.0.5  , 10.0.0.2',
        },
      })

      expect(limiter.getKeyFromRequest(request)).toBe('10.0.0.5')
    })

    it('uses x-real-ip header when x-forwarded-for is absent', () => {
      limiter = new RateLimiter({ windowMs: 60_000, max: 10 })

      const request = new Request('http://localhost/api/test', {
        headers: {
          'x-real-ip': '10.20.30.40',
        },
      })

      expect(limiter.getKeyFromRequest(request)).toBe('10.20.30.40')
    })

    it('returns "unknown" when no IP headers are present', () => {
      limiter = new RateLimiter({ windowMs: 60_000, max: 10 })

      const request = new Request('http://localhost/api/test')

      expect(limiter.getKeyFromRequest(request)).toBe('unknown')
    })

    it('uses a custom keyGenerator when provided', () => {
      limiter = new RateLimiter({
        windowMs: 60_000,
        max: 10,
        keyGenerator: (req: Request) => {
          return req.headers.get('authorization') || 'anon'
        },
      })

      const request = new Request('http://localhost/api/test', {
        headers: {
          authorization: 'Bearer token-abc',
        },
      })

      expect(limiter.getKeyFromRequest(request)).toBe('Bearer token-abc')
    })
  })

  describe('destroy', () => {
    it('can be called without error', () => {
      limiter = new RateLimiter({ windowMs: 60_000, max: 10 })

      expect(() => limiter.destroy()).not.toThrow()
    })

    it('can be called multiple times safely', () => {
      limiter = new RateLimiter({ windowMs: 60_000, max: 10 })

      limiter.destroy()
      expect(() => limiter.destroy()).not.toThrow()
    })
  })
})

describe('createRateLimiter', () => {
  let limiter: RateLimiter

  afterEach(() => {
    limiter?.destroy()
  })

  it('creates a limiter with default configuration', () => {
    limiter = createRateLimiter()

    // Should work with default max of 100
    const result = limiter.check('test-key')
    expect(result.allowed).toBe(true)
    expect(result.limit).toBe(100)
    expect(result.remaining).toBe(99)
  })

  it('creates a limiter with overrides merged into defaults', () => {
    limiter = createRateLimiter({ max: 5, keyPrefix: 'override' })

    const result = limiter.check('test-key')
    expect(result.allowed).toBe(true)
    expect(result.limit).toBe(5)
    expect(result.remaining).toBe(4)
  })

  it('respects environment variable overrides', () => {
    const originalWindow = process.env.API_RATE_LIMIT_MAX
    const originalWindowMs = process.env.API_RATE_LIMIT_WINDOW_MS

    try {
      process.env.API_RATE_LIMIT_MAX = '3'
      process.env.API_RATE_LIMIT_WINDOW_MS = '30000'

      limiter = createRateLimiter()

      const result = limiter.check('test-key')
      expect(result.limit).toBe(3)
    } finally {
      if (originalWindow !== undefined) {
        process.env.API_RATE_LIMIT_MAX = originalWindow
      } else {
        delete process.env.API_RATE_LIMIT_MAX
      }
      if (originalWindowMs !== undefined) {
        process.env.API_RATE_LIMIT_WINDOW_MS = originalWindowMs
      } else {
        delete process.env.API_RATE_LIMIT_WINDOW_MS
      }
    }
  })

  it('allows explicit overrides to take precedence over env vars', () => {
    const originalMax = process.env.API_RATE_LIMIT_MAX

    try {
      process.env.API_RATE_LIMIT_MAX = '50'

      limiter = createRateLimiter({ max: 7 })

      const result = limiter.check('test-key')
      expect(result.limit).toBe(7)
    } finally {
      if (originalMax !== undefined) {
        process.env.API_RATE_LIMIT_MAX = originalMax
      } else {
        delete process.env.API_RATE_LIMIT_MAX
      }
    }
  })
})

describe('DEFAULT_RATE_LIMIT_CONFIG', () => {
  it('has expected default values', () => {
    expect(DEFAULT_RATE_LIMIT_CONFIG.windowMs).toBe(60_000)
    expect(DEFAULT_RATE_LIMIT_CONFIG.max).toBe(100)
    expect(DEFAULT_RATE_LIMIT_CONFIG.keyPrefix).toBe('api')
    expect(DEFAULT_RATE_LIMIT_CONFIG.skipPaths).toEqual([
      '/api/health',
      '/api/v1/stats',
    ])
  })
})
