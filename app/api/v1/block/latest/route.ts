/**
 * GET /api/v1/block/latest
 * Returns the latest block information
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
import { GET_LATEST_HEIGHT, GET_BLOCK_BY_NUMBER } from '@/lib/graphql/queries/relay'
import type { LatestHeightResponse, BlockResponse, BlockData } from '@/lib/api/types'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return handleCorsOptions()
}

export async function GET() {
  try {
    // First get latest height
    const [heightData] = await queryIndexerParallel<[LatestHeightResponse]>([
      { query: GET_LATEST_HEIGHT },
    ])

    const latestHeight = heightData.latestHeight

    // Then get block details
    const blockData = await queryIndexerParallel<[BlockResponse]>([
      { query: GET_BLOCK_BY_NUMBER, variables: { number: latestHeight } },
    ])

    const block = blockData[0].block

    if (!block) {
      return apiErrorResponse(
        new IndexerConnectionError(new Error('Latest block not found'))
      )
    }

    const blockInfo: BlockData = {
      number: parseInt(block.number, 10),
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: block.timestamp,
      miner: block.miner,
      gasUsed: block.gasUsed,
      gasLimit: block.gasLimit,
      transactionCount: block.transactionCount,
      baseFeePerGas: block.baseFeePerGas,
    }

    return successResponse(blockInfo)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/block/latest', action: 'fetch-block' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
