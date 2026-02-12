import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ApiCache, generateCacheKey, CacheTTL } from './cache'

// ---------------------------------------------------------------------------
// generateCacheKey
// ---------------------------------------------------------------------------

describe('generateCacheKey', () => {
  it('should generate a key from a simple endpoint', () => {
    expect(generateCacheKey('blocks')).toBe('api:blocks')
  })

  it('should generate a key with sorted params appended', () => {
    const key = generateCacheKey('transactions', {
      page: 1,
      limit: 20,
      address: '0xabc',
    })
    // Params are sorted alphabetically: address, limit, page
    expect(key).toBe('api:transactions?address=0xabc&limit=20&page=1')
  })

  it('should filter out undefined params', () => {
    const key = generateCacheKey('blocks', {
      page: 1,
      cursor: undefined,
    })
    expect(key).toBe('api:blocks?page=1')
  })

  it('should treat empty params object the same as no params', () => {
    expect(generateCacheKey('blocks', {})).toBe('api:blocks')
  })

  it('should handle boolean params', () => {
    const key = generateCacheKey('search', { active: true, pending: false })
    expect(key).toBe('api:search?active=true&pending=false')
  })

  it('should produce consistent keys regardless of param insertion order', () => {
    const key1 = generateCacheKey('tx', { z: 'last', a: 'first' })
    const key2 = generateCacheKey('tx', { a: 'first', z: 'last' })
    expect(key1).toBe(key2)
  })
})

// ---------------------------------------------------------------------------
// CacheTTL constants
// ---------------------------------------------------------------------------

describe('CacheTTL', () => {
  it('should expose expected TTL values', () => {
    expect(CacheTTL.STATS).toBe(15)
    expect(CacheTTL.BALANCES).toBe(30)
    expect(CacheTTL.TRANSACTIONS).toBe(60)
    expect(CacheTTL.CONTRACT).toBe(300)
    expect(CacheTTL.TOKEN).toBe(300)
    expect(CacheTTL.VALIDATORS).toBe(120)
  })
})

// ---------------------------------------------------------------------------
// ApiCache
// ---------------------------------------------------------------------------

describe('ApiCache', () => {
  let cache: ApiCache

  beforeEach(() => {
    vi.useFakeTimers()
    cache = new ApiCache()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // -----------------------------------------------------------------------
  // get / set
  // -----------------------------------------------------------------------

  describe('get / set', () => {
    it('should store and retrieve a value', async () => {
      await cache.set('key1', { name: 'test' }, 60)
      const result = await cache.get<{ name: string }>('key1')
      expect(result).toEqual({ name: 'test' })
    })

    it('should return null for a non-existent key', async () => {
      const result = await cache.get('nonexistent')
      expect(result).toBeNull()
    })

    it('should store and retrieve primitive values', async () => {
      await cache.set('num', 42, 60)
      await cache.set('str', 'hello', 60)
      await cache.set('bool', true, 60)

      expect(await cache.get<number>('num')).toBe(42)
      expect(await cache.get<string>('str')).toBe('hello')
      expect(await cache.get<boolean>('bool')).toBe(true)
    })

    it('should overwrite existing values on set', async () => {
      await cache.set('key', 'first', 60)
      await cache.set('key', 'second', 60)
      expect(await cache.get<string>('key')).toBe('second')
    })
  })

  // -----------------------------------------------------------------------
  // TTL expiration
  // -----------------------------------------------------------------------

  describe('TTL expiration', () => {
    it('should return null after TTL has expired', async () => {
      await cache.set('expiring', 'data', 10) // 10 seconds TTL

      // Advance time just before expiration
      vi.advanceTimersByTime(9_999)
      expect(await cache.get('expiring')).toBe('data')

      // Advance past expiration
      vi.advanceTimersByTime(2)
      expect(await cache.get('expiring')).toBeNull()
    })

    it('should expire entries independently based on their own TTL', async () => {
      await cache.set('short', 'fast', 5)
      await cache.set('long', 'slow', 30)

      vi.advanceTimersByTime(6_000) // 6 seconds

      expect(await cache.get('short')).toBeNull()
      expect(await cache.get('long')).toBe('slow')
    })
  })

  // -----------------------------------------------------------------------
  // delete
  // -----------------------------------------------------------------------

  describe('delete', () => {
    it('should remove a cached entry', async () => {
      await cache.set('key', 'value', 60)
      await cache.delete('key')
      expect(await cache.get('key')).toBeNull()
    })

    it('should not throw when deleting a non-existent key', async () => {
      await expect(cache.delete('nonexistent')).resolves.toBeUndefined()
    })
  })

  // -----------------------------------------------------------------------
  // clear
  // -----------------------------------------------------------------------

  describe('clear', () => {
    it('should remove all cached entries', async () => {
      await cache.set('a', 1, 60)
      await cache.set('b', 2, 60)
      await cache.set('c', 3, 60)

      await cache.clear()

      expect(await cache.get('a')).toBeNull()
      expect(await cache.get('b')).toBeNull()
      expect(await cache.get('c')).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // getOrFetch
  // -----------------------------------------------------------------------

  describe('getOrFetch', () => {
    it('should return cached value without calling fetcher', async () => {
      await cache.set('key', 'cached', 60)

      const fetcher = vi.fn().mockResolvedValue('fresh')
      const result = await cache.getOrFetch('key', fetcher, 60)

      expect(result).toBe('cached')
      expect(fetcher).not.toHaveBeenCalled()
    })

    it('should call fetcher and cache result when key is not cached', async () => {
      const fetcher = vi.fn().mockResolvedValue('fetched')
      const result = await cache.getOrFetch('key', fetcher, 60)

      expect(result).toBe('fetched')
      expect(fetcher).toHaveBeenCalledOnce()

      // Verify the value was cached
      const cached = await cache.get('key')
      expect(cached).toBe('fetched')
    })

    it('should call fetcher when cached value has expired', async () => {
      await cache.set('key', 'old', 5)

      vi.advanceTimersByTime(6_000) // TTL expired

      const fetcher = vi.fn().mockResolvedValue('new')
      const result = await cache.getOrFetch('key', fetcher, 60)

      expect(result).toBe('new')
      expect(fetcher).toHaveBeenCalledOnce()
    })

    it('should cache the fetched result with the specified TTL', async () => {
      const fetcher = vi.fn().mockResolvedValue('data')
      await cache.getOrFetch('key', fetcher, 10)

      // Value should be available before TTL
      vi.advanceTimersByTime(9_000)
      expect(await cache.get('key')).toBe('data')

      // Value should be gone after TTL
      vi.advanceTimersByTime(2_000)
      expect(await cache.get('key')).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // invalidatePattern
  // -----------------------------------------------------------------------

  describe('invalidatePattern', () => {
    it('should remove keys matching the pattern', async () => {
      await cache.set('api:blocks:1', 'block1', 60)
      await cache.set('api:blocks:2', 'block2', 60)
      await cache.set('api:transactions:1', 'tx1', 60)

      await cache.invalidatePattern('api:blocks:*')

      expect(await cache.get('api:blocks:1')).toBeNull()
      expect(await cache.get('api:blocks:2')).toBeNull()
      expect(await cache.get('api:transactions:1')).toBe('tx1')
    })

    it('should not remove non-matching keys', async () => {
      await cache.set('api:users:1', 'user1', 60)
      await cache.set('api:users:2', 'user2', 60)

      await cache.invalidatePattern('api:blocks:*')

      expect(await cache.get('api:users:1')).toBe('user1')
      expect(await cache.get('api:users:2')).toBe('user2')
    })

    it('should handle patterns without wildcards', async () => {
      await cache.set('exact-key', 'value', 60)
      await cache.invalidatePattern('exact-key')

      expect(await cache.get('exact-key')).toBeNull()
    })

    it('should be a no-op when no keys match', async () => {
      await cache.set('key1', 'value', 60)
      await cache.invalidatePattern('nonexistent:*')

      expect(await cache.get('key1')).toBe('value')
    })
  })
})
