/**
 * TypeScript types for Consensus Event System (Phase B)
 *
 * These types correspond to the 4 consensus event subscriptions:
 * - consensusBlock: Block finalization with WBFT consensus data
 * - consensusFork: Fork detection and resolution
 * - consensusValidatorChange: Validator set changes at epoch boundaries
 * - consensusError: Consensus errors and anomalies
 */

// ============================================================================
// Consensus Block Event Types
// ============================================================================

/**
 * Real-time consensus block finalization event
 * Emitted for every block with full WBFT consensus data
 */
export interface ConsensusBlockEvent {
  /** Block number */
  blockNumber: number
  /** Block hash (hex string) */
  blockHash: string
  /** Block timestamp (Unix seconds) */
  timestamp: number
  /** WBFT round number (0 = first try) */
  round: number
  /** Previous round number */
  prevRound: number
  /** Whether round changed from previous block */
  roundChanged: boolean
  /** Proposer address (hex string) */
  proposer: string
  /** Total number of validators */
  validatorCount: number
  /** Number of validators who signed prepare */
  prepareCount: number
  /** Number of validators who signed commit */
  commitCount: number
  /** Participation rate (0-100%) */
  participationRate: number
  /** Missed validator rate (0-100%) */
  missedValidatorRate: number
  /** Whether this block is an epoch boundary */
  isEpochBoundary: boolean
  /** Epoch number (only present at epoch boundaries) */
  epochNumber?: number
  /** Validator addresses in the epoch (only at epoch boundaries) */
  epochValidators?: string[]
  /** Local timestamp when event was received */
  receivedAt?: Date
}

// ============================================================================
// Consensus Fork Event Types
// ============================================================================

/**
 * Chain fork detection and resolution event
 * Emitted when the indexer detects a chain split
 */
export interface ConsensusForkEvent {
  /** Block number where fork occurred */
  forkBlockNumber: number
  /** Block hash at fork point */
  forkBlockHash: string
  /** Hash of first competing chain */
  chain1Hash: string
  /** Height of first chain */
  chain1Height: number
  /** Weight/difficulty of first chain */
  chain1Weight: string
  /** Hash of second competing chain */
  chain2Hash: string
  /** Height of second chain */
  chain2Height: number
  /** Weight/difficulty of second chain */
  chain2Weight: string
  /** Whether fork has been resolved */
  resolved: boolean
  /** Which chain won (1 or 2) */
  winningChain?: number
  /** When fork was detected (Unix seconds) */
  detectedAt: number
  /** Detection lag in blocks */
  detectionLag: number
  /** Local timestamp when event was received */
  receivedAt?: Date
}

// ============================================================================
// Consensus Validator Change Event Types
// ============================================================================

/**
 * Validator set change event types
 */
export type ValidatorChangeType =
  | 'epoch_change' // Regular epoch boundary change
  | 'added' // Validator added to set
  | 'removed' // Validator removed from set
  | 'replaced' // Validator replaced

/**
 * Validator set change event at epoch boundaries
 * Emitted when validators are added or removed from the active set
 */
export interface ConsensusValidatorChangeEvent {
  /** Block number of the change */
  blockNumber: number
  /** Block hash */
  blockHash: string
  /** Block timestamp (Unix seconds) */
  timestamp: number
  /** New epoch number */
  epochNumber: number
  /** Whether this is an epoch boundary */
  isEpochBoundary: boolean
  /** Type of change */
  changeType: ValidatorChangeType
  /** Previous validator count */
  previousValidatorCount: number
  /** New validator count */
  newValidatorCount: number
  /** Validators added in this epoch */
  addedValidators?: string[]
  /** Validators removed in this epoch */
  removedValidators?: string[]
  /** Full validator set after change */
  validatorSet?: string[]
  /** Additional information (JSON string) */
  additionalInfo?: string
  /** Local timestamp when event was received */
  receivedAt?: Date
}

// ============================================================================
// Consensus Error Event Types
// ============================================================================

/**
 * Consensus error types
 */
export type ConsensusErrorType =
  | 'round_change' // Round change occurred
  | 'missed_validators' // Validators failed to sign
  | 'low_participation' // Participation below threshold
  | 'proposer_failure' // Proposer failed to create block
  | 'signature_failure' // Signature verification failed
  | 'timeout' // Consensus timeout
  | 'unknown' // Unknown error type

/**
 * Error severity levels
 */
export type ConsensusErrorSeverity = 'critical' | 'high' | 'medium' | 'low'

/**
 * Consensus error event
 * Emitted when consensus anomalies or errors are detected
 */
export interface ConsensusErrorEvent {
  /** Block number where error occurred */
  blockNumber: number
  /** Block hash */
  blockHash: string
  /** Timestamp (Unix seconds) */
  timestamp: number
  /** Type of error */
  errorType: ConsensusErrorType
  /** Severity level */
  severity: ConsensusErrorSeverity
  /** Human-readable error message */
  errorMessage: string
  /** Round number when error occurred */
  round: number
  /** Expected number of validators */
  expectedValidators: number
  /** Actual number of signers */
  actualSigners: number
  /** Participation rate at time of error (0-100%) */
  participationRate: number
  /** Addresses of validators who missed */
  missedValidators?: string[]
  /** Whether consensus was impacted */
  consensusImpacted: boolean
  /** Recovery time in milliseconds */
  recoveryTime?: number
  /** Additional error details (JSON string) */
  errorDetails?: string
  /** Local timestamp when event was received */
  receivedAt?: Date
}

// ============================================================================
// Store Types
// ============================================================================

/**
 * Consensus statistics computed from recent events
 */
export interface ConsensusStats {
  /** Total blocks processed */
  totalBlocks: number
  /** Number of round changes */
  roundChanges: number
  /** Average participation rate */
  averageParticipation: number
  /** Number of errors by severity */
  errorCount: number
  /** Errors by severity */
  errorsBySeverity: {
    critical: number
    high: number
    medium: number
    low: number
  }
  /** Last updated timestamp (ISO string for JSON serialization) */
  lastUpdated: string
}

/**
 * Network health status derived from consensus data
 */
export interface NetworkHealth {
  /** Overall health score (0-100) */
  score: number
  /** Health status label */
  status: 'excellent' | 'good' | 'fair' | 'poor'
  /** Whether network is healthy */
  isHealthy: boolean
  /** Current participation rate */
  participationRate: number
  /** Round change rate */
  roundChangeRate: number
  /** Time since last error */
  timeSinceLastError?: number
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Check if severity is high priority (requires attention)
 */
export function isHighPrioritySeverity(severity: ConsensusErrorSeverity): boolean {
  return severity === 'critical' || severity === 'high'
}

/**
 * Get color class for severity level
 */
export function getSeverityColor(severity: ConsensusErrorSeverity): string {
  switch (severity) {
    case 'critical':
      return 'text-red-500'
    case 'high':
      return 'text-orange-500'
    case 'medium':
      return 'text-yellow-500'
    case 'low':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
  }
}

/**
 * Get background color class for severity level
 */
export function getSeverityBgColor(severity: ConsensusErrorSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-900/30 border-red-500'
    case 'high':
      return 'bg-orange-900/30 border-orange-500'
    case 'medium':
      return 'bg-yellow-900/30 border-yellow-500'
    case 'low':
      return 'bg-blue-900/30 border-blue-500'
    default:
      return 'bg-gray-900/30 border-gray-500'
  }
}

/**
 * Get icon for severity level
 */
export function getSeverityIcon(severity: ConsensusErrorSeverity): string {
  switch (severity) {
    case 'critical':
      return '\u{1F6A8}' // 🚨
    case 'high':
      return '\u26A0\uFE0F' // ⚠️
    case 'medium':
      return '\u26A1' // ⚡
    case 'low':
      return '\u2139\uFE0F' // ℹ️
    default:
      return '\u2022' // •
  }
}

/**
 * Get participation rate color based on threshold
 */
export function getParticipationColor(rate: number): string {
  if (rate >= 90) return 'text-green-400'
  if (rate >= 75) return 'text-yellow-400'
  if (rate >= 66.7) return 'text-orange-400'
  return 'text-red-400'
}

/**
 * Get participation rate background color based on threshold
 */
export function getParticipationBgColor(rate: number): string {
  if (rate >= 90) return 'bg-green-500'
  if (rate >= 75) return 'bg-yellow-500'
  if (rate >= 66.7) return 'bg-orange-500'
  return 'bg-red-500'
}
