/**
 * Real-time Updates, Polling & Timing Constants
 */

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

  /** WebSocket close code: Normal closure */
  WS_CLOSE_NORMAL: 1000,

  /** WebSocket close code: Going away (page closing, server shutdown) */
  WS_CLOSE_GOING_AWAY: 1001,

  /** Pending transaction TTL - matches backend PendingPool TTL (ms) */
  PENDING_TX_TTL: 5 * 60 * 1000,

  /** Pending transaction cleanup interval (ms) */
  PENDING_TX_CLEANUP_INTERVAL: 10_000,
} as const

// ============================================================================
// Subscription Replay Settings
// ============================================================================

/**
 * Subscription replay settings for instant data on connection
 *
 * The replayLast parameter allows receiving recent events immediately
 * when subscribing, solving the "empty page" problem on initial load.
 *
 * @see Backend supports max 100 for replayLast
 */
export const REPLAY = {
  /** Default replay count for blocks (dashboard/homepage) */
  BLOCKS_DEFAULT: 10,

  /** Default replay count for transactions */
  TRANSACTIONS_DEFAULT: 10,

  /** Default replay count for logs */
  LOGS_DEFAULT: 20,

  /** Default replay count for consensus blocks */
  CONSENSUS_BLOCKS_DEFAULT: 10,

  /** Default replay count for consensus errors */
  CONSENSUS_ERRORS_DEFAULT: 5,

  /** Default replay count for consensus forks */
  CONSENSUS_FORKS_DEFAULT: 5,

  /** Default replay count for validator changes */
  VALIDATOR_CHANGES_DEFAULT: 10,

  /** Default replay count for chain config changes */
  CHAIN_CONFIG_DEFAULT: 5,

  /** Default replay count for validator set changes */
  VALIDATOR_SET_DEFAULT: 5,

  /** Default replay count for system contract events */
  SYSTEM_CONTRACT_EVENTS_DEFAULT: 15,

  /** Default replay count for dynamic contract events */
  DYNAMIC_CONTRACT_EVENTS_DEFAULT: 15,

  /** Maximum replay count (backend limit) */
  MAX_REPLAY: 100,

  /** No replay (for pending transactions which don't support it) */
  DISABLED: 0,
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

  /** Wallet connection check delay (ms) - allows MetaMask to initialize */
  WALLET_CONNECTION_DELAY: 500,

  /** Export loading state display delay (ms) */
  EXPORT_LOADING_DELAY: 100,
} as const

// ============================================================================
// Timeouts & Intervals
// ============================================================================

export const TIMEOUTS = {
  /** Toast notification duration (ms) */
  TOAST_DURATION: 5000,

  /** Simulation delay (ms) */
  SIMULATION_DELAY: 7000,

  /** Default request timeout (ms) */
  REQUEST_TIMEOUT: 10000,

  /** Long request timeout (ms) */
  REQUEST_TIMEOUT_LONG: 30000,

  /** Toast durations */
  TOAST_WARNING_DURATION: 7000,
  TOAST_ERROR_DURATION: 10000,

  /** Error batch delay (ms) */
  ERROR_BATCH_DELAY: 5000,

  /** WebSocket reconnect delay (ms) */
  WS_RECONNECT_DELAY: 5000,

  /** Import success notification duration (ms) */
  IMPORT_SUCCESS_DURATION: 3000,

  /** Import error notification duration (ms) */
  IMPORT_ERROR_DURATION: 5000,
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

export type CachePolicy = (typeof CACHE_POLICIES)[keyof typeof CACHE_POLICIES]
export type PollingInterval = (typeof POLLING_INTERVALS)[keyof typeof POLLING_INTERVALS]
