/**
 * Application-wide constants and configuration
 *
 * This file centralizes all constant values used throughout the application
 * to eliminate magic numbers and maintain consistency.
 */

// ============================================================================
// Pagination & Limits
// ============================================================================

export const PAGINATION = {
  /** Default items per page (blocks, transactions, system contracts, etc.) */
  DEFAULT_PAGE_SIZE: 20,

  /** Default limit for search results */
  SEARCH_LIMIT: 10,

  /** Limit for autocomplete results */
  AUTOCOMPLETE_LIMIT: 5,

  /** Default limit for address transactions */
  ADDRESS_TX_LIMIT: 10,

  /** Default limit for statistics/analytics */
  STATS_LIMIT: 10,

  /** Block limit for bulk analytics */
  ANALYTICS_BLOCK_LIMIT: 1000,

  /** Default limit for balance history */
  BALANCE_HISTORY_LIMIT: 100,
} as const

// ============================================================================
// Real-time Updates (WebSocket & Polling)
// ============================================================================

export const REALTIME = {
  /** Maximum pending transactions to keep in memory */
  MAX_PENDING_TRANSACTIONS: 50,

  /** Maximum blocks to keep in memory */
  MAX_BLOCKS: 20,

  /** Maximum transactions to keep in memory */
  MAX_TRANSACTIONS: 50,

  /** Maximum logs to keep in memory */
  MAX_LOGS: 100,

  /** WebSocket keepAlive interval (ms) */
  WS_KEEPALIVE_INTERVAL: 10_000,

  /** WebSocket retry attempts */
  WS_RETRY_ATTEMPTS: 3,

  /** WebSocket maximum retry wait time (ms) */
  WS_RETRY_MAX_WAIT: 4_000,
} as const

// ============================================================================
// Polling Intervals (ms)
// ============================================================================

/**
 * Polling interval settings
 *
 * Choose appropriate interval based on page's real-time requirements:
 * - VERY_FAST: For block/transaction lists requiring very fast updates
 * - FAST: For address details, balances requiring quick updates
 * - NORMAL: For statistics, governance with typical update cycles
 * - SLOW: For system info, WBFT where slow updates suffice
 * - DISABLED: For WebSocket-only or manual refresh only
 */
export const POLLING_INTERVALS = {
  /** Very fast polling - block list, transaction list (5 seconds) */
  VERY_FAST: 5_000,

  /** Fast polling - address details, balances (10 seconds) */
  FAST: 10_000,

  /** Normal polling - statistics, governance (30 seconds) */
  NORMAL: 30_000,

  /** Slow polling - system info, WBFT (60 seconds) */
  SLOW: 60_000,

  /** Disabled (WebSocket only or polling disabled) */
  DISABLED: 0,
} as const

// ============================================================================
// Debounce & Throttle
// ============================================================================

export const TIMING = {
  /** Search input debounce (ms) */
  SEARCH_DEBOUNCE: 300,

  /** Filter change debounce (ms) */
  FILTER_DEBOUNCE: 500,

  /** Scroll throttle (ms) */
  SCROLL_THROTTLE: 100,

  /** Mock API delay (ms) - for simulating API calls */
  MOCK_API_DELAY: 500,
} as const

// ============================================================================
// Cache Policies
// ============================================================================

/**
 * Apollo Client cache policies
 *
 * - REALTIME: Always fetch latest data from network (real-time data)
 * - DYNAMIC: Use cache and network simultaneously (frequently changing data)
 * - STATIC: Cache first (static data, rarely changes)
 * - NO_CACHE: No caching (subscription data, one-time data)
 */
export const CACHE_POLICIES = {
  /** Real-time data - always fetch latest from network */
  REALTIME: 'network-only' as const,

  /** Frequently changing data - use cache and network simultaneously */
  DYNAMIC: 'cache-and-network' as const,

  /** Static data - cache first */
  STATIC: 'cache-first' as const,

  /** No cache - subscription data */
  NO_CACHE: 'no-cache' as const,
} as const

// ============================================================================
// Feature Flags
// ============================================================================

/**
 * Feature flags
 *
 * Used to control environment-specific behavior or experimental features.
 */
export const FEATURES = {
  /** Enable WebSocket real-time updates */
  ENABLE_WEBSOCKET: true,

  /** Enable polling (for WebSocket unsupported environments) */
  ENABLE_POLLING: true,

  /** Enable auto-refresh */
  ENABLE_AUTO_REFRESH: true,

  /** Enable development mode logging */
  ENABLE_DEV_LOGGING: process.env.NODE_ENV === 'development',
} as const

// ============================================================================
// Display & UI
// ============================================================================

export const UI = {
  /** Number of recent blocks to display on homepage */
  HOME_RECENT_BLOCKS: 10,

  /** Number of pending transactions to display on homepage */
  HOME_PENDING_TXS: 20,

  /** Default number of rows to display in tables */
  TABLE_DEFAULT_ROWS: 20,

  /** Number of rows to display in mobile tables */
  TABLE_MOBILE_ROWS: 10,

  /** Maximum visible page numbers in pagination (simple) */
  PAGINATION_MAX_VISIBLE_SIMPLE: 5,

  /** Maximum visible page numbers in pagination (full) */
  PAGINATION_MAX_VISIBLE_FULL: 7,

  /** Default max items for viewers/dashboards */
  MAX_VIEWER_ITEMS: 50,
} as const

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Type extraction utilities
 *
 * Allows using constant values as types.
 */
export type CachePolicy = (typeof CACHE_POLICIES)[keyof typeof CACHE_POLICIES]
export type PollingInterval = (typeof POLLING_INTERVALS)[keyof typeof POLLING_INTERVALS]
export type PaginationLimit = (typeof PAGINATION)[keyof typeof PAGINATION]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if polling is enabled
 */
export function isPollingEnabled(interval: number): boolean {
  return FEATURES.ENABLE_POLLING && interval > 0
}

/**
 * Log only in development mode
 */
export function devLog(message: string, ...args: unknown[]): void {
  if (FEATURES.ENABLE_DEV_LOGGING) {
    console.log(`[DEV] ${message}`, ...args)
  }
}
