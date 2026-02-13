'use client'

import { useMemo, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import {
  GET_BLOCKS_BY_TIME_RANGE,
  GET_BLOCK_COUNT,
  GET_TRANSACTION_COUNT,
  GET_FEE_DELEGATION_STATS,
  GET_TOP_FEE_PAYERS,
  GET_FEE_PAYER_STATS,
} from '@/lib/apollo/queries'
import { transformBlocks, type TransformedBlock, toBigInt } from '@/lib/utils/graphql-transforms'
import type {
  FeeDelegationStats,
  FeePayerStats,
  RawFeeDelegationStats,
  RawFeePayerStats,
} from '@/types/graphql'
import { PAGINATION, CACHE_POLICIES } from '@/lib/config/constants'
import { errorLogger } from '@/lib/errors/logger'

// Re-export types for backward compatibility
export type { FeeDelegationStats, FeePayerStats }

/**
 * Hook to fetch blocks in a time range for analytics
 */
export function useBlocksByTimeRange(fromTime: bigint, toTime: bigint, limit = PAGINATION.ANALYTICS_BLOCK_LIMIT) {
  const { data, loading, error, previousData } = useQuery(GET_BLOCKS_BY_TIME_RANGE, {
    variables: {
      fromTime: fromTime.toString(),
      toTime: toTime.toString(),
      limit,
    },
    skip: fromTime === BigInt(0) || toTime === BigInt(0),
    returnPartialData: true,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  const rawBlocks = effectiveData?.blocksByTimeRange?.nodes ?? []
  const blocks: TransformedBlock[] = transformBlocks(rawBlocks)
  const totalCount = effectiveData?.blocksByTimeRange?.totalCount ?? 0

  return {
    blocks,
    totalCount,
    loading,
    error,
  }
}

/**
 * Hook to fetch network counts (block count and transaction count)
 * Uses efficient root queries: blockCount and transactionCount
 *
 * For real-time metrics with avgBlockTime, use useNetworkMetrics from useNetworkMetrics.ts
 */
export function useNetworkCounts() {
  const { data: blockData, loading: blockLoading, error: blockError, previousData: blockPrevData } = useQuery(
    GET_BLOCK_COUNT,
    { returnPartialData: true }
  )
  const { data: txData, loading: txLoading, error: txError, previousData: txPrevData } = useQuery(
    GET_TRANSACTION_COUNT,
    { returnPartialData: true }
  )

  const effectiveBlockData = blockData ?? blockPrevData
  const effectiveTxData = txData ?? txPrevData

  const blockCount = effectiveBlockData?.blockCount !== null && effectiveBlockData?.blockCount !== undefined
    ? BigInt(effectiveBlockData.blockCount)
    : BigInt(0)
  const transactionCount = effectiveTxData?.transactionCount !== null && effectiveTxData?.transactionCount !== undefined
    ? BigInt(effectiveTxData.transactionCount)
    : BigInt(0)

  return {
    blockCount,
    transactionCount,
    loading: blockLoading || txLoading,
    error: blockError || txError,
  }
}

/**
 * Transform raw fee payer data from GraphQL to typed FeePayerStats
 */
function transformFeePayerStats(raw: RawFeePayerStats): FeePayerStats {
  return {
    address: raw.address,
    txCount: Number(raw.txCount),
    totalFeesPaid: toBigInt(raw.totalFeesPaid),
    percentage: raw.percentage,
  }
}

/**
 * Options for Fee Delegation statistics query
 */
export interface FeeDelegationStatsOptions {
  /** Maximum number of top fee payers to return */
  topPayersLimit?: number
  /** Start block for filtering (BigInt as string) */
  fromBlock?: string
  /** End block for filtering (BigInt as string) */
  toBlock?: string
  /** Start time filter (Unix timestamp as string, overrides fromBlock) */
  fromTime?: string
  /** End time filter (Unix timestamp as string, overrides toBlock) */
  toTime?: string
}

/**
 * Hook to fetch Fee Delegation statistics
 * Fetches from real backend API with block range and time filtering support.
 *
 * @param options - Query options including limit, block range, and time range
 */
export function useFeeDelegationStats(options: FeeDelegationStatsOptions = {}) {
  const { topPayersLimit = PAGINATION.STATS_LIMIT, fromBlock, toBlock, fromTime, toTime } = options

  // Fetch fee delegation stats
  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    previousData: statsPrevData,
    refetch: refetchStats,
  } = useQuery<{ feeDelegationStats: RawFeeDelegationStats }>(GET_FEE_DELEGATION_STATS, {
    variables: { fromBlock, toBlock, fromTime, toTime },
    fetchPolicy: CACHE_POLICIES.DYNAMIC,
    returnPartialData: true,
  })

  // Fetch top fee payers
  const {
    data: payersData,
    loading: payersLoading,
    error: payersError,
    previousData: payersPrevData,
    refetch: refetchPayers,
  } = useQuery<{ topFeePayers: { nodes: RawFeePayerStats[]; totalCount: string } }>(
    GET_TOP_FEE_PAYERS,
    {
      variables: { limit: topPayersLimit, fromBlock, toBlock },
      fetchPolicy: CACHE_POLICIES.DYNAMIC,
      returnPartialData: true,
    }
  )

  // Use previous data while loading to prevent flickering
  const effectiveStatsData = statsData ?? statsPrevData
  const effectivePayersData = payersData ?? payersPrevData

  // Log errors for debugging
  if (statsError) {
    errorLogger.error(statsError, { component: 'useFeeDelegationStats', action: 'query-stats' })
  }
  if (payersError) {
    errorLogger.error(payersError, { component: 'useFeeDelegationStats', action: 'query-payers' })
  }

  // Transform data
  const stats: FeeDelegationStats | null = useMemo(() => {
    if (!effectiveStatsData?.feeDelegationStats || !effectivePayersData?.topFeePayers) {
      return null
    }
    return {
      totalFeeDelegatedTxs: Number(effectiveStatsData.feeDelegationStats.totalFeeDelegatedTxs),
      totalFeesSaved: toBigInt(effectiveStatsData.feeDelegationStats.totalFeesSaved),
      adoptionRate: effectiveStatsData.feeDelegationStats.adoptionRate,
      avgFeeSaved: toBigInt(effectiveStatsData.feeDelegationStats.avgFeeSaved),
      topFeePayers: effectivePayersData.topFeePayers.nodes.map(transformFeePayerStats),
    }
  }, [effectiveStatsData, effectivePayersData])

  // Calculate total fee payers
  const totalFeePayers = useMemo(() => {
    const count = effectivePayersData?.topFeePayers?.totalCount
    return count ? Number(count) : 0
  }, [effectivePayersData])

  // Refetch function that updates both queries
  const refetch = useCallback(async () => {
    await Promise.all([refetchStats(), refetchPayers()])
  }, [refetchStats, refetchPayers])

  return {
    stats,
    totalFeePayers,
    loading: statsLoading || payersLoading,
    error: statsError ?? payersError ?? null,
    refetch,
  }
}

/**
 * Options for individual Fee Payer statistics query
 */
export interface FeePayerStatsOptions {
  /** Fee payer address to query */
  address: string
  /** Start block for filtering (BigInt as string) */
  fromBlock?: string
  /** End block for filtering (BigInt as string) */
  toBlock?: string
}

/**
 * Hook to fetch statistics for a specific Fee Payer
 *
 * @param options - Query options including address and block range
 */
export function useFeePayerStats(options: FeePayerStatsOptions) {
  const { address, fromBlock, toBlock } = options

  const {
    data,
    loading,
    error,
    previousData,
    refetch,
  } = useQuery<{ feePayerStats: RawFeePayerStats }>(GET_FEE_PAYER_STATS, {
    variables: { address, fromBlock, toBlock },
    skip: !address,
    fetchPolicy: CACHE_POLICIES.DYNAMIC,
    returnPartialData: true,
  })

  const effectiveData = data ?? previousData

  const stats: FeePayerStats | null = effectiveData?.feePayerStats
    ? transformFeePayerStats(effectiveData.feePayerStats)
    : null

  return {
    stats,
    loading,
    error,
    refetch,
  }
}
