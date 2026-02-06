/**
 * GET /api/v1/contract/{address}/source
 * Returns contract source code if verified
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
import { errorLogger } from '@/lib/errors/logger'
import { GET_CONTRACT_VERIFICATION } from '@/lib/graphql/queries/relay'
import type {
  ContractVerificationResponse,
  ContractSourceData,
} from '@/lib/api/types'

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
    // Query contract verification info
    const data = await queryIndexer<ContractVerificationResponse>(
      GET_CONTRACT_VERIFICATION,
      { address }
    )

    const verification = data.contractVerification

    // If no verification data found
    if (!verification) {
      return apiErrorResponse(new NotFoundError('Contract', address))
    }

    // Parse ABI if available
    let parsedAbi: unknown[] | null = null
    if (verification.abi) {
      try {
        parsedAbi = JSON.parse(verification.abi)
      } catch {
        parsedAbi = null
      }
    }

    const sourceData: ContractSourceData = {
      address: address.toLowerCase(),
      verified: verification.isVerified,
      name: verification.name || null,
      sourceCode: verification.sourceCode || null,
      abi: parsedAbi,
      compilerVersion: verification.compilerVersion || null,
      constructorArguments: verification.constructorArguments || null,
    }

    return successResponse(sourceData)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/contract/[address]/source', action: 'fetch-source' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
