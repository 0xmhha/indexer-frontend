/**
 * API Relay Caching Layer
 *
 * In-memory cache implementation with TTL support.
 * Can be extended to Redis by implementing the CacheStore interface.
 *
 * @example
 * ```typescript
 * // Using the cache
 * const cached = await apiCache.get<MyData>('my-key')
 * if (cached) return cached
 *
 * const data = await fetchData()
 * await apiCache.set('my-key', data, 60) // 60 seconds TTL
 * ```
 */

/**
 * Cache entry with expiration
 */
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

/**
 * Cache store interface for different backends
 */
export interface CacheStore {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}

/**
 * In-memory cache implementation
 * Suitable for single-instance deployments or development
 */
class MemoryCache implements CacheStore {
  private cache = new Map<string, CacheEntry<unknown>>()
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    // Start cleanup interval (every 60 seconds)
    if (typeof window === 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, 60000)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000

    this.cache.set(key, {
      data: value,
      expiresAt,
    })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  /**
   * Stop cleanup interval (for testing/shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

/**
 * Default TTL values for different data types (in seconds)
 */
export const CacheTTL = {
  /** Network stats - changes every block */
  STATS: 15,
  /** Token balances - moderate update frequency */
  BALANCES: 30,
  /** Transaction history - changes with new blocks */
  TRANSACTIONS: 60,
  /** Contract info - rarely changes */
  CONTRACT: 300,
  /** Token info - rarely changes */
  TOKEN: 300,
  /** Validators - changes slowly */
  VALIDATORS: 120,
} as const

/**
 * Generate cache key for API requests
 */
export function generateCacheKey(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const base = `api:${endpoint}`

  if (!params || Object.keys(params).length === 0) {
    return base
  }

  // Sort params for consistent key generation
  const sortedParams = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')

  return `${base}?${sortedParams}`
}

/**
 * Cache wrapper with automatic key generation
 */
export class ApiCache {
  constructor(private store: CacheStore = new MemoryCache()) {}

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    return this.store.get<T>(key)
  }

  /**
   * Set cached value with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    return this.store.set(key, value, ttlSeconds)
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    return this.store.delete(key)
  }

  /**
   * Clear all cached values
   */
  async clear(): Promise<void> {
    return this.store.clear()
  }

  /**
   * Get or fetch pattern
   * Returns cached value if available, otherwise fetches and caches
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    await this.set(key, data, ttlSeconds)
    return data
  }

  /**
   * Invalidate cache entries matching a pattern
   * Note: This is a simple implementation for memory cache
   * Redis would use SCAN with pattern matching
   */
  async invalidatePattern(pattern: string): Promise<void> {
    // For memory cache, we need to check each key
    // Use runtime type check instead of unsafe type assertion
    if (this.store instanceof MemoryCache) {
      const { keys } = this.store.getStats()
      const regex = new RegExp(pattern.replace('*', '.*'))
      for (const key of keys) {
        if (regex.test(key)) {
          await this.delete(key)
        }
      }
    }
  }
}

// Singleton cache instance
export const apiCache = new ApiCache()
