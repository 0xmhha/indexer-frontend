/**
 * GET /api/v1/account/{address}/tokens
 * Returns ERC20 token balances for an address
 */

import { NextRequest } from 'next/server'
import { queryIndexer } from '@/lib/api/relay'
import { GET_CONTRACT_VERIFICATION } from '@/lib/graphql/queries/relay'
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
    const rawErc20 = (data.tokenBalances || [])
      .filter((token) => token.tokenType.toUpperCase() === 'ERC20')

    // Batch-fetch contract verification for token names
    const uniqueAddresses = [...new Set(rawErc20.map((t) => t.contractAddress))]
    const verificationMap = new Map<string, { name: string | null }>()
    const verResults = await Promise.all(
      uniqueAddresses.map((addr) =>
        queryIndexer<{ contractVerification: { address: string; name: string | null } | null }>(
          GET_CONTRACT_VERIFICATION,
          { address: addr }
        ).catch(() => null)
      )
    )
    verResults.forEach((result) => {
      if (result?.contractVerification) {
        verificationMap.set(
          result.contractVerification.address.toLowerCase(),
          { name: result.contractVerification.name }
        )
      }
    })

    const erc20Tokens = rawErc20.map((token): TokenInBalance => {
      const meta = verificationMap.get(token.contractAddress.toLowerCase())
      return {
        contractAddress: token.contractAddress,
        name: meta?.name ?? null,
        symbol: null,
        decimals: null,
        balance: token.balance,
        type: 'ERC20',
      }
    })

    const totalCount = erc20Tokens.length
    const paginatedTokens = erc20Tokens.slice(offset, offset + limit)

    return paginatedResponse(paginatedTokens, page, limit, totalCount)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/account/[address]/tokens', action: 'fetch-tokens' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
