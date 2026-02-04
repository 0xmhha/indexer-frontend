/**
 * GET /api/v1/account/{address}
 * Returns account summary information
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
} from '@/lib/api/errors'
import {
  GET_ADDRESS_BALANCE,
  GET_CONTRACT_CREATION,
  GET_ACCOUNT_TX_COUNT,
} from '@/lib/graphql/queries/relay'
import type {
  AddressBalanceResponse,
  ContractCreationResponse,
  AccountSummaryData,
} from '@/lib/api/types'

interface TxCountResponse {
  transactionsByAddress: {
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

  if (!isValidAddress(address)) {
    return apiErrorResponse(new InvalidAddressError(address))
  }

  try {
    const [balanceData, contractData, txCountData] = await queryIndexerParallel<
      [AddressBalanceResponse, ContractCreationResponse, TxCountResponse]
    >([
      { query: GET_ADDRESS_BALANCE, variables: { address } },
      { query: GET_CONTRACT_CREATION, variables: { address } },
      { query: GET_ACCOUNT_TX_COUNT, variables: { address } },
    ])

    const isContract = contractData.contractCreation !== null

    const summary: AccountSummaryData = {
      address: address.toLowerCase(),
      balance: balanceData.addressBalance || '0',
      transactionCount: txCountData.transactionsByAddress?.totalCount || 0,
      isContract,
      firstSeen: null,
      lastSeen: null,
    }

    return successResponse(summary)
  } catch (error) {
    console.error('Failed to fetch account summary:', error)

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}
