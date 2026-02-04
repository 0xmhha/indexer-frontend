/**
 * GET /api/v1/stats
 * Returns network statistics
 */

import { queryIndexer } from '@/lib/api/relay'
import {
  successResponse,
  apiErrorResponse,
  handleCorsOptions,
} from '@/lib/api/response'
import {
  ApiError,
  IndexerConnectionError,
} from '@/lib/api/errors'
import { GET_NETWORK_STATS, GET_LATEST_HEIGHT } from '@/lib/graphql/queries/relay'
import type {
  NetworkStatsResponse,
  LatestHeightResponse,
  NetworkStatsData,
} from '@/lib/api/types'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return handleCorsOptions()
}

export async function GET() {
  try {
    // Try to get network stats from dedicated query
    let statsData: NetworkStatsData

    try {
      const data = await queryIndexer<NetworkStatsResponse>(GET_NETWORK_STATS)

      if (data.networkStats) {
        const stats = data.networkStats
        statsData = {
          latestBlock: parseInt(stats.latestBlock, 10),
          totalTransactions: parseInt(stats.totalTransactions, 10),
          totalAddresses: parseInt(stats.totalAddresses, 10),
          totalContracts: null, // Not available in current schema
          avgBlockTime: stats.avgBlockTime,
          tps: calculateTps(stats.avgBlockTime),
        }
      } else {
        // Fallback to basic height query
        statsData = await getFallbackStats()
      }
    } catch {
      // If networkStats query not available, use fallback
      statsData = await getFallbackStats()
    }

    return successResponse(statsData)
  } catch (error) {
    console.error('Failed to fetch stats:', error)

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}

/**
 * Calculate approximate TPS from average block time
 * Assumes average ~100 transactions per block
 */
function calculateTps(avgBlockTime: number): number | null {
  if (!avgBlockTime || avgBlockTime <= 0) {
    return null
  }
  // Rough estimate: assume 100 txs per block average
  const estimatedTxPerBlock = 100
  return Math.round((estimatedTxPerBlock / avgBlockTime) * 10) / 10
}

/**
 * Fallback stats when networkStats query is not available
 */
async function getFallbackStats(): Promise<NetworkStatsData> {
  const heightData = await queryIndexer<LatestHeightResponse>(GET_LATEST_HEIGHT)

  return {
    latestBlock: parseInt(heightData.latestHeight, 10),
    totalTransactions: 0,
    totalAddresses: 0,
    totalContracts: null,
    avgBlockTime: 2.0, // Default estimate
    tps: null,
  }
}
