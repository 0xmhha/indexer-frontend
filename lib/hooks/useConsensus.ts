'use client'

/**
 * Consensus Hooks
 * Re-exports for backward compatibility
 *
 * This file has been refactored for better maintainability:
 * - Types: ./consensus.types.ts
 * - Query hooks: ./useConsensusQueries.ts
 * - Subscription hooks: ./useConsensusSubscriptions.ts
 *
 * For new code, consider importing directly from the specific module.
 */

// Re-export all types
export type {
  WBFTAggregatedSeal,
  CandidateInfo,
  EpochInfo,
  EpochData,
  EpochSummary,
  WBFTBlockExtra,
  ValidatorSigningStats,
  ValidatorSigningActivity,
  BlockSigners,
  ValidatorStats,
  BlockParticipation,
  ValidatorParticipation,
  ConsensusData,
  ConsensusSubscriptionOptions,
} from './consensus.types'

export { isUnsupportedConsensusError } from './consensus.types'

// Re-export all query hooks
export {
  useConsensusData,
  useValidatorStats,
  useValidatorParticipation,
  useAllValidatorStats,
  useEpochData,
  useEpochs,
  useLatestEpochData,
  useBlockSigners,
} from './useConsensusQueries'

// Re-export all subscription hooks
export {
  useConsensusBlockSubscription,
  useConsensusErrorSubscription,
  useConsensusForkSubscription,
  useConsensusValidatorChangeSubscription,
  useConsensusMonitoring,
} from './useConsensusSubscriptions'
