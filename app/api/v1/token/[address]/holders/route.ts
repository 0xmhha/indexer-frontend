/**
 * GET /api/v1/token/{address}/holders
 * Returns token holder list
 *
 * Note: This endpoint requires a dedicated tokenHolders query from the indexer.
 * Currently returns empty list as placeholder until backend implements this query.
 */

import { NextRequest } from 'next/server'
import {
  paginatedResponse,
  apiErrorResponse,
  handleCorsOptions,
  parsePaginationParams,
} from '@/lib/api/response'
import { isValidAddress } from '@/lib/utils/validation'
import {
  InvalidAddressError,
} from '@/lib/api/errors'
import type { TokenHolderItem } from '@/lib/api/types'

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

  const { page, limit } = parsePaginationParams(request.nextUrl.searchParams)

  // Note: Token holders query not available in current GraphQL schema
  // This would require a dedicated tokenHolders(tokenAddress) query
  const holders: TokenHolderItem[] = []
  const totalCount = 0

  return paginatedResponse(holders, page, limit, totalCount)
}
