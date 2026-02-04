/**
 * GET /api/v1/contract/{address}/abi
 * Returns contract ABI if verified
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
import { GET_CONTRACT_VERIFICATION } from '@/lib/graphql/queries/relay'
import type {
  ContractVerificationResponse,
  ContractAbiData,
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
        // If ABI is not valid JSON, return as-is wrapped in array
        parsedAbi = null
      }
    }

    const abiData: ContractAbiData = {
      address: address.toLowerCase(),
      verified: verification.isVerified,
      abi: parsedAbi,
    }

    return successResponse(abiData)
  } catch (error) {
    console.error('Failed to fetch contract ABI:', error)

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
