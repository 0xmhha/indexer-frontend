/**
 * GET /api/v1/validators
 * Returns list of validators
 */

import { NextRequest } from 'next/server'
import { queryIndexer } from '@/lib/api/relay'
import {
  paginatedResponse,
  apiErrorResponse,
  handleCorsOptions,
  parsePaginationParams,
} from '@/lib/api/response'
import {
  ApiError,
  IndexerConnectionError,
} from '@/lib/api/errors'
import { errorLogger } from '@/lib/errors/logger'
import { GET_ACTIVE_VALIDATORS } from '@/lib/graphql/queries/relay'
import type { ActiveValidatorsResponse, ValidatorItem } from '@/lib/api/types'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return handleCorsOptions()
}

export async function GET(request: NextRequest) {
  // Parse pagination parameters
  const { page, limit, offset } = parsePaginationParams(request.nextUrl.searchParams)

  // Parse filter parameters
  const statusFilter = request.nextUrl.searchParams.get('status') // 'active', 'inactive', 'all'

  try {
    // Query validators
    const data = await queryIndexer<ActiveValidatorsResponse>(GET_ACTIVE_VALIDATORS)

    // Transform to validator items
    let validators: ValidatorItem[] = (data.activeValidators || []).map((v) => ({
      address: v.address,
      isActive: v.isActive,
      name: null, // Would need additional data source
      commission: null,
      totalStaked: null,
      delegatorsCount: null,
    }))

    // Apply status filter
    if (statusFilter === 'active') {
      validators = validators.filter((v) => v.isActive)
    } else if (statusFilter === 'inactive') {
      validators = validators.filter((v) => !v.isActive)
    }

    // Apply pagination
    const totalCount = validators.length
    const paginatedValidators = validators.slice(offset, offset + limit)

    return paginatedResponse(paginatedValidators, page, limit, totalCount)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/validators', action: 'fetch-validators' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
