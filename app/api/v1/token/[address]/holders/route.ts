/**
 * GET /api/v1/token/{address}/holders
 * Returns token holder list from backend tokenHolders query
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
  InvalidAddressError,
  IndexerConnectionError,
} from '@/lib/api/errors'
import { errorLogger } from '@/lib/errors/logger'
import { GET_TOKEN_HOLDERS } from '@/lib/graphql/queries/relay'
import type { TokenHolderItem } from '@/lib/api/types'

export const dynamic = 'force-dynamic'

interface TokenHolderNode {
  holderAddress: string
  balance: string
}

interface TokenHoldersResponse {
  tokenHolders: {
    nodes: TokenHolderNode[]
    totalCount: number
  }
}

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

  const { page, limit } = parsePaginationParams(request.nextUrl.searchParams)
  const offset = (page - 1) * limit

  try {
    const data = await queryIndexer<TokenHoldersResponse>(
      GET_TOKEN_HOLDERS,
      { token: address, limit, offset }
    )

    const totalCount = data.tokenHolders?.totalCount ?? 0
    const holders: TokenHolderItem[] = (data.tokenHolders?.nodes ?? []).map((node) => ({
      address: node.holderAddress,
      balance: node.balance,
      percentage: totalCount > 0 ? 0 : 0, // Backend doesn't provide percentage
    }))

    return paginatedResponse(holders, page, limit, totalCount)
  } catch (err) {
    errorLogger.error(err, { component: 'token-holders-api', action: 'query' })
    return apiErrorResponse(new IndexerConnectionError())
  }
}
