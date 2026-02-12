/**
 * UI, Features & Error Constants
 */

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

  /** Default collapsed list items count */
  DEFAULT_COLLAPSED_ITEMS: 10,

  /** Default page size options for pagination */
  DEFAULT_PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
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
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  NETWORK_ERROR: 0,
} as const
