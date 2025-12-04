/**
 * Stats React Hooks
 *
 * Custom hooks for network statistics, top miners, and analytics
 */

import { useQuery } from '@apollo/client'
import {
  GET_TOP_MINERS,
  GET_NETWORK_STATS,
  type MinerStats,
  type GetTopMinersVariables,
  type GetTopMinersData,
  type NetworkStats,
  type GetNetworkStatsData,
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
// Network Stats Hook
// ============================================================================

export interface UseNetworkStatsOptions {
  pollInterval?: number // Auto-refresh interval in ms
}

export interface UseNetworkStatsResult {
  stats: NetworkStats | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook for fetching general network statistics
 *
 * @param options Query options including poll interval
 * @returns Network statistics, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * // Get network stats with auto-refresh every 30 seconds (default)
 * const { stats, loading } = useNetworkStats()
 *
 * if (stats) {
 *   console.log('Latest block:', stats.latestBlock)
 *   console.log('Total transactions:', stats.totalTransactions)
 * }
 * ```
 */
export function useNetworkStats(
  options: UseNetworkStatsOptions = {}
): UseNetworkStatsResult {
  const { pollInterval = POLLING_INTERVALS.NORMAL } = options // Default: 30 seconds

  const { data, loading, error, refetch } = useQuery<GetNetworkStatsData>(GET_NETWORK_STATS, {
    // Enable polling for network statistics updates (30 seconds)
    pollInterval,
    fetchPolicy: 'cache-and-network',
  })

  const stats = data?.networkStats ?? null

  return {
    stats,
    loading,
    error: error ? new Error(error.message) : null,
    refetch,
  }
}

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
