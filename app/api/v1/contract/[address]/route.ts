/**
 * GET /api/v1/contract/{address}
 * Returns contract information including verification status
 */

import { NextRequest } from 'next/server'
import { queryIndexerParallel } from '@/lib/api/relay'
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
import {
  GET_CONTRACT_CREATION,
  GET_CONTRACT_VERIFICATION,
} from '@/lib/graphql/queries/relay'
import type {
  ContractCreationResponse,
  ContractVerificationResponse,
  ContractInfoData,
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
    // Query contract creation and verification info in parallel
    const [creationData, verificationData] = await queryIndexerParallel<
      [ContractCreationResponse, ContractVerificationResponse]
    >([
      { query: GET_CONTRACT_CREATION, variables: { address } },
      { query: GET_CONTRACT_VERIFICATION, variables: { address } },
    ])

    const creation = creationData.contractCreation
    const verification = verificationData.contractVerification

    // If no creation data found, this is not a contract
    if (!creation) {
      return apiErrorResponse(new NotFoundError('Contract', address))
    }

    const contractInfo: ContractInfoData = {
      address: address.toLowerCase(),
      creator: creation.creator || null,
      creationTxHash: creation.transactionHash || null,
      createdAt: creation.timestamp || null,
      verified: verification?.isVerified || false,
      name: verification?.name || null,
      compilerVersion: verification?.compilerVersion || null,
      optimizationEnabled: verification?.optimizationEnabled ?? null,
      optimizationRuns: verification?.optimizationRuns ?? null,
      evmVersion: verification?.evmVersion || null,
      licenseType: verification?.licenseType || null,
    }

    return successResponse(contractInfo)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/contract/[address]', action: 'fetch-contract' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
