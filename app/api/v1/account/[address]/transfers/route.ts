/**
 * GET /api/v1/account/{address}/transfers
 * Returns token transfer history for an address with pagination
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
import { GET_LOGS_BY_ADDRESS } from '@/lib/graphql/queries/relay'
import type { LogsResponse, TokenTransferInList } from '@/lib/api/types'

// ERC20 Transfer event topic
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return handleCorsOptions()
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  // Validate address format
  if (!isValidAddress(address)) {
    return apiErrorResponse(new InvalidAddressError(address))
  }

  // Parse pagination parameters
  const { page, limit, offset } = parsePaginationParams(request.nextUrl.searchParams)

  // Parse filter parameters
  const typeParam = request.nextUrl.searchParams.get('type') || 'all'
  const tokenFilter = request.nextUrl.searchParams.get('token')

  try {
    // Query logs for the address
    const data = await queryIndexer<LogsResponse>(GET_LOGS_BY_ADDRESS, {
      address,
      limit: limit * 2, // Fetch more to filter
      offset,
    })

    const { nodes, totalCount } = data.logs

    // Filter and transform to token transfers
    const transfers: TokenTransferInList[] = nodes
      .filter((log) => {
        // Filter for Transfer events
        if (log.topics.length < 3 || log.topics[0] !== TRANSFER_TOPIC) {
          return false
        }

        // Filter by token contract if specified
        if (tokenFilter && log.address.toLowerCase() !== tokenFilter.toLowerCase()) {
          return false
        }

        return true
      })
      .map((log) => {
        // Parse Transfer event data
        const from = parseAddressFromTopic(log.topics[1] || '')
        const to = parseAddressFromTopic(log.topics[2] || '')

        // Determine token type from topics count
        const isERC721 = log.topics.length === 4
        const tokenId = isERC721 ? parseBigIntFromHex(log.topics[3] || '') : null
        const value = isERC721 ? '1' : parseBigIntFromHex(log.data)

        return {
          hash: log.transactionHash,
          blockNumber: parseInt(log.blockNumber, 10),
          timestamp: null, // Would need block lookup
          from,
          to,
          contractAddress: log.address,
          tokenName: null, // Would need token metadata lookup
          tokenSymbol: null,
          tokenDecimals: null,
          value,
          tokenId,
          type: isERC721 ? 'ERC721' as const : 'ERC20' as const,
        }
      })
      .filter((transfer) => {
        // Filter by type
        if (typeParam !== 'all' && transfer.type !== typeParam.toUpperCase()) {
          return false
        }
        return true
      })
      .slice(0, limit) // Limit after filtering

    return paginatedResponse(transfers, page, limit, totalCount)
  } catch (error) {
    console.error('Failed to fetch transfers:', error)

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}

/**
 * Parse address from 32-byte topic (last 20 bytes)
 */
function parseAddressFromTopic(topic: string): string {
  if (!topic || topic.length < 42) {
    return '0x' + '0'.repeat(40)
  }
  // Take last 40 characters (20 bytes) and add 0x prefix
  return '0x' + topic.slice(-40).toLowerCase()
}

/**
 * Parse BigInt from hex string and return as string
 */
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
