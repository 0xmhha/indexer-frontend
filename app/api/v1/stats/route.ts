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
import { GET_LATEST_HEIGHT } from '@/lib/graphql/queries/relay'
// Note: GET_NETWORK_STATS not available in current schema, using fallback
import type {
  LatestHeightResponse,
  NetworkStatsData,
} from '@/lib/api/types'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return handleCorsOptions()
}

export async function GET() {
  try {
    // Note: GET_NETWORK_STATS query not available in current schema
    // Using fallback stats based on latestHeight
    const statsData = await getFallbackStats()

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
