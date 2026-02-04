/**
 * GET /api/v1/token/{address}
 * Returns token information for a contract address
 */

import { NextRequest } from 'next/server'
import { queryIndexer } from '@/lib/api/relay'
import {
  successResponse,
  apiErrorResponse,
  handleCorsOptions,
} from '@/lib/api/response'
import { isValidAddress } from '@/lib/utils/validation'
import {
  ApiError,
  InvalidAddressError,
  IndexerConnectionError,
  NotFoundError,
} from '@/lib/api/errors'
import { gql } from '@apollo/client'
import type { TokenInfoData } from '@/lib/api/types'

// Query for token info - checks if address has token balances to determine if it's a token
const GET_TOKEN_INFO = gql`
  query GetTokenInfo($address: String!) {
    # Get logs to count transfers (Transfer events)
    logs(
      filter: { address: $address }
      pagination: { limit: 1 }
    ) {
      totalCount
    }
  }
`

interface TokenInfoResponse {
  logs: {
    totalCount: number
  }
}

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return handleCorsOptions()
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  // Validate address format
  if (!isValidAddress(address)) {
    return apiErrorResponse(new InvalidAddressError(address))
  }

  try {
    // Query token transfer count
    const data = await queryIndexer<TokenInfoResponse>(GET_TOKEN_INFO, {
      address,
    })

    const transfersCount = data.logs?.totalCount || 0

    // If no transfers found, this might not be a token contract
    // We still return info but with limited data
    const tokenInfo: TokenInfoData = {
      address: address.toLowerCase(),
      name: null, // Token metadata not available from indexer
      symbol: null,
      decimals: null,
      totalSupply: null,
      type: 'ERC20', // Default to ERC20, could be detected from events
      holdersCount: null,
      transfersCount,
      verified: false, // Would need contract verification check
      logoUrl: null,
    }

    // If no activity found at all, return 404
    if (transfersCount === 0) {
      return apiErrorResponse(new NotFoundError('Token', address))
    }

    return successResponse(tokenInfo)
  } catch (error) {
    console.error('Failed to fetch token info:', error)

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
