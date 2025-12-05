'use client'

import { useCallback, useMemo } from 'react'
import { gql, useQuery, useSubscription } from '@apollo/client'
import { PAGINATION, POLLING_INTERVALS, CONSENSUS, REPLAY } from '@/lib/config/constants'
import {
  SUBSCRIBE_CONSENSUS_BLOCK,
  SUBSCRIBE_CONSENSUS_ERROR,
  SUBSCRIBE_CONSENSUS_FORK,
  SUBSCRIBE_CONSENSUS_VALIDATOR_CHANGE,
} from '@/lib/apollo/queries'
import { useConsensusStore } from '@/stores/consensusStore'
import { useRealtimeStore } from '@/stores/realtimeStore'
import type {
  ConsensusBlockEvent,
  ConsensusErrorEvent,
  ConsensusForkEvent,
  ConsensusValidatorChangeEvent,
} from '@/types/consensus'

// ============================================================================
// GraphQL Queries - Aligned with Backend Schema
// ============================================================================

/**
 * Query for WBFT block consensus data (available in backend)
 * Uses wbftBlockExtra as the primary source for consensus info
 */
const GET_WBFT_BLOCK_EXTRA = gql`
  query GetWBFTBlockExtra($blockNumber: String!) {
    wbftBlockExtra(blockNumber: $blockNumber) {
      blockNumber
      blockHash
      randaoReveal
      prevRound
      round
      preparedSeal {
        sealers
        signature
      }
      committedSeal {
        sealers
        signature
      }
      gasTip
      epochInfo {
        epochNumber
        blockNumber
        candidates {
          address
          diligence
        }
        validators
        blsPublicKeys
      }
      timestamp
    }
  }
`

/**
 * Query for individual validator signing statistics (backend: validatorSigningStats)
 */
const GET_VALIDATOR_SIGNING_STATS = gql`
  query GetValidatorSigningStats($validatorAddress: String!, $fromBlock: String!, $toBlock: String!) {
    validatorSigningStats(validatorAddress: $validatorAddress, fromBlock: $fromBlock, toBlock: $toBlock) {
      validatorAddress
      validatorIndex
      prepareSignCount
      prepareMissCount
      commitSignCount
      commitMissCount
      fromBlock
      toBlock
      signingRate
    }
  }
`

/**
 * Query for validator signing activity details (backend: validatorSigningActivity)
 */
const GET_VALIDATOR_SIGNING_ACTIVITY = gql`
  query GetValidatorSigningActivity(
    $validatorAddress: String!
    $fromBlock: String!
    $toBlock: String!
    $limit: Int
    $offset: Int
  ) {
    validatorSigningActivity(
      validatorAddress: $validatorAddress
      fromBlock: $fromBlock
      toBlock: $toBlock
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
        blockNumber
        blockHash
        validatorAddress
        validatorIndex
        signedPrepare
        signedCommit
        round
        timestamp
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

/**
 * Query for all validators signing statistics (backend: allValidatorsSigningStats)
 */
const GET_ALL_VALIDATORS_SIGNING_STATS = gql`
  query GetAllValidatorsSigningStats($fromBlock: String!, $toBlock: String!, $limit: Int, $offset: Int) {
    allValidatorsSigningStats(
      fromBlock: $fromBlock
      toBlock: $toBlock
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
        validatorAddress
        validatorIndex
        prepareSignCount
        prepareMissCount
        commitSignCount
        commitMissCount
        fromBlock
        toBlock
        signingRate
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

/**
 * Query for specific epoch info (backend: epochInfo)
 */
const GET_EPOCH_INFO = gql`
  query GetEpochInfo($epochNumber: String!) {
    epochInfo(epochNumber: $epochNumber) {
      epochNumber
      blockNumber
      candidates {
        address
        diligence
      }
      validators
      blsPublicKeys
    }
  }
`

/**
 * Query for latest epoch info (backend: latestEpochInfo)
 */
const GET_LATEST_EPOCH_INFO = gql`
  query GetLatestEpochInfo {
    latestEpochInfo {
      epochNumber
      blockNumber
      candidates {
        address
        diligence
      }
      validators
      blsPublicKeys
    }
  }
`

/**
 * Query for block signers (backend: blockSigners)
 */
const GET_BLOCK_SIGNERS = gql`
  query GetBlockSigners($blockNumber: String!) {
    blockSigners(blockNumber: $blockNumber) {
      blockNumber
      preparers
      committers
    }
  }
`

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

// Helper to check for unsupported consensus storage error
const isUnsupportedConsensusError = (error: Error | undefined): boolean => {
  return error?.message?.includes('storage does not support consensus operations') ?? false
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

// ============================================================================
// React Hooks - Aligned with Backend Schema
// ============================================================================

/**
 * Hook to fetch WBFT block extra data (consensus info)
 * Uses wbftBlockExtra + blockSigners queries from backend
 * Returns ConsensusData format expected by BlockConsensusDetail component
 */
export function useConsensusData(blockNumber: string) {
  // Fetch WBFT block extra data
  const { data: wbftData, loading: wbftLoading, error: wbftError, previousData: wbftPrevious } = useQuery(
    GET_WBFT_BLOCK_EXTRA,
    {
      variables: { blockNumber },
      skip: !blockNumber,
      returnPartialData: true,
      errorPolicy: 'all',
    }
  )

  // Fetch block signers data
  const { data: signersData, loading: signersLoading, error: signersError, previousData: signersPrevious } = useQuery(
    GET_BLOCK_SIGNERS,
    {
      variables: { blockNumber },
      skip: !blockNumber,
      returnPartialData: true,
      errorPolicy: 'all',
    }
  )

  const effectiveWbftData = wbftData ?? wbftPrevious
  const effectiveSignersData = signersData ?? signersPrevious

  const wbftBlockExtra: WBFTBlockExtra | null = effectiveWbftData?.wbftBlockExtra ?? null
  const blockSigners: BlockSigners | null = effectiveSignersData?.blockSigners ?? null

  // Transform to ConsensusData format expected by BlockConsensusDetail
  const consensusData: ConsensusData | null = wbftBlockExtra ? (() => {
    // Get signers from blockSigners query
    const prepareSigners = blockSigners?.preparers ?? []
    const commitSigners = blockSigners?.committers ?? []

    // All validators are the union of preparers and committers for now
    // (backend doesn't provide full validator list in wbftBlockExtra for a single block)
    const allSigners = [...new Set([...prepareSigners, ...commitSigners])]

    // Determine validators list with fallback priority
    const getValidatorsList = (): string[] => {
      if (allSigners.length > 0) { return allSigners }
      if (prepareSigners.length > 0) { return prepareSigners }
      return commitSigners
    }
    const validators = getValidatorsList()

    // Calculate missed validators
    const missedPrepare = validators.filter(v => !prepareSigners.includes(v))
    const missedCommit = validators.filter(v => !commitSigners.includes(v))

    // Calculate participation rate
    const totalValidators = validators.length || 1
    const participationRate = validators.length > 0
      ? ((prepareSigners.length + commitSigners.length) / (totalValidators * 2)) * 100
      : 0

    // Determine health status (>= 66.7% participation is healthy)
    const isHealthy = participationRate >= CONSENSUS.PARTICIPATION_CRITICAL_THRESHOLD

    // Check if epoch boundary (has epochInfo)
    const isEpochBoundary = !!wbftBlockExtra.epochInfo

    // First preparer is typically the proposer (or use first committer)
    const proposer = prepareSigners[0] ?? commitSigners[0] ?? ''

    const result: ConsensusData = {
      round: wbftBlockExtra.round,
      prevRound: wbftBlockExtra.prevRound,
      proposer,
      isHealthy,
      participationRate,
      prepareCount: prepareSigners.length,
      commitCount: commitSigners.length,
      validators,
      prepareSigners,
      commitSigners,
      missedPrepare,
      missedCommit,
      isEpochBoundary,
    }

    // Add gasTip only if it's defined
    if (wbftBlockExtra.gasTip !== undefined) {
      result.gasTip = wbftBlockExtra.gasTip
    }

    return result
  })() : null

  const loading = wbftLoading || signersLoading
  const error = wbftError ?? signersError
  const isUnsupported = isUnsupportedConsensusError(wbftError) || isUnsupportedConsensusError(signersError)

  const refetch = () => {
    return Promise.all([
      wbftData && Promise.resolve(), // Only refetch if data exists
      signersData && Promise.resolve(),
    ])
  }

  return {
    consensusData,
    wbftBlockExtra, // Also expose raw WBFT data
    blockSigners, // Also expose raw signers data
    loading,
    error: isUnsupported ? undefined : error,
    refetch,
    isSupported: !isUnsupported,
  }
}

/**
 * Hook to fetch individual validator signing statistics
 * Uses validatorSigningStats query from backend
 */
export function useValidatorStats(params: {
  address: string
  fromBlock: string
  toBlock: string
}) {
  const { address, fromBlock, toBlock } = params

  const { data, loading, error, refetch, previousData } = useQuery(GET_VALIDATOR_SIGNING_STATS, {
    variables: { validatorAddress: address, fromBlock, toBlock },
    skip: !address || !fromBlock || !toBlock,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const signingStats: ValidatorSigningStats | null = effectiveData?.validatorSigningStats ?? null

  // Transform to legacy ValidatorStats format for backward compatibility
  const validatorStats: ValidatorStats | null = signingStats ? {
    address: signingStats.validatorAddress,
    totalBlocks: '0', // Not available in signing stats
    blocksProposed: '0', // Not available in signing stats
    preparesSigned: signingStats.prepareSignCount,
    commitsSigned: signingStats.commitSignCount,
    preparesMissed: signingStats.prepareMissCount,
    commitsMissed: signingStats.commitMissCount,
    participationRate: signingStats.signingRate,
  } : null

  const isUnsupported = isUnsupportedConsensusError(error)

  return {
    validatorStats,
    signingStats, // Also expose raw signing stats
    loading,
    error: isUnsupported ? undefined : error,
    refetch,
    isSupported: !isUnsupported,
  }
}

/**
 * Hook to fetch validator signing activity (per-block details)
 * Uses validatorSigningActivity query from backend
 */
export function useValidatorParticipation(params: {
  address: string
  fromBlock: string
  toBlock: string
  limit?: number
  offset?: number
}) {
  const {
    address,
    fromBlock,
    toBlock,
    limit = PAGINATION.DEFAULT_PAGE_SIZE,
    offset = 0,
  } = params

  const { data, loading, error, refetch, previousData } = useQuery(GET_VALIDATOR_SIGNING_ACTIVITY, {
    variables: { validatorAddress: address, fromBlock, toBlock, limit, offset },
    skip: !address || !fromBlock || !toBlock,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const activityData = effectiveData?.validatorSigningActivity

  // Transform to legacy ValidatorParticipation format
  const activities: ValidatorSigningActivity[] = activityData?.nodes ?? []
  const participation: ValidatorParticipation | null = activities.length > 0 ? {
    address,
    startBlock: fromBlock,
    endBlock: toBlock,
    totalBlocks: String(activityData?.totalCount ?? 0),
    blocksProposed: '0', // Calculate from activities if needed
    blocksCommitted: String(activities.filter(a => a.signedCommit).length),
    blocksMissed: String(activities.filter(a => !a.signedCommit).length),
    participationRate: activities.length > 0
      ? activities.filter(a => a.signedCommit).length / activities.length * 100
      : 0,
    blocks: activities.map(a => ({
      blockNumber: a.blockNumber,
      wasProposer: false, // Not available in signing activity
      signedPrepare: a.signedPrepare,
      signedCommit: a.signedCommit,
      round: a.round,
    })),
  } : null

  const isUnsupported = isUnsupportedConsensusError(error)

  return {
    participation,
    activities, // Also expose raw activities
    totalCount: activityData?.totalCount ?? 0,
    pageInfo: activityData?.pageInfo,
    loading,
    error: isUnsupported ? undefined : error,
    refetch,
    isSupported: !isUnsupported,
  }
}

/**
 * Hook to fetch all validators signing statistics
 * Uses allValidatorsSigningStats query from backend
 */
export function useAllValidatorStats(params: {
  fromBlock?: string
  toBlock?: string
  limit?: number
  offset?: number
} = {}) {
  const {
    fromBlock = '0',
    toBlock = '999999999',
    limit = PAGINATION.DEFAULT_PAGE_SIZE,
    offset = 0,
  } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(
    GET_ALL_VALIDATORS_SIGNING_STATS,
    {
      variables: { fromBlock, toBlock, limit, offset },
      returnPartialData: true,
      errorPolicy: 'all',
    }
  )

  const effectiveData = data ?? previousData
  const statsData = effectiveData?.allValidatorsSigningStats
  const signingStats: ValidatorSigningStats[] = statsData?.nodes ?? []

  // Transform to legacy ValidatorStats format
  const stats: ValidatorStats[] = signingStats.map(s => ({
    address: s.validatorAddress,
    totalBlocks: '0',
    blocksProposed: '0',
    preparesSigned: s.prepareSignCount,
    commitsSigned: s.commitSignCount,
    preparesMissed: s.prepareMissCount,
    commitsMissed: s.commitMissCount,
    participationRate: s.signingRate,
  }))

  const isUnsupported = isUnsupportedConsensusError(error)

  return {
    stats,
    signingStats, // Also expose raw signing stats
    totalCount: statsData?.totalCount ?? 0,
    pageInfo: statsData?.pageInfo,
    loading,
    error: isUnsupported ? undefined : error,
    refetch,
    fetchMore,
    isSupported: !isUnsupported,
  }
}

/**
 * Hook to fetch epoch data by number
 * Uses epochInfo query from backend
 */
export function useEpochData(epochNumber: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_EPOCH_INFO, {
    variables: { epochNumber },
    skip: !epochNumber,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const epochInfo: EpochInfo | null = effectiveData?.epochInfo ?? null

  // Transform to EpochData format
  const epochData: EpochData | null = epochInfo ? {
    epochNumber: epochInfo.epochNumber,
    blockNumber: epochInfo.blockNumber,
    validatorCount: epochInfo.validators?.length ?? 0,
    candidateCount: epochInfo.candidates?.length ?? 0,
    validators: epochInfo.validators ?? [],
    blsPublicKeys: epochInfo.blsPublicKeys,
    candidates: epochInfo.candidates ?? [],
  } : null

  const isUnsupported = isUnsupportedConsensusError(error)

  return {
    epochData,
    epochInfo, // Also expose raw epoch info
    loading,
    error: isUnsupported ? undefined : error,
    refetch,
    isSupported: !isUnsupported,
  }
}

/**
 * Hook to fetch latest epoch data
 * Uses latestEpochInfo query from backend
 */
export function useLatestEpochData() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_LATEST_EPOCH_INFO, {
    pollInterval: POLLING_INTERVALS.FAST, // 10초마다 자동 업데이트
    fetchPolicy: 'network-only', // 항상 네트워크에서 최신 데이터 가져오기
    nextFetchPolicy: 'network-only', // 폴링 시에도 네트워크 우선
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const epochInfo: EpochInfo | null = effectiveData?.latestEpochInfo ?? null

  // Transform to EpochData format
  const latestEpochData: EpochData | null = epochInfo ? {
    epochNumber: epochInfo.epochNumber,
    blockNumber: epochInfo.blockNumber,
    validatorCount: epochInfo.validators?.length ?? 0,
    candidateCount: epochInfo.candidates?.length ?? 0,
    validators: epochInfo.validators ?? [],
    blsPublicKeys: epochInfo.blsPublicKeys,
    candidates: epochInfo.candidates ?? [],
  } : null

  const isUnsupported = isUnsupportedConsensusError(error)

  return {
    latestEpochData,
    epochInfo, // Also expose raw epoch info
    loading,
    error: isUnsupported ? undefined : error,
    refetch,
    isSupported: !isUnsupported,
  }
}

/**
 * Hook to fetch block signers
 * Uses blockSigners query from backend
 */
export function useBlockSigners(blockNumber: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_BLOCK_SIGNERS, {
    variables: { blockNumber },
    skip: !blockNumber,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const blockSigners: BlockSigners | null = effectiveData?.blockSigners ?? null

  const isUnsupported = isUnsupportedConsensusError(error)

  return {
    blockSigners,
    loading,
    error: isUnsupported ? undefined : error,
    refetch,
    isSupported: !isUnsupported,
  }
}

// ============================================================================
// Real-time Subscription Hooks (Phase B - Consensus Event System)
// ============================================================================

/**
 * Options for consensus subscription hooks
 */
export interface ConsensusSubscriptionOptions {
  /** Number of recent events to replay on subscription (max 100) */
  replayLast?: number
}

/**
 * Hook to subscribe to real-time consensus block events
 * Automatically updates the consensus store with new blocks
 *
 * @param options - Configuration options including replayLast
 */
export function useConsensusBlockSubscription(options: ConsensusSubscriptionOptions = {}) {
  const { replayLast = REPLAY.CONSENSUS_BLOCKS_DEFAULT } = options

  // Get only action functions (stable references) to avoid re-renders
  // Zustand store functions are guaranteed to be stable across renders
  const setLatestBlock = useConsensusStore((state) => state.setLatestBlock)
  const setConnectionStatus = useConsensusStore((state) => state.setConnectionStatus)

  // Get reactive state separately
  const latestBlock = useConsensusStore((state) => state.latestBlock)
  const recentBlocks = useConsensusStore((state) => state.recentBlocks)

  // Memoize variables to prevent re-subscription
  const variables = useMemo(() => ({ replayLast }), [replayLast])

  // Stable callback for onData - Zustand actions are stable, so this won't change
  const onData = useCallback(
    ({ data: subscriptionData }: { data: { data?: { consensusBlock?: ConsensusBlockEvent } } }) => {
      if (subscriptionData.data?.consensusBlock) {
        setLatestBlock(subscriptionData.data.consensusBlock)
      }
    },
    [setLatestBlock]
  )

  // Stable callback for onError
  const onError = useCallback(
    (err: Error) => {
      console.error('[Consensus Block Subscription] Error:', err.message)
      setConnectionStatus(false, err.message)
    },
    [setConnectionStatus]
  )

  // Memoize subscription options to prevent re-subscription
  const subscriptionOptions = useMemo(
    () => ({
      variables,
      fetchPolicy: 'no-cache' as const,
      onData,
      onError,
    }),
    [variables, onData, onError]
  )

  const { data, loading, error } = useSubscription<{ consensusBlock: ConsensusBlockEvent }>(
    SUBSCRIBE_CONSENSUS_BLOCK,
    subscriptionOptions
  )

  return {
    latestBlock: data?.consensusBlock ?? latestBlock,
    recentBlocks,
    loading,
    error,
  }
}

/**
 * Hook to subscribe to consensus error events
 * Stores errors in the consensus store for alerting
 *
 * @param options - Configuration options including replayLast
 */
export function useConsensusErrorSubscription(options: ConsensusSubscriptionOptions = {}) {
  const { replayLast = REPLAY.CONSENSUS_ERRORS_DEFAULT } = options

  // Get only action functions (stable references) to avoid re-renders
  // Zustand store functions are guaranteed to be stable across renders
  const addError = useConsensusStore((state) => state.addError)

  // Get reactive state separately
  const recentErrors = useConsensusStore((state) => state.recentErrors)
  const stats = useConsensusStore((state) => state.stats)

  // Memoize variables to prevent re-subscription
  const variables = useMemo(() => ({ replayLast }), [replayLast])

  // Stable callback for onData - Zustand actions are stable, so this won't change
  const onData = useCallback(
    ({ data: subscriptionData }: { data: { data?: { consensusError?: ConsensusErrorEvent } } }) => {
      if (subscriptionData.data?.consensusError) {
        addError(subscriptionData.data.consensusError)
      }
    },
    [addError]
  )

  // Stable callback for onError
  const onError = useCallback((err: Error) => {
    console.error('[Consensus Error Subscription] Error:', err.message)
  }, [])

  // Memoize subscription options to prevent re-subscription
  const subscriptionOptions = useMemo(
    () => ({
      variables,
      fetchPolicy: 'no-cache' as const,
      onData,
      onError,
    }),
    [variables, onData, onError]
  )

  const { data, loading, error } = useSubscription<{ consensusError: ConsensusErrorEvent }>(
    SUBSCRIBE_CONSENSUS_ERROR,
    subscriptionOptions
  )

  return {
    latestError: data?.consensusError ?? recentErrors[0] ?? null,
    recentErrors,
    errorCount: stats.errorCount,
    errorsBySeverity: stats.errorsBySeverity,
    loading,
    error,
  }
}

/**
 * Hook to subscribe to consensus fork detection events
 * Monitors for chain splits
 *
 * @param options - Configuration options including replayLast
 */
export function useConsensusForkSubscription(options: ConsensusSubscriptionOptions = {}) {
  const { replayLast = REPLAY.CONSENSUS_FORKS_DEFAULT } = options

  // Get only action functions (stable references) to avoid re-renders
  // Zustand store functions are guaranteed to be stable across renders
  const addFork = useConsensusStore((state) => state.addFork)
  const updateForkResolution = useConsensusStore((state) => state.updateForkResolution)

  // Get reactive state separately
  const recentForks = useConsensusStore((state) => state.recentForks)

  // Memoize variables to prevent re-subscription
  const variables = useMemo(() => ({ replayLast }), [replayLast])

  // Stable callback for onData - Zustand actions are stable, so this won't change
  const onData = useCallback(
    ({ data: subscriptionData }: { data: { data?: { consensusFork?: ConsensusForkEvent } } }) => {
      if (subscriptionData.data?.consensusFork) {
        const fork = subscriptionData.data.consensusFork
        if (fork.resolved && fork.winningChain) {
          updateForkResolution(fork.forkBlockNumber, fork.winningChain)
        } else {
          addFork(fork)
        }
      }
    },
    [addFork, updateForkResolution]
  )

  // Stable callback for onError
  const onError = useCallback((err: Error) => {
    console.error('[Consensus Fork Subscription] Error:', err.message)
  }, [])

  // Memoize subscription options to prevent re-subscription
  const subscriptionOptions = useMemo(
    () => ({
      variables,
      fetchPolicy: 'no-cache' as const,
      onData,
      onError,
    }),
    [variables, onData, onError]
  )

  const { data, loading, error } = useSubscription<{ consensusFork: ConsensusForkEvent }>(
    SUBSCRIBE_CONSENSUS_FORK,
    subscriptionOptions
  )

  // Memoize filtered forks to prevent unnecessary recalculations
  const unresolvedForks = useMemo(() => recentForks.filter((f) => !f.resolved), [recentForks])

  const hasUnresolvedForks = useMemo(() => unresolvedForks.length > 0, [unresolvedForks])

  return {
    latestFork: data?.consensusFork ?? recentForks[0] ?? null,
    recentForks,
    unresolvedForks,
    hasUnresolvedForks,
    loading,
    error,
  }
}

/**
 * Hook to subscribe to validator set changes at epoch boundaries
 *
 * @param options - Configuration options including replayLast
 */
export function useConsensusValidatorChangeSubscription(options: ConsensusSubscriptionOptions = {}) {
  const { replayLast = REPLAY.VALIDATOR_CHANGES_DEFAULT } = options

  // Get only action functions (stable references) to avoid re-renders
  // Zustand store functions are guaranteed to be stable across renders
  const addValidatorChange = useConsensusStore((state) => state.addValidatorChange)

  // Get reactive state separately
  const recentValidatorChanges = useConsensusStore((state) => state.recentValidatorChanges)

  // Memoize variables to prevent re-subscription
  const variables = useMemo(() => ({ replayLast }), [replayLast])

  // Stable callback for onData - Zustand actions are stable, so this won't change
  const onData = useCallback(
    ({
      data: subscriptionData,
    }: {
      data: { data?: { consensusValidatorChange?: ConsensusValidatorChangeEvent } }
    }) => {
      if (subscriptionData.data?.consensusValidatorChange) {
        addValidatorChange(subscriptionData.data.consensusValidatorChange)
      }
    },
    [addValidatorChange]
  )

  // Stable callback for onError
  const onError = useCallback((err: Error) => {
    console.error('[Validator Change Subscription] Error:', err.message)
  }, [])

  // Memoize subscription options to prevent re-subscription
  const subscriptionOptions = useMemo(
    () => ({
      variables,
      fetchPolicy: 'no-cache' as const,
      onData,
      onError,
    }),
    [variables, onData, onError]
  )

  const { data, loading, error } = useSubscription<{
    consensusValidatorChange: ConsensusValidatorChangeEvent
  }>(SUBSCRIBE_CONSENSUS_VALIDATOR_CHANGE, subscriptionOptions)

  return {
    latestChange: data?.consensusValidatorChange ?? recentValidatorChanges[0] ?? null,
    recentChanges: recentValidatorChanges,
    loading,
    error,
  }
}

/**
 * Combined hook for all consensus subscriptions
 * Use this for the main consensus dashboard
 * Uses Zustand selectors to prevent unnecessary re-renders
 * Connection status comes from centralized realtimeStore (single WebSocket)
 */
export function useConsensusMonitoring() {
  // Use centralized WebSocket connection status from realtimeStore
  // This is managed by RealtimeProvider which handles the single WebSocket connection
  const isConnected = useRealtimeStore((state) => state.isConnected)
  const latestBlock = useConsensusStore((state) => state.latestBlock)
  const recentBlocks = useConsensusStore((state) => state.recentBlocks)
  const recentErrors = useConsensusStore((state) => state.recentErrors)
  const recentForks = useConsensusStore((state) => state.recentForks)
  const recentValidatorChanges = useConsensusStore((state) => state.recentValidatorChanges)
  const stats = useConsensusStore((state) => state.stats)
  const networkHealth = useConsensusStore((state) => state.networkHealth)

  // Get stable action references (these don't change)
  const clearAll = useConsensusStore((state) => state.clearAll)
  const acknowledgeError = useConsensusStore((state) => state.acknowledgeError)

  // Subscribe to all consensus events
  const blockSub = useConsensusBlockSubscription()
  const errorSub = useConsensusErrorSubscription()
  const forkSub = useConsensusForkSubscription()
  const validatorChangeSub = useConsensusValidatorChangeSubscription()

  // Memoize computed values to prevent unnecessary re-renders
  const hasSubscriptionError = useMemo(
    () => !!(blockSub.error || errorSub.error || forkSub.error || validatorChangeSub.error),
    [blockSub.error, errorSub.error, forkSub.error, validatorChangeSub.error]
  )

  const isLoading = useMemo(
    () => blockSub.loading && errorSub.loading && forkSub.loading && validatorChangeSub.loading,
    [blockSub.loading, errorSub.loading, forkSub.loading, validatorChangeSub.loading]
  )

  // Memoize filtered errors to prevent unnecessary recalculations
  const highPriorityErrors = useMemo(
    () => recentErrors.filter((e) => e.severity === 'critical' || e.severity === 'high'),
    [recentErrors]
  )

  return {
    // Connection status (from centralized realtimeStore)
    isConnected,

    // Latest data
    latestBlock,
    latestError: errorSub.latestError,
    latestFork: forkSub.latestFork,
    latestValidatorChange: validatorChangeSub.latestChange,

    // Historical data
    recentBlocks,
    recentErrors,
    recentForks,
    recentValidatorChanges,

    // Computed stats
    stats,
    networkHealth,

    // Status
    hasSubscriptionError,
    isLoading,

    // Alerts
    hasUnresolvedForks: forkSub.hasUnresolvedForks,
    unresolvedForks: forkSub.unresolvedForks,
    highPriorityErrors,

    // Actions (stable references)
    clearAll,
    acknowledgeError,
  }
}
