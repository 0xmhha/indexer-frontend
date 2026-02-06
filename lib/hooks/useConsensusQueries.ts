'use client'

/**
 * Consensus Query Hooks
 * React Query hooks for fetching consensus data
 *
 * This file contains all query-based hooks for consensus data.
 * For real-time subscriptions, see useConsensusSubscriptions.ts
 */

import { useQuery } from '@apollo/client'
import { PAGINATION, POLLING_INTERVALS, CONSENSUS } from '@/lib/config/constants'
import {
  GET_WBFT_BLOCK_EXTRA,
  GET_VALIDATOR_SIGNING_STATS,
  GET_VALIDATOR_SIGNING_ACTIVITY,
  GET_ALL_VALIDATORS_SIGNING_STATS,
  GET_EPOCH_INFO,
  GET_LATEST_EPOCH_INFO,
  GET_BLOCK_SIGNERS,
} from '@/lib/graphql/queries/consensus'
import type {
  WBFTBlockExtra,
  BlockSigners,
  ConsensusData,
  ValidatorSigningStats,
  ValidatorStats,
  ValidatorSigningActivity,
  ValidatorParticipation,
  EpochInfo,
  EpochData,
} from './consensus.types'
import { isUnsupportedConsensusError } from './consensus.types'

// ============================================================================
// Query Hooks - Aligned with Backend Schema
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
