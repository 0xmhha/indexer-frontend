import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  extractApiKey,
  validateApiKey,
  isApiKeyAuthEnabled,
  requireApiKey,
  optionalApiKey,
  TIER_RATE_LIMITS,
} from '@/lib/api/auth'

function makeRequest(url: string, headers?: Record<string, string>): Request {
  return headers ? new Request(url, { headers }) : new Request(url)
}

describe('extractApiKey', () => {
  it('extracts API key from the default X-API-Key header', () => {
    const req = makeRequest('http://localhost/api/test', { 'X-API-Key': 'key-123' })
    expect(extractApiKey(req)).toBe('key-123')
  })

  it('extracts API key from the api_key query parameter', () => {
    const req = makeRequest('http://localhost/api/test?api_key=query-key')
    expect(extractApiKey(req)).toBe('query-key')
  })

  it('prefers header over query parameter', () => {
    const req = makeRequest('http://localhost/api/test?api_key=query-key', {
      'X-API-Key': 'header-key',
    })
    expect(extractApiKey(req)).toBe('header-key')
  })

  it('returns null when no key is present', () => {
    const req = makeRequest('http://localhost/api/test')
    expect(extractApiKey(req)).toBeNull()
  })

  it('uses custom header name when configured', () => {
    const req = makeRequest('http://localhost/api/test', { Authorization: 'my-key' })
    expect(extractApiKey(req, { headerName: 'Authorization' })).toBe('my-key')
  })

  it('uses custom query param name when configured', () => {
    const req = makeRequest('http://localhost/api/test?token=t-123')
    expect(extractApiKey(req, { queryParamName: 'token' })).toBe('t-123')
  })
})

describe('validateApiKey', () => {
  it('allows access without key when not required (default)', () => {
    const req = makeRequest('http://localhost/api/test')
    const result = validateApiKey(req)
    expect(result.valid).toBe(true)
    expect(result.tier).toBe('free')
    expect(result.rateLimit).toBe(100)
  })

  it('rejects when key is required but not provided', () => {
    const req = makeRequest('http://localhost/api/test')
    const result = validateApiKey(req, { required: true })
    expect(result.valid).toBe(false)
  })

  it('validates against the valid keys map', () => {
    const validKeys = new Map([['valid-key', { tier: 'standard' as const, rateLimit: 500 }]])
    const req = makeRequest('http://localhost/api/test', { 'X-API-Key': 'valid-key' })
    const result = validateApiKey(req, { validKeys })
    expect(result.valid).toBe(true)
    expect(result.key).toBe('valid-key')
    expect(result.tier).toBe('standard')
    expect(result.rateLimit).toBe(500)
  })

  it('rejects an invalid key', () => {
    const validKeys = new Map([['valid-key', { tier: 'free' as const, rateLimit: 100 }]])
    const req = makeRequest('http://localhost/api/test', { 'X-API-Key': 'wrong-key' })
    const result = validateApiKey(req, { validKeys })
    expect(result.valid).toBe(false)
    expect(result.key).toBe('wrong-key')
  })

  it('validates against API_MASTER_KEY env variable', () => {
    const originalKey = process.env.API_MASTER_KEY
    try {
      process.env.API_MASTER_KEY = 'master-secret'
      const req = makeRequest('http://localhost/api/test', { 'X-API-Key': 'master-secret' })
      const result = validateApiKey(req)
      expect(result.valid).toBe(true)
      expect(result.tier).toBe('premium')
      expect(result.rateLimit).toBe(10000)
    } finally {
      if (originalKey !== undefined) {
        process.env.API_MASTER_KEY = originalKey
      } else {
        delete process.env.API_MASTER_KEY
      }
    }
  })
})

describe('isApiKeyAuthEnabled', () => {
  let originalValue: string | undefined

  beforeEach(() => {
    originalValue = process.env.API_KEY_AUTH_ENABLED
  })

  afterEach(() => {
    if (originalValue !== undefined) {
      process.env.API_KEY_AUTH_ENABLED = originalValue
    } else {
      delete process.env.API_KEY_AUTH_ENABLED
    }
  })

  it('returns true when env is set to "true"', () => {
    process.env.API_KEY_AUTH_ENABLED = 'true'
    expect(isApiKeyAuthEnabled()).toBe(true)
  })

  it('returns false when env is not set', () => {
    delete process.env.API_KEY_AUTH_ENABLED
    expect(isApiKeyAuthEnabled()).toBe(false)
  })

  it('returns false for any value other than "true"', () => {
    process.env.API_KEY_AUTH_ENABLED = 'false'
    expect(isApiKeyAuthEnabled()).toBe(false)
    process.env.API_KEY_AUTH_ENABLED = '1'
    expect(isApiKeyAuthEnabled()).toBe(false)
  })
})

describe('requireApiKey', () => {
  let originalEnabled: string | undefined
  let originalMaster: string | undefined

  beforeEach(() => {
    originalEnabled = process.env.API_KEY_AUTH_ENABLED
    originalMaster = process.env.API_MASTER_KEY
  })

  afterEach(() => {
    if (originalEnabled !== undefined) {
      process.env.API_KEY_AUTH_ENABLED = originalEnabled
    } else {
      delete process.env.API_KEY_AUTH_ENABLED
    }
    if (originalMaster !== undefined) {
      process.env.API_MASTER_KEY = originalMaster
    } else {
      delete process.env.API_MASTER_KEY
    }
  })

  it('allows access when auth is disabled', () => {
    delete process.env.API_KEY_AUTH_ENABLED
    const req = makeRequest('http://localhost/api/test')
    const result = requireApiKey(req)
    expect(result.valid).toBe(true)
    expect(result.tier).toBe('free')
    expect(result.rateLimit).toBe(TIER_RATE_LIMITS.free)
  })

  it('rejects when auth is enabled and no key provided', () => {
    process.env.API_KEY_AUTH_ENABLED = 'true'
    const req = makeRequest('http://localhost/api/test')
    const result = requireApiKey(req)
    expect(result.valid).toBe(false)
  })

  it('allows access with valid master key when auth is enabled', () => {
    process.env.API_KEY_AUTH_ENABLED = 'true'
    process.env.API_MASTER_KEY = 'master-key'
    const req = makeRequest('http://localhost/api/test', { 'X-API-Key': 'master-key' })
    const result = requireApiKey(req)
    expect(result.valid).toBe(true)
    expect(result.tier).toBe('premium')
  })
})

describe('optionalApiKey', () => {
  it('allows access without key', () => {
    const req = makeRequest('http://localhost/api/test')
    const result = optionalApiKey(req)
    expect(result.valid).toBe(true)
    expect(result.tier).toBe('free')
  })

  it('enhances access when a valid key is provided', () => {
    const originalMaster = process.env.API_MASTER_KEY
    try {
      process.env.API_MASTER_KEY = 'premium-key'
      const req = makeRequest('http://localhost/api/test', { 'X-API-Key': 'premium-key' })
      const result = optionalApiKey(req)
      expect(result.valid).toBe(true)
      expect(result.tier).toBe('premium')
    } finally {
      if (originalMaster !== undefined) {
        process.env.API_MASTER_KEY = originalMaster
      } else {
        delete process.env.API_MASTER_KEY
      }
    }
  })
})

describe('TIER_RATE_LIMITS', () => {
  it('has expected tier values', () => {
    expect(TIER_RATE_LIMITS.free).toBe(100)
    expect(TIER_RATE_LIMITS.standard).toBe(500)
    expect(TIER_RATE_LIMITS.premium).toBe(2000)
  })
})
