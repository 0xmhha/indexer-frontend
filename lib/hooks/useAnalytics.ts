'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
  MinerStats,
  FeeDelegationStats,
  FeePayerStats,
  RawFeeDelegationStats,
  RawFeePayerStats,
} from '@/types/graphql'
import { PAGINATION, TIMING, CACHE_POLICIES } from '@/lib/config/constants'
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
 * Hook to fetch network metrics (block count and transaction count)
 * Uses efficient root queries: blockCount and transactionCount
 */
export function useNetworkMetrics() {
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
 * Hook to fetch top miners statistics
 * Note: Uses mock data until backend API is implemented
 */
export function useTopMiners(limit = PAGINATION.STATS_LIMIT) {
  const [miners, setMiners] = useState<MinerStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call with mock data
    const timer = setTimeout(() => {
      /* eslint-disable no-magic-numbers -- Mock data with representative block numbers and percentages */
      const mockMiners: MinerStats[] = [
        {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          blockCount: 1523,
          lastBlockNumber: BigInt(125678),
          percentage: 15.23,
        },
        {
          address: '0x8932Eb23BAD9bDdB5cF81426F78279A53c6c3b71',
          blockCount: 1342,
          lastBlockNumber: BigInt(125645),
          percentage: 13.42,
        },
        {
          address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
          blockCount: 1187,
          lastBlockNumber: BigInt(125634),
          percentage: 11.87,
        },
        {
          address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
          blockCount: 1045,
          lastBlockNumber: BigInt(125621),
          percentage: 10.45,
        },
        {
          address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
          blockCount: 987,
          lastBlockNumber: BigInt(125598),
          percentage: 9.87,
        },
        {
          address: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
          blockCount: 876,
          lastBlockNumber: BigInt(125576),
          percentage: 8.76,
        },
        {
          address: '0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b',
          blockCount: 754,
          lastBlockNumber: BigInt(125554),
          percentage: 7.54,
        },
        {
          address: '0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d',
          blockCount: 689,
          lastBlockNumber: BigInt(125532),
          percentage: 6.89,
        },
        {
          address: '0xd03ea8624C8C5987235048901fB614fDcA89b117',
          blockCount: 621,
          lastBlockNumber: BigInt(125510),
          percentage: 6.21,
        },
        {
          address: '0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC',
          blockCount: 567,
          lastBlockNumber: BigInt(125489),
          percentage: 5.67,
        },
      ].slice(0, limit)
      /* eslint-enable no-magic-numbers */

      setMiners(mockMiners)
      setLoading(false)
    }, TIMING.MOCK_API_DELAY)

    return () => clearTimeout(timer)
  }, [limit])

  return {
    miners,
    loading,
    error: null,
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
 * Mock data for Fee Delegation stats (used as fallback when backend API is not available)
 */
function getMockFeeDelegationStats(limit: number): FeeDelegationStats {
  const mockFeePayers: FeePayerStats[] = [
    {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      txCount: 2543,
      totalFeesPaid: BigInt('15230000000000000000'),
      percentage: 32.5,
    },
    {
      address: '0x8932Eb23BAD9bDdB5cF81426F78279A53c6c3b71',
      txCount: 1876,
      totalFeesPaid: BigInt('11890000000000000000'),
      percentage: 24.0,
    },
    {
      address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
      txCount: 1432,
      totalFeesPaid: BigInt('8760000000000000000'),
      percentage: 18.3,
    },
    {
      address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
      txCount: 987,
      totalFeesPaid: BigInt('6120000000000000000'),
      percentage: 12.6,
    },
    {
      address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
      txCount: 654,
      totalFeesPaid: BigInt('4050000000000000000'),
      percentage: 8.4,
    },
    {
      address: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
      txCount: 321,
      totalFeesPaid: BigInt('2010000000000000000'),
      percentage: 4.1,
    },
  ].slice(0, limit)

  const totalTxs = mockFeePayers.reduce((sum, fp) => sum + fp.txCount, 0)
  const totalFees = mockFeePayers.reduce((sum, fp) => sum + fp.totalFeesPaid, BigInt(0))
  const avgFee = totalTxs > 0 ? totalFees / BigInt(totalTxs) : BigInt(0)

  return {
    totalFeeDelegatedTxs: totalTxs,
    totalFeesSaved: totalFees,
    topFeePayers: mockFeePayers,
    adoptionRate: 12.8,
    avgFeeSaved: avgFee,
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
  /** Use mock data instead of API (default: false, auto-fallback on error) */
  useMock?: boolean
}

/**
 * Hook to fetch Fee Delegation statistics
 * Fetches from real backend API with block range filtering support.
 * Falls back to mock data when backend API is not available.
 *
 * @param options - Query options including limit and block range
 */
export function useFeeDelegationStats(options: FeeDelegationStatsOptions = {}) {
  const { topPayersLimit = PAGINATION.STATS_LIMIT, fromBlock, toBlock, fromTime, toTime, useMock = false } = options

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
    skip: useMock,
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
      skip: useMock,
    }
  )

  // Use previous data while loading to prevent flickering
  const effectiveStatsData = statsData ?? statsPrevData
  const effectivePayersData = payersData ?? payersPrevData

  // Check if we should use mock data (explicit flag or API error)
  const hasApiError = Boolean(statsError || payersError)
  const shouldUseMock = useMock || hasApiError

  // Debug: Log errors
  if (statsError) {
    errorLogger.error(statsError, { component: 'useFeeDelegationStats', action: 'query-stats' })
  }
  if (payersError) {
    errorLogger.error(payersError, { component: 'useFeeDelegationStats', action: 'query-payers' })
  }

  // Transform data or use mock
  const stats: FeeDelegationStats | null = useMemo(() => {
    if (shouldUseMock) {
      return getMockFeeDelegationStats(topPayersLimit)
    }
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
  }, [shouldUseMock, topPayersLimit, effectiveStatsData, effectivePayersData])

  // Calculate total fee payers
  const totalFeePayers = useMemo(() => {
    if (shouldUseMock) {
      return getMockFeeDelegationStats(topPayersLimit).topFeePayers.length
    }
    const count = effectivePayersData?.topFeePayers?.totalCount
    return count ? Number(count) : 0
  }, [shouldUseMock, topPayersLimit, effectivePayersData])

  // Refetch function that updates both queries
  const refetch = useCallback(async () => {
    if (!useMock) {
      await Promise.all([refetchStats(), refetchPayers()])
    }
  }, [useMock, refetchStats, refetchPayers])

  return {
    stats,
    totalFeePayers,
    loading: useMock ? false : statsLoading || payersLoading,
    error: null, // Hide error when using mock fallback
    isMockData: shouldUseMock,
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
