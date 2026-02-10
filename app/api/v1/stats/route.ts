/**
 * GET /api/v1/stats
 * Returns network statistics
 */

import { queryIndexerParallel } from '@/lib/api/relay'
import {
  successResponse,
  apiErrorResponse,
  handleCorsOptions,
} from '@/lib/api/response'
import {
  ApiError,
  IndexerConnectionError,
} from '@/lib/api/errors'
import { errorLogger } from '@/lib/errors/logger'
import { GET_LATEST_HEIGHT } from '@/lib/graphql/queries/relay'
import { GET_NETWORK_METRICS } from '@/lib/graphql/queries/stats'
import type {
  LatestHeightResponse,
  NetworkStatsData,
} from '@/lib/api/types'
import type { GetNetworkMetricsData } from '@/lib/graphql/queries/stats'
import { FORMATTING } from '@/lib/config/constants'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return handleCorsOptions()
}

export async function GET() {
  try {
    const now = Math.floor(Date.now() / 1000)
    const fromTime = String(now - FORMATTING.SECONDS_PER_DAY)
    const toTime = String(now)

    const [heightData, metricsData] = await queryIndexerParallel<
      [LatestHeightResponse, GetNetworkMetricsData]
    >([
      { query: GET_LATEST_HEIGHT },
      { query: GET_NETWORK_METRICS, variables: { fromTime, toTime } },
    ])

    const metrics = metricsData.networkMetrics

    const statsData: NetworkStatsData = {
      latestBlock: parseInt(heightData.latestHeight, 10),
      totalTransactions: metrics ? parseInt(metrics.totalTransactions, 10) : 0,
      totalAddresses: 0, // Not available from networkMetrics
      totalContracts: null,
      avgBlockTime: metrics?.blockTime ?? 2.0,
      tps: metrics?.tps ?? null,
    }

    return successResponse(statsData)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/stats', action: 'fetch-stats' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
