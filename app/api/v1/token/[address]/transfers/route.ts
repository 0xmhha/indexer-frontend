/**
 * GET /api/v1/token/{address}/transfers
 * Returns transfer history for a specific token
 */

import { NextRequest } from 'next/server'
import { queryIndexer } from '@/lib/api/relay'
import {
  paginatedResponse,
  apiErrorResponse,
  handleCorsOptions,
  parsePaginationParams,
} from '@/lib/api/response'
import { isValidAddress } from '@/lib/utils/validation'
import {
  ApiError,
  InvalidAddressError,
  IndexerConnectionError,
} from '@/lib/api/errors'
import { errorLogger } from '@/lib/errors/logger'
import { gql } from '@apollo/client'
import type { TokenTransferItem } from '@/lib/api/types'

// ERC20 Transfer event topic
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

const GET_TOKEN_LOGS = gql`
  query GetTokenLogsRelay($address: String!, $limit: Int, $offset: Int) {
    logs(
      filter: { address: $address, topics: ["${TRANSFER_TOPIC}"] }
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
        transactionHash
        blockNumber
        topics
        data
      }
      totalCount
    }
  }
`

interface TokenLogsResponse {
  logs: {
    nodes: Array<{
      transactionHash: string
      blockNumber: string
      topics: string[]
      data: string
    }>
    totalCount: number
  }
}

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return handleCorsOptions()
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  if (!isValidAddress(address)) {
    return apiErrorResponse(new InvalidAddressError(address))
  }

  const { page, limit, offset } = parsePaginationParams(request.nextUrl.searchParams)

  try {
    const data = await queryIndexer<TokenLogsResponse>(GET_TOKEN_LOGS, {
      address,
      limit,
      offset,
    })

    const { nodes, totalCount } = data.logs

    const transfers: TokenTransferItem[] = nodes
      .filter((log) => log.topics.length >= 3 && log.topics[0] === TRANSFER_TOPIC)
      .map((log) => {
        const from = parseAddressFromTopic(log.topics[1] || '')
        const to = parseAddressFromTopic(log.topics[2] || '')
        const isERC721 = log.topics.length === 4
        const tokenId = isERC721 ? parseBigIntFromHex(log.topics[3] || '') : null
        const value = isERC721 ? '1' : parseBigIntFromHex(log.data)

        return {
          hash: log.transactionHash,
          blockNumber: parseInt(log.blockNumber, 10),
          timestamp: null,
          from,
          to,
          value,
          tokenId,
        }
      })

    return paginatedResponse(transfers, page, limit, totalCount)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/token/[address]/transfers', action: 'fetch-transfers' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}

function parseAddressFromTopic(topic: string): string {
  if (!topic || topic.length < 42) {
    return '0x' + '0'.repeat(40)
  }
  return '0x' + topic.slice(-40).toLowerCase()
}

function parseBigIntFromHex(hex: string): string {
  if (!hex || hex === '0x') {
    return '0'
  }
  try {
    return BigInt(hex).toString()
  } catch {
    return '0'
  }
}
