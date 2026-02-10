/**
 * GET /api/v1/account/{address}/balances
 * Returns native balance and all token balances for an address
 */

import { NextRequest } from 'next/server'
import { queryIndexer, queryIndexerParallel } from '@/lib/api/relay'
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
} from '@/lib/api/errors'
import { errorLogger } from '@/lib/errors/logger'
import {
  GET_ADDRESS_BALANCE,
  GET_TOKEN_BALANCES,
  GET_CONTRACT_VERIFICATION,
} from '@/lib/graphql/queries/relay'
import { env } from '@/lib/config/env'
import type {
  AddressBalanceResponse,
  TokenBalancesResponse,
  AccountBalancesData,
  TokenInBalance,
} from '@/lib/api/types'

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

  try {
    // Query native balance and token balances in parallel
    const [nativeData, tokenData] = await queryIndexerParallel<
      [AddressBalanceResponse, TokenBalancesResponse]
    >([
      { query: GET_ADDRESS_BALANCE, variables: { address } },
      { query: GET_TOKEN_BALANCES, variables: { address } },
    ])

    // Batch-fetch contract verification for token metadata
    const rawTokens = tokenData.tokenBalances || []
    const uniqueAddresses = [...new Set(rawTokens.map((t) => t.contractAddress))]
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

    // Transform token balances to API format
    const tokens: TokenInBalance[] = rawTokens.map((token) => {
      const meta = verificationMap.get(token.contractAddress.toLowerCase())
      return {
        contractAddress: token.contractAddress,
        name: meta?.name ?? null,
        symbol: null,
        decimals: null,
        balance: token.balance,
        type: mapTokenType(token.tokenType),
      }
    })

    // Filter out zero balances unless include_zero is true
    const includeZero = request.nextUrl.searchParams.get('include_zero') === 'true'
    const filteredTokens = includeZero
      ? tokens
      : tokens.filter((t) => t.balance !== '0')

    const data: AccountBalancesData = {
      address: address.toLowerCase(),
      native: {
        balance: nativeData.addressBalance || '0',
        symbol: env.currencySymbol,
        decimals: 18,
      },
      tokens: filteredTokens,
    }

    return successResponse(data)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/account/[address]/balances', action: 'fetch-balances' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}

/**
 * Map GraphQL token type to API token type
 */
function mapTokenType(tokenType: string): 'ERC20' | 'ERC721' | 'ERC1155' {
  switch (tokenType.toUpperCase()) {
    case 'ERC721':
      return 'ERC721'
    case 'ERC1155':
      return 'ERC1155'
    default:
      return 'ERC20'
  }
}
