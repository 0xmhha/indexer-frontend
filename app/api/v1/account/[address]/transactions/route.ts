/**
 * GET /api/v1/account/{address}/transactions
 * Returns transaction history for an address with pagination
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
import { FORMATTING } from '@/lib/config/constants'
import { GET_TRANSACTIONS_BY_ADDRESS, GET_BLOCK_TIMESTAMP } from '@/lib/graphql/queries/relay'
import type { TransactionsResponse, TransactionInList } from '@/lib/api/types'

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

  // Parse filter parameter
  const filterParam = request.nextUrl.searchParams.get('filter') || 'all'

  try {
    // Query transactions
    const data = await queryIndexer<TransactionsResponse>(
      GET_TRANSACTIONS_BY_ADDRESS,
      {
        address,
        limit,
        offset,
      }
    )

    const { nodes, totalCount } = data.transactionsByAddress

    // Batch-fetch block timestamps for unique block numbers
    const uniqueBlocks = [...new Set(nodes.map((tx) => tx.blockNumber))]
    const timestampMap = new Map<string, string>()
    const blockResults = await Promise.all(
      uniqueBlocks.map((num) =>
        queryIndexer<{ block: { number: string; timestamp: string } | null }>(
          GET_BLOCK_TIMESTAMP,
          { number: num }
        ).catch(() => null)
      )
    )
    blockResults.forEach((result) => {
      if (result?.block) {
        timestampMap.set(result.block.number, result.block.timestamp)
      }
    })

    // Transform to API format and apply filter
    const transactions: TransactionInList[] = nodes
      .map((tx) => ({
        hash: tx.hash,
        blockNumber: parseInt(tx.blockNumber, 10),
        timestamp: timestampMap.get(tx.blockNumber) ?? null,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gasUsed: tx.receipt?.gasUsed || null,
        gasPrice: tx.gasPrice,
        status: mapTransactionStatus(tx.receipt?.status),
        type: tx.type,
        method: extractMethod(tx.input),
      }))
      .filter((tx) => {
        const addressLower = address.toLowerCase()
        switch (filterParam) {
          case 'in':
            return tx.to?.toLowerCase() === addressLower
          case 'out':
            return tx.from.toLowerCase() === addressLower
          case 'self':
            return (
              tx.from.toLowerCase() === addressLower &&
              tx.to?.toLowerCase() === addressLower
            )
          default:
            return true
        }
      })

    return paginatedResponse(transactions, page, limit, totalCount)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/account/[address]/transactions', action: 'fetch-transactions' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}

/**
 * Map receipt status to transaction status string
 */
function mapTransactionStatus(
  status: number | null | undefined
): 'success' | 'failed' | 'pending' {
  if (status === undefined || status === null) {
    return 'pending'
  }
  return status === 1 ? 'success' : 'failed'
}

/**
 * Extract method signature from input data
 * Returns first 10 characters (4 bytes) of input or null
 */
function extractMethod(input: string): string | null {
  if (!input || input === '0x' || input.length < FORMATTING.METHOD_SELECTOR_HEX_LENGTH) {
    return null
  }
  return input.slice(0, FORMATTING.METHOD_SELECTOR_HEX_LENGTH)
}
