/**
 * GET /api/v1/account/{address}/nfts
 * Returns NFT holdings for an address with pagination
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
import { GET_TOKEN_BALANCES } from '@/lib/graphql/queries/relay'
import type { TokenBalancesResponse, NftItem } from '@/lib/api/types'

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

  // Parse type filter
  const typeFilter = request.nextUrl.searchParams.get('type')?.toUpperCase()

  try {
    // Query token balances (includes NFTs)
    const data = await queryIndexer<TokenBalancesResponse>(GET_TOKEN_BALANCES, {
      address,
    })

    // Filter for NFT types only (ERC721, ERC1155)
    const nftBalances = (data.tokenBalances || []).filter((token) => {
      const tokenType = token.tokenType.toUpperCase()
      const isNft = tokenType === 'ERC721' || tokenType === 'ERC1155'

      // Apply type filter if specified
      if (typeFilter && typeFilter !== tokenType) {
        return false
      }

      return isNft
    })

    // Transform to NFT items
    const allNfts: NftItem[] = nftBalances.map((token) => ({
      contractAddress: token.contractAddress,
      name: null, // Would need contract metadata lookup
      symbol: null,
      tokenId: token.tokenId || '0',
      type: token.tokenType.toUpperCase() as 'ERC721' | 'ERC1155',
      balance: token.balance,
      tokenUri: null, // Would need contract call
      metadata: null,
    }))

    // Apply pagination
    const totalCount = allNfts.length
    const paginatedNfts = allNfts.slice(offset, offset + limit)

    return paginatedResponse(paginatedNfts, page, limit, totalCount)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/account/[address]/nfts', action: 'fetch-nfts' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
