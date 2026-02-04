/**
 * GET /api/v1/block/{numberOrHash}
 * Returns block information by number or hash
 */

import { NextRequest } from 'next/server'
import { queryIndexer } from '@/lib/api/relay'
import {
  successResponse,
  apiErrorResponse,
  handleCorsOptions,
} from '@/lib/api/response'
import {
  ApiError,
  InvalidHashError,
  IndexerConnectionError,
  NotFoundError,
} from '@/lib/api/errors'
import { GET_BLOCK_BY_NUMBER, GET_BLOCK_BY_HASH } from '@/lib/graphql/queries/relay'
import type { BlockResponse, BlockData } from '@/lib/api/types'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return handleCorsOptions()
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ numberOrHash: string }> }
) {
  const { numberOrHash } = await params

  try {
    let block: BlockResponse['block'] = null

    // Check if it's a block number or hash
    if (/^\d+$/.test(numberOrHash)) {
      // Block number
      const data = await queryIndexer<BlockResponse>(GET_BLOCK_BY_NUMBER, {
        number: numberOrHash,
      })
      block = data.block
    } else if (/^0x[a-fA-F0-9]{64}$/.test(numberOrHash)) {
      // Block hash
      const data = await queryIndexer<{ blockByHash: BlockResponse['block'] }>(
        GET_BLOCK_BY_HASH,
        { hash: numberOrHash }
      )
      block = data.blockByHash
    } else {
      return apiErrorResponse(new InvalidHashError(numberOrHash))
    }

    if (!block) {
      return apiErrorResponse(new NotFoundError('Block', numberOrHash))
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
    console.error('Failed to fetch block:', error)

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
