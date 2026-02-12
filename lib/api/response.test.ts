import { describe, it, expect } from 'vitest'
import {
  successResponse,
  errorResponse,
  apiErrorResponse,
  paginatedResponse,
  parsePaginationParams,
  withCorsHeaders,
  handleCorsOptions,
} from '@/lib/api/response'
import { ApiError } from '@/lib/api/errors'

// Helper to extract JSON body from NextResponse
async function getBody(response: Response) {
  return response.json()
}

describe('successResponse', () => {
  it('returns 200 status by default', () => {
    const res = successResponse({ id: 1 })
    expect(res.status).toBe(200)
  })

  it('includes data in the response body', async () => {
    const res = successResponse({ name: 'test' })
    const body = await getBody(res)
    expect(body.status).toBe('success')
    expect(body.data).toEqual({ name: 'test' })
  })

  it('allows custom status code', () => {
    const res = successResponse('created', 201)
    expect(res.status).toBe(201)
  })

  it('handles null data', async () => {
    const res = successResponse(null)
    const body = await getBody(res)
    expect(body.data).toBeNull()
  })

  it('handles array data', async () => {
    const res = successResponse([1, 2, 3])
    const body = await getBody(res)
    expect(body.data).toEqual([1, 2, 3])
  })
})

describe('errorResponse', () => {
  it('returns 500 by default', () => {
    const res = errorResponse('Something broke')
    expect(res.status).toBe(500)
  })

  it('includes error message and default code in body', async () => {
    const res = errorResponse('fail')
    const body = await getBody(res)
    expect(body.status).toBe('error')
    expect(body.error.message).toBe('fail')
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('allows custom status and code', async () => {
    const res = errorResponse('bad input', 400, 'VALIDATION_ERROR')
    expect(res.status).toBe(400)
    const body = await getBody(res)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('apiErrorResponse', () => {
  it('uses ApiError properties for the response', async () => {
    const err = new ApiError('Not found', 'NOT_FOUND', 404)
    const res = apiErrorResponse(err)
    expect(res.status).toBe(404)
    const body = await getBody(res)
    expect(body.status).toBe('error')
    expect(body.error.message).toBe('Not found')
    expect(body.error.code).toBe('NOT_FOUND')
  })
})

describe('paginatedResponse', () => {
  it('includes items and pagination metadata', async () => {
    const res = paginatedResponse(['a', 'b'], 1, 10, 50)
    const body = await getBody(res)
    expect(body.status).toBe('success')
    expect(body.data.items).toEqual(['a', 'b'])
    expect(body.data.pagination.page).toBe(1)
    expect(body.data.pagination.limit).toBe(10)
    expect(body.data.pagination.total).toBe(50)
  })

  it('sets hasMore to true when more pages exist', async () => {
    const res = paginatedResponse([], 1, 10, 50)
    const body = await getBody(res)
    expect(body.data.pagination.hasMore).toBe(true)
  })

  it('sets hasMore to false on the last page', async () => {
    const res = paginatedResponse([], 5, 10, 50)
    const body = await getBody(res)
    expect(body.data.pagination.hasMore).toBe(false)
  })

  it('sets hasMore to false when items fit in one page', async () => {
    const res = paginatedResponse([], 1, 20, 5)
    const body = await getBody(res)
    expect(body.data.pagination.hasMore).toBe(false)
  })
})

describe('parsePaginationParams', () => {
  it('returns defaults when no params provided', () => {
    const params = new URLSearchParams()
    const result = parsePaginationParams(params)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.offset).toBe(0)
  })

  it('parses page and limit from query string', () => {
    const params = new URLSearchParams('page=3&limit=50')
    const result = parsePaginationParams(params)
    expect(result.page).toBe(3)
    expect(result.limit).toBe(50)
    expect(result.offset).toBe(100) // (3-1) * 50
  })

  it('clamps page minimum to 1', () => {
    const params = new URLSearchParams('page=-5')
    const result = parsePaginationParams(params)
    expect(result.page).toBe(1)
  })

  it('clamps limit minimum to 1', () => {
    const params = new URLSearchParams('limit=0')
    const result = parsePaginationParams(params)
    expect(result.limit).toBe(1)
  })

  it('clamps limit maximum to 100', () => {
    const params = new URLSearchParams('limit=999')
    const result = parsePaginationParams(params)
    expect(result.limit).toBe(100)
  })

  it('returns NaN for non-numeric values (parseInt behavior)', () => {
    const params = new URLSearchParams('page=abc&limit=xyz')
    const result = parsePaginationParams(params)
    expect(result.page).toBeNaN()
    expect(result.limit).toBeNaN()
  })
})

describe('withCorsHeaders', () => {
  it('adds CORS headers to a response', () => {
    const res = successResponse({ ok: true })
    const withCors = withCorsHeaders(res)
    expect(withCors.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(withCors.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS')
    expect(withCors.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type')
  })

  it('returns the same response object (mutates in-place)', () => {
    const res = successResponse('data')
    const withCors = withCorsHeaders(res)
    expect(withCors).toBe(res)
  })
})

describe('handleCorsOptions', () => {
  it('returns 204 status', () => {
    const res = handleCorsOptions()
    expect(res.status).toBe(204)
  })

  it('includes all CORS preflight headers', () => {
    const res = handleCorsOptions()
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS')
    expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type')
    expect(res.headers.get('Access-Control-Max-Age')).toBe('86400')
  })

  it('has no body', async () => {
    const res = handleCorsOptions()
    const body = await res.text()
    expect(body).toBe('')
  })
})
