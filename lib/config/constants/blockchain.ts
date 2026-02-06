/**
 * Blockchain, Gas, ABI & Formatting Constants
 */

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
