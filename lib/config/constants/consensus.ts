/**
 * Consensus Monitoring & Thresholds Constants
 */

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

  /** Maximum recent blocks to persist to localStorage */
  MAX_PERSISTED_RECENT_BLOCKS: 10,
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

  /** Proposal rate heatmap thresholds */
  PROPOSAL_RATE_EXCELLENT: 20,
  PROPOSAL_RATE_GOOD: 10,
  PROPOSAL_RATE_FAIR: 5,

  /** Network utilization thresholds (%) */
  NETWORK_UTILIZATION_HIGH: 80,
  NETWORK_UTILIZATION_MEDIUM: 50,

  /** Participation rate fallback threshold (%) */
  PARTICIPATION_FALLBACK: 50,

  /** Network utilization level thresholds (%) */
  UTILIZATION_CONGESTED: 90,
  UTILIZATION_BUSY: 70,
  UTILIZATION_MODERATE: 50,

  /** Address transaction success rate thresholds (%) */
  SUCCESS_RATE_EXCELLENT: 95,
  SUCCESS_RATE_GOOD: 80,

  /** Rank badge thresholds */
  RANK_BRONZE: 3,
} as const
