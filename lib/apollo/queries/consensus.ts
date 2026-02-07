/**
 * Consensus Event Subscriptions (Phase B - Real-time WBFT Monitoring)
 *
 * Note: Custom scalars (BigInt, Hash, Address, Bytes) are serialized as strings by the backend.
 * Therefore, all query variables use String types instead of custom scalar types.
 */

import { gql } from '@apollo/client'

/**
 * Subscribe to real-time consensus block finalization events
 * Provides WBFT consensus data including round info, participation metrics, and epoch data
 *
 * @param replayLast - Number of recent consensus blocks to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_CONSENSUS_BLOCK = gql`
  subscription OnConsensusBlock($replayLast: Int) {
    consensusBlock(replayLast: $replayLast) {
      blockNumber
      blockHash
      timestamp
      round
      prevRound
      roundChanged
      proposer
      validatorCount
      prepareCount
      commitCount
      participationRate
      missedValidatorRate
      isEpochBoundary
      epochNumber
      epochValidators
    }
  }
`

/**
 * Subscribe to chain fork detection and resolution events
 * Monitors for chain splits and tracks which chain wins
 *
 * @param replayLast - Number of recent fork events to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_CONSENSUS_FORK = gql`
  subscription OnConsensusFork($replayLast: Int) {
    consensusFork(replayLast: $replayLast) {
      forkBlockNumber
      forkBlockHash
      chain1Hash
      chain1Height
      chain1Weight
      chain2Hash
      chain2Height
      chain2Weight
      resolved
      winningChain
      detectedAt
      detectionLag
    }
  }
`

/**
 * Subscribe to validator set changes at epoch boundaries
 * Tracks when validators are added or removed from the active set
 *
 * @param replayLast - Number of recent validator changes to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_CONSENSUS_VALIDATOR_CHANGE = gql`
  subscription OnValidatorChange($replayLast: Int) {
    consensusValidatorChange(replayLast: $replayLast) {
      blockNumber
      blockHash
      timestamp
      epochNumber
      isEpochBoundary
      changeType
      previousValidatorCount
      newValidatorCount
      addedValidators
      removedValidators
      validatorSet
      additionalInfo
    }
  }
`

/**
 * Subscribe to consensus errors and anomalies
 * Monitors for round changes, missed validators, low participation, etc.
 *
 * Error Types:
 * - round_change: Round change occurred (normal but monitored)
 * - missed_validators: Validators failed to sign
 * - low_participation: Participation below threshold (<66.7%)
 * - proposer_failure: Proposer failed to create block
 * - signature_failure: Signature verification failed
 *
 * Severity Levels:
 * - critical: Consensus at risk, immediate action required
 * - high: Significant issue, requires attention
 * - medium: Notable anomaly, monitor closely
 * - low: Minor issue, informational
 *
 * @param replayLast - Number of recent errors to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_CONSENSUS_ERROR = gql`
  subscription OnConsensusError($replayLast: Int) {
    consensusError(replayLast: $replayLast) {
      blockNumber
      blockHash
      timestamp
      errorType
      severity
      errorMessage
      round
      expectedValidators
      actualSigners
      participationRate
      missedValidators
      consensusImpacted
      recoveryTime
      errorDetails
    }
  }
`
