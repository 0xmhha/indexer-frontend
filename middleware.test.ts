import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the constants module before importing middleware
vi.mock('@/lib/config/constants', () => ({
  TIMING: { CLEANUP_INTERVAL: 60000 },
}))

// Must import after mocks are set up
const { middleware } = await import('./middleware')

function createRequest(path: string, options: { method?: string; headers?: Record<string, string> } = {}): NextRequest {
  const url = `http://localhost:3000${path}`
  return new NextRequest(url, {
    method: options.method || 'GET',
    ...(options.headers ? { headers: new Headers(options.headers) } : {}),
  })
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should pass through non-API routes', () => {
    const request = createRequest('/blocks/123')
    const response = middleware(request)
    // NextResponse.next() passes through
    expect(response.status).toBe(200)
  })

  it('should pass through non-v1 API routes', () => {
    const request = createRequest('/api/health')
    const response = middleware(request)
    expect(response.status).toBe(200)
  })

  it('should return 204 for CORS preflight on API v1 routes', () => {
    const request = createRequest('/api/v1/blocks', {
      method: 'OPTIONS',
      headers: { origin: 'http://example.com' },
    })
    const response = middleware(request)
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
  })

  it('should add CORS headers to API v1 responses', () => {
    const request = createRequest('/api/v1/blocks', {
      headers: { origin: 'http://example.com' },
    })
    const response = middleware(request)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
  })

  it('should add rate limit headers to API v1 responses', () => {
    const request = createRequest('/api/v1/blocks', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    })
    const response = middleware(request)
    expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy()
    expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy()
    expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
  })

  it('should add security headers', () => {
    const request = createRequest('/api/v1/blocks')
    const response = middleware(request)
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(response.headers.get('Permissions-Policy')).toContain('camera=()')
  })

  it('should skip rate limiting for /api/v1/stats', () => {
    const request = createRequest('/api/v1/stats')
    const response = middleware(request)
    expect(response.status).toBe(200)
    // Should not have rate limit headers since it's skipped
    expect(response.headers.get('X-RateLimit-Limit')).toBeNull()
  })

  it('should identify client by x-forwarded-for header', () => {
    const request = createRequest('/api/v1/blocks', {
      headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2' },
    })
    const response = middleware(request)
    expect(response.status).toBe(200)
  })

  it('should identify client by x-real-ip header', () => {
    const request = createRequest('/api/v1/blocks', {
      headers: { 'x-real-ip': '10.0.0.1' },
    })
    const response = middleware(request)
    expect(response.status).toBe(200)
  })
})
