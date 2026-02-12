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
import { BLOCKCHAIN } from '@/lib/config/constants'
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
    const nodes = data.tokenHolders?.nodes ?? []
    const totalBalance = nodes.reduce<bigint>((sum, node) => {
      try { return sum + BigInt(node.balance) } catch { return sum }
    }, BLOCKCHAIN.ZERO_BIGINT)
    const holders: TokenHolderItem[] = nodes.map((node) => {
      let percentage = 0
      if (totalBalance > BLOCKCHAIN.ZERO_BIGINT) {
        try {
          percentage = Number((BigInt(node.balance) * BLOCKCHAIN.PERCENTAGE_PRECISION) / totalBalance) / BLOCKCHAIN.PERCENTAGE_MULTIPLIER
        } catch { /* keep 0 */ }
      }
      return {
        address: node.holderAddress,
        balance: node.balance,
        percentage,
      }
    })

    return paginatedResponse(holders, page, limit, totalCount)
  } catch (err) {
    errorLogger.error(err, { component: 'token-holders-api', action: 'query' })
    return apiErrorResponse(new IndexerConnectionError())
  }
}
