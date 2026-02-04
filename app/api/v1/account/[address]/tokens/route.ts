/**
 * GET /api/v1/account/{address}/tokens
 * Returns ERC20 token balances for an address
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
import { GET_TOKEN_BALANCES } from '@/lib/graphql/queries/relay'
import type { TokenBalancesResponse, TokenInBalance } from '@/lib/api/types'

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
    const data = await queryIndexer<TokenBalancesResponse>(GET_TOKEN_BALANCES, {
      address,
    })

    // Filter for ERC20 tokens only
    const erc20Tokens = (data.tokenBalances || [])
      .filter((token) => token.tokenType.toUpperCase() === 'ERC20')
      .map((token): TokenInBalance => ({
        contractAddress: token.contractAddress,
        name: null,
        symbol: null,
        decimals: null,
        balance: token.balance,
        type: 'ERC20',
      }))

    const totalCount = erc20Tokens.length
    const paginatedTokens = erc20Tokens.slice(offset, offset + limit)

    return paginatedResponse(paginatedTokens, page, limit, totalCount)
  } catch (error) {
    console.error('Failed to fetch tokens:', error)

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
