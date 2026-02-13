/**
 * Stats React Hooks
 *
 * Custom hooks for network statistics, top miners, and analytics
 */

import { useQuery } from '@apollo/client'
import {
  GET_TOP_MINERS,
  GET_NETWORK_METRICS,
  type MinerStats,
  type GetTopMinersVariables,
  type GetTopMinersData,
  type NetworkMetrics,
  type GetNetworkMetricsVariables,
  type GetNetworkMetricsData,
} from '@/lib/graphql/queries/stats'
import { PAGINATION, POLLING_INTERVALS, BLOCKCHAIN, FORMATTING } from '@/lib/config/constants'

// ============================================================================
// Top Miners Hook
// ============================================================================

export interface UseTopMinersOptions {
  limit?: number
  fromBlock?: bigint
  toBlock?: bigint
  pollInterval?: number // Auto-refresh interval in ms
}

export interface UseTopMinersResult {
  miners: MinerStats[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook for fetching top miners statistics
 *
 * @param options Query options including limit and block range
 * @returns Miner statistics, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * // Get top 10 miners for all blocks
 * const { miners, loading } = useTopMiners({ limit: 10 })
 *
 * // Get top miners for specific block range
 * const { miners } = useTopMiners({
 *   limit: 20,
 *   fromBlock: 1000n,
 *   toBlock: 2000n
 * })
 *
 * // Auto-refresh every 30 seconds (default)
 * const { miners } = useTopMiners({
 *   limit: 10,
 * })
 * ```
 */
export function useTopMiners(options: UseTopMinersOptions = {}): UseTopMinersResult {
  const {
    limit = PAGINATION.STATS_LIMIT,
    fromBlock,
    toBlock,
    pollInterval = POLLING_INTERVALS.NORMAL, // Default: 30 seconds
  } = options

  const { data, loading, error, refetch } = useQuery<GetTopMinersData, GetTopMinersVariables>(
    GET_TOP_MINERS,
    {
      variables: {
        limit,
        ...(fromBlock !== undefined && { fromBlock: fromBlock.toString() }),
        ...(toBlock !== undefined && { toBlock: toBlock.toString() }),
      },
      // Enable polling for statistics updates (30 seconds)
      pollInterval,
      fetchPolicy: 'cache-and-network',
    }
  )

  const miners = data?.topMiners ?? []

  return {
    miners,
    loading,
    error: error ? new Error(error.message) : null,
    refetch,
  }
}

// ============================================================================
// Network Metrics Hook
// ============================================================================

export interface UseNetworkMetricsOptions {
  fromTime?: string
  toTime?: string
  pollInterval?: number
}

export interface UseNetworkMetricsResult {
  metrics: NetworkMetrics | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook for fetching network metrics with time-range filtering
 *
 * @param options Query options including time range and poll interval
 * @returns Network metrics, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * // Get last 24h network metrics
 * const now = Math.floor(Date.now() / 1000)
 * const { metrics, loading } = useNetworkMetrics({
 *   fromTime: String(now - 86400),
 *   toTime: String(now),
 * })
 * ```
 */
export function useNetworkMetricsByTimeRange(
  options: UseNetworkMetricsOptions = {}
): UseNetworkMetricsResult {
  const {
    fromTime = String(Math.floor(Date.now() / 1000) - FORMATTING.SECONDS_PER_DAY),
    toTime = String(Math.floor(Date.now() / 1000)),
    pollInterval = POLLING_INTERVALS.NORMAL,
  } = options

  const { data, loading, error, refetch } = useQuery<GetNetworkMetricsData, GetNetworkMetricsVariables>(
    GET_NETWORK_METRICS,
    {
      variables: { fromTime, toTime },
      pollInterval,
      fetchPolicy: 'cache-and-network',
    }
  )

  const metrics = data?.networkMetrics ?? null

  return {
    metrics,
    loading,
    error: error ? new Error(error.message) : null,
    refetch,
  }
}

/** @deprecated Use useNetworkMetricsByTimeRange instead */
export const useNetworkStats = useNetworkMetricsByTimeRange

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate block range for time periods
 */
export function getBlockRange(
  currentBlock: bigint,
  period: '24h' | '7d' | '30d' | 'all',
  avgBlockTime: number = FORMATTING.AVG_BLOCK_TIME
): { fromBlock?: bigint; toBlock: bigint } {
  const toBlock = currentBlock
  const secondsPerDay = FORMATTING.SECONDS_PER_DAY

  switch (period) {
    case '24h': {
      const blocksPerDay = Math.floor(secondsPerDay / avgBlockTime)
      return {
        fromBlock: currentBlock - BigInt(blocksPerDay),
        toBlock,
      }
    }
    case '7d': {
      const blocksPerWeek = Math.floor((FORMATTING.DAYS_PER_WEEK * secondsPerDay) / avgBlockTime)
      return {
        fromBlock: currentBlock - BigInt(blocksPerWeek),
        toBlock,
      }
    }
    case '30d': {
      const blocksPerMonth = Math.floor((FORMATTING.DAYS_PER_MONTH * secondsPerDay) / avgBlockTime)
      return {
        fromBlock: currentBlock - BigInt(blocksPerMonth),
        toBlock,
      }
    }
    case 'all':
    default:
      return { toBlock }
  }
}

/**
 * Format miner rewards for display
 */
export function formatMinerRewards(weiAmount: string): string {
  try {
    const wei = BigInt(weiAmount)
    const eth = Number(wei) / BLOCKCHAIN.WEI_PER_ETHER
    return `${eth.toFixed(FORMATTING.DECIMAL_PLACES_STANDARD)} ETH`
  } catch {
    return '0 ETH'
  }
}

/**
 * Format percentage with precision
 */
export function formatPercentage(percentage: number, decimals: number = FORMATTING.DECIMAL_PLACES_PERCENTAGE): string {
  return `${percentage.toFixed(decimals)}%`
}
