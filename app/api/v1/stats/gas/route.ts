/**
 * GET /api/v1/stats/gas
 * Returns current gas price estimates
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
import { errorLogger } from '@/lib/errors/logger'
import { GET_RECENT_TRANSACTIONS } from '@/lib/graphql/queries/relay'
import { GAS } from '@/lib/config/constants'
import type { GasPriceData } from '@/lib/api/types'

interface RecentTxResponse {
  transactions: {
    nodes: Array<{
      gasPrice: string | null
      receipt: {
        gasUsed: string
      } | null
    }>
  }
}

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return handleCorsOptions()
}

export async function GET() {
  try {
    // Get recent transactions for gas price estimation
    const data = await queryIndexer<RecentTxResponse>(GET_RECENT_TRANSACTIONS, {
      limit: 100,
    })

    const txs = data.transactions?.nodes || []

    // Extract gas prices and calculate percentiles
    const gasPrices = txs
      .map((tx) => tx.gasPrice)
      .filter((price): price is string => price !== null)
      .map((price) => BigInt(price))
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

    let slowPrice: bigint
    let standardPrice: bigint
    let fastPrice: bigint

    const defaultGas = BigInt(GAS.DEFAULT_GAS_PRICE_WEI)

    if (gasPrices.length === 0) {
      slowPrice = defaultGas
      standardPrice = defaultGas
      fastPrice = defaultGas
    } else {
      // Calculate percentiles
      const p25Index = Math.floor(gasPrices.length * 0.25)
      const p50Index = Math.floor(gasPrices.length * 0.5)
      const p75Index = Math.floor(gasPrices.length * 0.75)

      slowPrice = gasPrices[p25Index] || gasPrices[0] || defaultGas
      standardPrice = gasPrices[p50Index] || gasPrices[0] || defaultGas
      fastPrice = gasPrices[p75Index] || gasPrices[0] || defaultGas
    }

    const gasData: GasPriceData = {
      slow: {
        gasPrice: slowPrice.toString(),
        estimatedTime: '5 min',
      },
      standard: {
        gasPrice: standardPrice.toString(),
        estimatedTime: '2 min',
      },
      fast: {
        gasPrice: fastPrice.toString(),
        estimatedTime: '30 sec',
      },
    }

    return successResponse(gasData)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/stats/gas', action: 'fetch-gas' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
