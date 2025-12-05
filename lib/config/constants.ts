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

  /** WebSocket close code: Normal closure */
  WS_CLOSE_NORMAL: 1000,

  /** WebSocket close code: Going away (page closing, server shutdown) */
  WS_CLOSE_GOING_AWAY: 1001,
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
// Consensus Monitoring
// ============================================================================

/**
 * Consensus monitoring thresholds and limits
 */
export const CONSENSUS = {
  /** Maximum recent blocks to keep in memory */
  MAX_RECENT_BLOCKS: 50,

  /** Maximum recent errors to keep in memory */
  MAX_RECENT_ERRORS: 100,

  /** Maximum recent forks to keep in memory */
  MAX_RECENT_FORKS: 20,

  /** Maximum recent validator changes to keep in memory */
  MAX_RECENT_VALIDATOR_CHANGES: 50,

  /** Participation rate threshold for warning (%) */
  PARTICIPATION_WARNING_THRESHOLD: 75,

  /** Participation rate threshold for critical (%) - below 2/3 */
  PARTICIPATION_CRITICAL_THRESHOLD: 66.7,

  /** Network health score thresholds */
  HEALTH_EXCELLENT_THRESHOLD: 90,
  HEALTH_GOOD_THRESHOLD: 75,
  HEALTH_FAIR_THRESHOLD: 60,

  /** Error auto-dismiss timeout (ms) for low severity errors */
  ERROR_AUTO_DISMISS_LOW: 5000,

  /** Error auto-dismiss timeout (ms) for medium severity errors */
  ERROR_AUTO_DISMISS_MEDIUM: 10000,

  /** High priority errors do not auto-dismiss */
  ERROR_AUTO_DISMISS_HIGH: 0,

  /** Health score calculation constants */
  HEALTH_SCORE_INITIAL: 100,
  MAX_PARTICIPATION_PENALTY: 40,
  PARTICIPATION_PENALTY_MULTIPLIER: 0.8,
  MAX_ROUND_CHANGE_PENALTY: 20,
  ROUND_CHANGE_MULTIPLIER: 100,
  MAX_ERROR_PENALTY: 40,

  /** Error severity penalty weights */
  ERROR_PENALTY_CRITICAL: 15,
  ERROR_PENALTY_HIGH: 8,
  ERROR_PENALTY_MEDIUM: 3,
  ERROR_PENALTY_LOW: 1,

  /** Default values */
  DEFAULT_PARTICIPATION_RATE: 100,
  MINIMUM_HEALTHY_SCORE: 60,
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

  /** Enable consensus real-time monitoring */
  ENABLE_CONSENSUS_MONITORING: true,

  /** Enable browser notifications for critical errors */
  ENABLE_BROWSER_NOTIFICATIONS: true,
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

  /** Icon sizes */
  ICON_SIZE_XS: 12,
  ICON_SIZE_SM: 14,
  ICON_SIZE_MD: 16,
  ICON_SIZE_LG: 20,
  ICON_SIZE_XL: 24,

  /** Tooltip offset positions */
  TOOLTIP_OFFSET_X: 6,
  TOOLTIP_OFFSET_Y: -4,
  TOOLTIP_OFFSET_Y_BOTTOM: -8,

  /** Maximum visible page numbers in pagination (simple) */
  PAGINATION_MAX_VISIBLE_SIMPLE: 5,

  /** Maximum visible page numbers in pagination (full) */
  PAGINATION_MAX_VISIBLE_FULL: 7,

  /** Default max items for viewers/dashboards */
  MAX_VIEWER_ITEMS: 50,

  /** Maximum alerts to display at once */
  MAX_VISIBLE_ALERTS: 3,

  /** Maximum validators to display in preview */
  MAX_PREVIEW_VALIDATORS: 5,

  /** Maximum items to display in list preview */
  MAX_LIST_PREVIEW: 5,

  /** Number of validators to show in epoch preview */
  EPOCH_PREVIEW_VALIDATORS: 8,

  /** Recent transactions to show in realtime chart */
  REALTIME_CHART_TX_COUNT: 20,

  /** Recent blocks for sparkline chart */
  SPARKLINE_BLOCKS: 20,

  /** Chart Y-axis domain padding */
  CHART_Y_AXIS_PADDING: 5,

  /** Default governance proposals to fetch */
  GOVERNANCE_PROPOSALS_LIMIT: 10,

  /** Recent blocks to display in chart */
  CHART_RECENT_BLOCKS: 20,

  /** Maximum chart data points */
  MAX_CHART_DATA_POINTS: 60,

  /** Truncation length for addresses/hashes */
  TRUNCATE_LENGTH: 8,

  /** Clipboard copy timeout (ms) */
  COPY_TIMEOUT: 2000,

  /** Mobile breakpoint for responsive design (px) */
  MOBILE_BREAKPOINT: 768,

  /** Default page size options for pagination */
  DEFAULT_PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
} as const

// ============================================================================
// Thresholds & Percentages
// ============================================================================

export const THRESHOLDS = {
  /** Excellent participation rate (%) */
  PARTICIPATION_EXCELLENT: 95,

  /** Good participation rate (%) */
  PARTICIPATION_GOOD: 80,

  /** Minimum participation rate (2/3 consensus) */
  PARTICIPATION_MINIMUM: 67,

  /** Excellent health score */
  HEALTH_EXCELLENT: 90,

  /** Good health score */
  HEALTH_GOOD: 75,

  /** Fair health score */
  HEALTH_FAIR: 60,

  /** Chart opacity for secondary elements */
  CHART_OPACITY: 0.6,

  /** Gas efficiency thresholds */
  GAS_EFFICIENCY_EXCELLENT: 95,
  GAS_EFFICIENCY_GOOD: 85,
  GAS_EFFICIENCY_FAIR: 75,

  /** Transaction success thresholds */
  TX_SUCCESS_EXCELLENT: 90,
  TX_SUCCESS_GOOD: 75,
  TX_SUCCESS_FAIR: 60,

  /** Proposal quorum percentage */
  PROPOSAL_QUORUM: 66,

  /** Adoption milestones */
  ADOPTION_EARLY: 5,
  ADOPTION_GROWING: 15,
  ADOPTION_MAINSTREAM: 30,

  /** Signing rate thresholds for validators */
  SIGNING_EXCELLENT: 95,
  SIGNING_GOOD: 80,
  SIGNING_FAIR: 60,
} as const

// ============================================================================
// Blockchain Constants
// ============================================================================

export const BLOCKCHAIN = {
  /** Wei to Ether conversion factor */
  WEI_PER_ETHER: 1e18,

  /** Zero BigInt */
  ZERO_BIGINT: 0n,

  /** 100 BigInt (for percentage calculations) */
  HUNDRED_BIGINT: 100n,

  /** Percentage multiplier */
  PERCENTAGE_MULTIPLIER: 100,

  /** Percentage quarters for progress indicators */
  PERCENTAGE_QUARTER: 25,
  PERCENTAGE_HALF: 50,
  PERCENTAGE_THREE_QUARTERS: 75,
  PERCENTAGE_FULL: 100,

  /** System contract type identifier */
  SYSTEM_CONTRACT_TYPE: 0x16,

  /** Seconds per minute */
  SECONDS_PER_MINUTE: 60,

  /** Minutes per hour */
  MINUTES_PER_HOUR: 60,

  /** Hours per day */
  HOURS_PER_DAY: 24,
} as const

// ============================================================================
// System Contracts
// ============================================================================

/**
 * System contract addresses as named constants
 */
export const SYSTEM_CONTRACT_ADDRESSES = {
  NativeCoinAdapter: '0x0000000000000000000000000000000000001000',
  GovValidator: '0x0000000000000000000000000000000000001001',
  GovMasterMinter: '0x0000000000000000000000000000000000001002',
  GovMinter: '0x0000000000000000000000000000000000001003',
  GovCouncil: '0x0000000000000000000000000000000000001004',
} as const

/**
 * Known system contract addresses and their metadata
 *
 * These are pre-deployed contracts that are part of the blockchain network.
 * Used for displaying fallback names when token metadata is not available.
 */
export const SYSTEM_CONTRACTS: Record<
  string,
  {
    name: string
    symbol: string
    decimals: number
    description: string
    isNativeWrapper?: boolean
  }
> = {
  // Native Coin Adapter (STABLEONE wrapper)
  '0x0000000000000000000000000000000000001000': {
    name: 'STABLEONE',
    symbol: 'STONE',
    decimals: 18,
    description: 'Native coin ERC20 wrapper',
    isNativeWrapper: true,
  },
  // Add more system contracts as needed
  '0x0000000000000000000000000000000000001001': {
    name: 'Staking Manager',
    symbol: 'STKM',
    decimals: 18,
    description: 'Validator staking management contract',
  },
  '0x0000000000000000000000000000000000001002': {
    name: 'Account Manager',
    symbol: 'ACTM',
    decimals: 0,
    description: 'Account blacklist and management',
  },
  '0x0000000000000000000000000000000000001003': {
    name: 'Governance',
    symbol: 'GOV',
    decimals: 0,
    description: 'Network governance proposals',
  },
} as const

/**
 * Get system contract metadata by address
 */
export function getSystemContractInfo(address: string): {
  name: string
  symbol: string
  decimals: number
  description: string
  isNativeWrapper?: boolean
} | null {
  const normalizedAddress = address.toLowerCase()
  for (const [contractAddress, info] of Object.entries(SYSTEM_CONTRACTS)) {
    if (contractAddress.toLowerCase() === normalizedAddress) {
      return info
    }
  }
  return null
}

/**
 * Check if an address is a known system contract
 */
export function isSystemContract(address: string): boolean {
  return getSystemContractInfo(address) !== null
}

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
// Error Logging Constants
// ============================================================================

export const ERROR_LOGGING = {
  /** Maximum errors to keep in memory */
  MAX_IN_MEMORY_LOGS: 100,

  /** Maximum errors to store in localStorage */
  MAX_STORED_ERRORS: 50,

  /** Maximum errors per batch */
  MAX_BATCH_SIZE: 10,

  /** Default recent logs count */
  DEFAULT_RECENT_COUNT: 10,
} as const

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  TOO_MANY_REQUESTS: 429,
  SERVICE_UNAVAILABLE: 503,
  NETWORK_ERROR: 0,
} as const

// ============================================================================
// Gas & Transaction Simulation
// ============================================================================

export const GAS = {
  /** Minimum gas price (gwei) */
  MIN_GAS_PRICE: 25,

  /** Maximum gas price (gwei) */
  MAX_GAS_PRICE: 35,

  /** Gas multiplier for estimation */
  GAS_MULTIPLIER: 1.2,

  /** Low priority gas percentage */
  LOW_PRIORITY_PERCENT: 60,

  /** Medium priority gas percentage */
  MEDIUM_PRIORITY_PERCENT: 75,

  /** High priority gas percentage */
  HIGH_PRIORITY_PERCENT: 90,

  /** Urgent priority gas percentage */
  URGENT_PRIORITY_PERCENT: 98,

  /** Gas buffer percentage */
  GAS_BUFFER_PERCENT: 5,

  /** Gas estimation variance range */
  ESTIMATION_VARIANCE_MIN: 20,
  ESTIMATION_VARIANCE_MAX: 50,

  /** Gas limits by transaction type */
  GAS_LIMIT_TRANSFER: 21000,
  GAS_LIMIT_CONTRACT: 100000,
  GAS_LIMIT_TOKEN: 65000,
  GAS_LIMIT_NFT: 150000,

  /** Network condition base fees (gwei) */
  BASE_FEE_LOW: 15,
  BASE_FEE_MEDIUM: 25,
  BASE_FEE_HIGH: 50,
  BASE_FEE_EXTREME: 100,

  /** Default priority fee (gwei) */
  DEFAULT_PRIORITY_FEE: 2,

  /** Default legacy gas price (gwei) */
  DEFAULT_LEGACY_GAS_PRICE: 30,

  /** Fee buffer values (gwei) */
  FEE_BUFFER_OPTIMAL: 5,
  FEE_BUFFER_CONSERVATIVE: 15,

  /** Cost comparison warning threshold (e.g., 1.2 = 20% more expensive) */
  COST_WARNING_THRESHOLD: 1.2,

  /** Priority fee thresholds (gwei) */
  PRIORITY_FEE_LOW_THRESHOLD: 1,
  PRIORITY_FEE_STANDARD_THRESHOLD: 2,
  PRIORITY_FEE_HIGH_THRESHOLD: 5,

  /** Success probability percentages */
  SUCCESS_PROB_LOW_PRIORITY: 60,
  SUCCESS_PROB_STANDARD_PRIORITY: 75,
  SUCCESS_PROB_HIGH_PRIORITY: 90,
  SUCCESS_PROB_VERY_HIGH_PRIORITY: 98,

  /** Probability adjustment values */
  PROB_ADJUSTMENT_EXTREME: 20,
  PROB_ADJUSTMENT_HIGH: 10,
  PROB_MIN_EXTREME: 50,
  PROB_MIN_HIGH: 60,

  /** Fee offset for max fee calculation */
  MAX_FEE_OFFSET: 10,
} as const

// ============================================================================
// Formatting Constants
// ============================================================================

export const FORMATTING = {
  /** Address display - characters to show at start */
  ADDRESS_START_CHARS: 6,
  /** Address display - characters to show at end */
  ADDRESS_END_CHARS: 4,

  /** Hash display - characters to show at start */
  HASH_START_CHARS: 10,
  /** Hash display - characters to show at end */
  HASH_END_CHARS: 8,

  /** BLS key display - characters to show at start */
  BLS_KEY_START_CHARS: 20,
  /** BLS key display - characters to show at end */
  BLS_KEY_END_CHARS: 8,
  /** BLS key truncate preview length */
  BLS_KEY_PREVIEW_LENGTH: 32,

  /** Ethereum address length with 0x prefix */
  ETH_ADDRESS_LENGTH: 42,

  /** Hex conversion radix */
  HEX_RADIX: 16,

  /** Base36 radix for random ID generation */
  BASE36_RADIX: 36,

  /** Random ID substring length */
  RANDOM_ID_LENGTH: 9,

  /** Default token decimals (ETH/WEMIX) */
  DEFAULT_DECIMALS: 18,
  /** Gwei decimals */
  GWEI_DECIMALS: 9,

  /** Wei per Gwei (1e9) */
  WEI_PER_GWEI: 1e9,

  /** Decimal places for different display contexts */
  DECIMAL_PLACES_STANDARD: 4,
  DECIMAL_PLACES_PRECISE: 8,
  DECIMAL_PLACES_PERCENTAGE: 2,

  /** Default max length for hex truncation */
  HEX_MAX_LENGTH: 20,

  /** Hex preview length for call data (includes 0x prefix) */
  HEX_PREVIEW_LENGTH: 66,

  /** Topic address offset - EVM topics are 32 bytes, address is last 20 bytes */
  TOPIC_ADDRESS_OFFSET: 26,

  /** Bytes conversion factor */
  BYTES_PER_KB: 1024,

  /** Large number thresholds for K/M/B formatting */
  BILLION: 1_000_000_000,
  MILLION: 1_000_000,
  THOUSAND: 1_000,

  /** Time constants for formatTimeAgo */
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_HOUR: 3600,
  SECONDS_PER_DAY: 86400,
  SECONDS_PER_WEEK: 604800,
  SECONDS_PER_MONTH: 2592000,

  /** Milliseconds conversions */
  MS_PER_SECOND: 1000,

  /** Average block time (seconds) */
  AVG_BLOCK_TIME: 12,

  /** Days per time period */
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 30,
} as const

// ============================================================================
// ABI Encoding/Decoding Constants
// ============================================================================

export const ABI = {
  /** EVM word size in hex characters (32 bytes = 64 hex chars) */
  WORD_SIZE: 64,

  /** Half word size for certain operations */
  HALF_WORD_SIZE: 32,

  /** Address padding offset (last 40 chars of 64-char word) */
  ADDRESS_OFFSET: -40,

  /** Function selector length (4 bytes = 8 hex chars) */
  SELECTOR_LENGTH: 4,

  /** ERC721 event topics count (signature + 3 indexed params) */
  ERC721_TOPICS_COUNT: 4,

  /** ERC20 event topics count (signature + 2 indexed params) */
  ERC20_TOPICS_COUNT: 3,

  /** Bytes offset for dynamic data */
  BYTES_OFFSET: 2,

  /** Uint8 max value */
  UINT8_MAX: 255,

  /** Uint256 size */
  UINT256_SIZE: 256,

  /** Substring offset for byte extraction */
  BYTE_EXTRACT_OFFSET: -2,

  /** Default decimals display length */
  DECIMALS_DISPLAY_LENGTH: 12,

  /** Signed integer bounds offset */
  SIGNED_BOUNDS_OFFSET: 6,

  /** Negative signed offset */
  SIGNED_NEGATIVE_OFFSET: -4,

  /** Max numeric character length for boolean detection */
  BOOL_NUMERIC_MAX_LENGTH: 15,
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
