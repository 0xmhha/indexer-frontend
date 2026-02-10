/**
 * Consensus Types
 * TypeScript interfaces aligned with Backend Schema
 *
 * This file contains all type definitions used by consensus-related hooks.
 * Separated for better maintainability and reusability.
 */

// ============================================================================
// TypeScript Interfaces - Aligned with Backend Schema
// ============================================================================

// Aggregated BLS seal from validators
export interface WBFTAggregatedSeal {
  sealers: string
  signature: string
}

// Candidate info from backend
export interface CandidateInfo {
  address: string
  diligence: string
}

// Epoch info from backend (epochInfo/latestEpochInfo)
export interface EpochInfo {
  epochNumber: string
  blockNumber: string
  candidates: CandidateInfo[]
  validators: number[]  // validator indices
  blsPublicKeys: string[]
  validatorCount?: number
  candidateCount?: number
  previousEpochValidatorCount?: number | null
  timestamp?: string
}

// Lightweight epoch summary for list queries
export interface EpochSummary {
  epochNumber: string
  blockNumber: string
  validatorCount: number
  candidateCount: number
  timestamp?: string
}

// Computed epoch data for UI display
export interface EpochData {
  epochNumber: string
  blockNumber?: string
  validatorCount: number
  candidateCount: number
  validators: number[]
  blsPublicKeys?: string[]
  candidates: CandidateInfo[]
  previousEpochValidatorCount: number | null
  timestamp: string | null
}

// WBFT block extra from backend
export interface WBFTBlockExtra {
  blockNumber: string
  blockHash: string
  randaoReveal: string
  prevRound: number
  round: number
  preparedSeal?: WBFTAggregatedSeal
  committedSeal?: WBFTAggregatedSeal
  gasTip?: string
  epochInfo?: EpochInfo
  timestamp: string
}

// Validator signing stats from backend
export interface ValidatorSigningStats {
  validatorAddress: string
  validatorIndex: number
  prepareSignCount: string
  prepareMissCount: string
  commitSignCount: string
  commitMissCount: string
  fromBlock: string
  toBlock: string
  signingRate: number
  blocksProposed: string
  totalBlocks: string
  proposalRate: number | null
}

// Validator signing activity from backend
export interface ValidatorSigningActivity {
  blockNumber: string
  blockHash: string
  validatorAddress: string
  validatorIndex: number
  signedPrepare: boolean
  signedCommit: boolean
  round: number
  timestamp: string
}

// Block signers from backend
export interface BlockSigners {
  blockNumber: string
  preparers: string[]
  committers: string[]
}

// Legacy interfaces for backward compatibility
export interface ValidatorStats {
  address: string
  totalBlocks: string
  blocksProposed: string
  preparesSigned: string
  commitsSigned: string
  preparesMissed: string
  commitsMissed: string
  participationRate: number
  lastProposedBlock?: string
  lastCommittedBlock?: string
  lastSeenBlock?: string
}

export interface BlockParticipation {
  blockNumber: string
  wasProposer: boolean
  signedPrepare: boolean
  signedCommit: boolean
  round: number
}

export interface ValidatorParticipation {
  address: string
  startBlock: string
  endBlock: string
  totalBlocks: string
  blocksProposed: string
  blocksCommitted: string
  blocksMissed: string
  participationRate: number
  blocks: BlockParticipation[]
}

// ConsensusData interface expected by BlockConsensusDetail component
export interface ConsensusData {
  round: number
  prevRound: number
  proposer: string
  isHealthy: boolean
  participationRate: number
  prepareCount: number
  commitCount: number
  validators: string[]
  prepareSigners: string[]
  commitSigners: string[]
  missedPrepare: string[]
  missedCommit: string[]
  gasTip?: string
  isEpochBoundary: boolean
}

/**
 * Options for consensus subscription hooks
 */
export interface ConsensusSubscriptionOptions {
  /** Number of recent events to replay on subscription (max 100) */
  replayLast?: number
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Helper to check for unsupported consensus storage error
 */
export const isUnsupportedConsensusError = (error: Error | undefined): boolean => {
  return error?.message?.includes('storage does not support consensus operations') ?? false
}
