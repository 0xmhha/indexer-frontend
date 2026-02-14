'use client'

import { useQuery } from '@apollo/client'
import { PAGINATION, POLLING_INTERVALS } from '@/lib/config/constants'
import {
  GET_WBFT_BLOCK_EXTRA,
  GET_LATEST_EPOCH_INFO,
  GET_EPOCH_INFO,
  GET_ALL_VALIDATORS_SIGNING_STATS,
  GET_BLOCK_SIGNERS,
} from '@/lib/graphql/queries/consensus'
import { GET_ACTIVE_VALIDATORS } from '@/lib/graphql/queries/system-contracts'
import { GET_LATEST_HEIGHT } from '@/lib/apollo/queries/block'

// Types - aligned with backend schema

// Aggregated BLS seal from validators
export interface WBFTAggregatedSeal {
  sealers: string   // bitmap of validators who signed
  signature: string // aggregated BLS signature
}

// Candidate for next epoch
export interface CandidateInfo {
  address: string
  diligence: string
}

// Epoch information from backend
export interface EpochInfo {
  epochNumber: string
  blockNumber: string
  candidates: CandidateInfo[]
  validators: number[]  // validator indices
  blsPublicKeys: string[]
}

// WBFT block metadata (from wbftBlockExtra)
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

// Legacy alias for backward compatibility
export type WBFTBlock = WBFTBlockExtra

// Computed epoch data for UI display
export interface Epoch {
  epochNumber: string
  blockNumber?: string
  validatorCount: number
  candidateCount: number
  validators: number[]  // indices
  blsPublicKeys?: string[]
  candidates: CandidateInfo[]
}

// UI display type for validator information (constructed from Epoch data)
// Note: Backend only provides indices and BLS keys, not addresses
export interface ValidatorDisplayInfo {
  index: number
  address: string  // Placeholder - use BLS key prefix or index string
  blsPubKey: string
}

export interface ValidatorSigningStats {
  validatorAddress: string
  validatorIndex: number
  fromBlock: string
  toBlock: string
  signingRate: number
  // Count fields are BigInt from backend, serialized as strings
  prepareSignCount: string
  prepareMissCount: string
  commitSignCount: string
  commitMissCount: string
}

// Block signers from backend
export interface BlockSigners {
  blockNumber: string
  preparers: string[]  // validators who signed in prepare phase
  committers: string[] // validators who signed in commit phase
}

// Validator info from activeValidators query
export interface Validator {
  address: string
  isActive: boolean
}

/**
 * Hook to fetch WBFT block metadata (uses wbftBlockExtra query)
 */
export function useWBFTBlock(blockNumber: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_WBFT_BLOCK_EXTRA, {
    variables: { blockNumber },
    returnPartialData: true,
    skip: !blockNumber,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const wbftBlock: WBFTBlockExtra | null = effectiveData?.wbftBlockExtra ?? null

  // Check for unsupported consensus storage
  const isUnsupportedError = error?.message?.includes('storage does not support consensus operations')

  return {
    wbftBlock,
    loading,
    error: isUnsupportedError ? undefined : error,
    refetch,
    isSupported: !isUnsupportedError,
  }
}

/**
 * Hook to fetch current/latest epoch information
 * Uses latestEpochInfo query (backend)
 * Note: This query may not be supported on all backends (requires consensus storage)
 */
export function useCurrentEpoch() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_LATEST_EPOCH_INFO, {
    pollInterval: POLLING_INTERVALS.FAST, // 10초마다 자동 업데이트
    fetchPolicy: 'network-only', // 항상 네트워크에서 최신 데이터 가져오기
    nextFetchPolicy: 'network-only', // 폴링 시에도 네트워크 우선
    // Silently handle errors for backends that don't support consensus operations
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const epochInfo: EpochInfo | null = effectiveData?.latestEpochInfo ?? null

  // Transform EpochInfo to Epoch for UI display
  const currentEpoch: Epoch | null = epochInfo ? {
    epochNumber: epochInfo.epochNumber,
    blockNumber: epochInfo.blockNumber,
    validatorCount: epochInfo.validators?.length ?? 0,
    candidateCount: epochInfo.candidates?.length ?? 0,
    validators: epochInfo.validators ?? [],
    blsPublicKeys: epochInfo.blsPublicKeys,
    candidates: epochInfo.candidates ?? [],
  } : null

  // Check if it's a "storage does not support consensus operations" error
  const isUnsupportedError = error?.message?.includes('storage does not support consensus operations')

  return {
    currentEpoch,
    loading,
    // Don't report unsupported storage as error - just return null data
    error: isUnsupportedError ? undefined : error,
    refetch,
    // Flag to indicate if consensus operations are supported
    isSupported: !isUnsupportedError,
  }
}

/**
 * Hook to fetch epoch by number (uses epochInfo query)
 */
export function useEpochByNumber(epochNumber: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_EPOCH_INFO, {
    variables: { epochNumber },
    returnPartialData: true,
    skip: !epochNumber,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const epochInfo: EpochInfo | null = effectiveData?.epochInfo ?? null

  // Transform EpochInfo to Epoch for UI display
  const epoch: Epoch | null = epochInfo ? {
    epochNumber: epochInfo.epochNumber,
    blockNumber: epochInfo.blockNumber,
    validatorCount: epochInfo.validators?.length ?? 0,
    candidateCount: epochInfo.candidates?.length ?? 0,
    validators: epochInfo.validators ?? [],
    blsPublicKeys: epochInfo.blsPublicKeys,
    candidates: epochInfo.candidates ?? [],
  } : null

  // Check for unsupported consensus storage
  const isUnsupportedError = error?.message?.includes('storage does not support consensus operations')

  return {
    epoch,
    loading,
    error: isUnsupportedError ? undefined : error,
    refetch,
    isSupported: !isUnsupportedError,
  }
}

/**
 * Hook to fetch all validators signing statistics
 * Requires: fromBlock, toBlock (backend requires these)
 * Default block range: last 1000 blocks from latestHeight
 */
export function useValidatorSigningStats(
  params: {
    fromBlock?: string
    toBlock?: string
    limit?: number
    offset?: number
  } = {}
) {
  // First fetch latestHeight to compute a reasonable default range
  const { data: heightData } = useQuery(GET_LATEST_HEIGHT, {
    pollInterval: POLLING_INTERVALS.FAST,
  })

  const latestHeight = heightData?.latestHeight ? String(heightData.latestHeight) : null

  // Backend requires fromBlock and toBlock to be non-null
  // Default to last 1000 blocks to avoid scanning the entire chain (which causes timeout)
  const {
    limit = PAGINATION.DEFAULT_PAGE_SIZE,
    offset = 0
  } = params

  const toBlock = params.toBlock ?? latestHeight ?? '1000'
  const fromBlock = params.fromBlock ?? String(Math.max(0, Number(toBlock) - 1000))

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(
    GET_ALL_VALIDATORS_SIGNING_STATS,
    {
      variables: {
        fromBlock,
        toBlock,
        limit,
        offset,
      },
      returnPartialData: true,
      skip: !latestHeight && !params.toBlock,
    }
  )

  const effectiveData = data ?? previousData
  const stats: ValidatorSigningStats[] = effectiveData?.allValidatorsSigningStats?.nodes ?? []
  const totalCount = effectiveData?.allValidatorsSigningStats?.totalCount ?? 0
  const pageInfo = effectiveData?.allValidatorsSigningStats?.pageInfo

  return {
    stats,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    fetchMore,
  }
}

/**
 * Hook to fetch block signers (preparers and committers)
 */
export function useBlockSigners(blockNumber: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_BLOCK_SIGNERS, {
    variables: { blockNumber },
    returnPartialData: true,
    skip: !blockNumber,
    errorPolicy: 'all',
  })

  const effectiveData = data ?? previousData
  const blockSigners: BlockSigners | null = effectiveData?.blockSigners ?? null

  // Check for unsupported consensus storage
  const isUnsupportedError = error?.message?.includes('storage does not support consensus operations')

  return {
    blockSigners,
    loading,
    error: isUnsupportedError ? undefined : error,
    refetch,
    isSupported: !isUnsupportedError,
  }
}

/**
 * Hook to fetch active validators list
 * Backend returns all validators without pagination
 */
export function useValidators() {
  const { data, loading, error, refetch, previousData } = useQuery(GET_ACTIVE_VALIDATORS, {
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData
  const validators: Validator[] = effectiveData?.activeValidators ?? []

  return {
    validators,
    totalCount: validators.length,
    loading,
    error,
    refetch,
  }
}
