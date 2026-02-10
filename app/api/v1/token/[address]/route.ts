/**
 * GET /api/v1/token/{address}
 * Returns token information for a contract address
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
import { gql } from '@apollo/client'
import { GET_CONTRACT_VERIFICATION } from '@/lib/graphql/queries/relay'
import type { ContractVerificationResponse, TokenInfoData } from '@/lib/api/types'

// Query for token info - checks if address has token balances to determine if it's a token
const GET_TOKEN_INFO = gql`
  query GetTokenInfo($address: String!) {
    # Get logs to count transfers (Transfer events)
    logs(
      filter: { address: $address }
      pagination: { limit: 1 }
    ) {
      totalCount
    }
  }
`

interface TokenInfoResponse {
  logs: {
    totalCount: number
  }
}

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
    // Query token transfer count and contract verification in parallel
    const [logData, verificationData] = await queryIndexerParallel<
      [TokenInfoResponse, ContractVerificationResponse]
    >([
      { query: GET_TOKEN_INFO, variables: { address } },
      { query: GET_CONTRACT_VERIFICATION, variables: { address } },
    ])

    const transfersCount = logData.logs?.totalCount || 0
    const verification = verificationData.contractVerification

    const tokenInfo: TokenInfoData = {
      address: address.toLowerCase(),
      name: verification?.name ?? null,
      symbol: null,
      decimals: null,
      totalSupply: null,
      type: 'ERC20',
      holdersCount: null,
      transfersCount,
      verified: verification?.isVerified ?? false,
      logoUrl: null,
    }

    // If no activity found at all, return 404
    if (transfersCount === 0) {
      return apiErrorResponse(new NotFoundError('Token', address))
    }

    return successResponse(tokenInfo)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/token/[address]', action: 'fetch-token' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
