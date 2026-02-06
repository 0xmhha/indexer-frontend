/**
 * Pagination & Limits Constants
 */

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

export type PaginationLimit = (typeof PAGINATION)[keyof typeof PAGINATION]
