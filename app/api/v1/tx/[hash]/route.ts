/**
 * GET /api/v1/tx/{hash}
 * Returns transaction information by hash
 */

import { NextRequest } from 'next/server'
import { queryIndexer } from '@/lib/api/relay'
import {
  successResponse,
  apiErrorResponse,
  handleCorsOptions,
} from '@/lib/api/response'
import { isValidTxHash } from '@/lib/utils/validation'
import {
  ApiError,
  InvalidHashError,
  IndexerConnectionError,
  NotFoundError,
} from '@/lib/api/errors'
import { FORMATTING } from '@/lib/config/constants'
import { errorLogger } from '@/lib/errors/logger'
import { GET_TRANSACTION } from '@/lib/graphql/queries/relay'
import type { TransactionResponse, TransactionData } from '@/lib/api/types'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return handleCorsOptions()
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params

  if (!isValidTxHash(hash)) {
    return apiErrorResponse(new InvalidHashError(hash))
  }

  try {
    const data = await queryIndexer<TransactionResponse>(GET_TRANSACTION, { hash })

    const tx = data.transaction

    if (!tx) {
      return apiErrorResponse(new NotFoundError('Transaction', hash))
    }

    const txData: TransactionData = {
      hash: tx.hash,
      blockNumber: parseInt(tx.blockNumber, 10),
      blockHash: tx.blockHash,
      timestamp: null,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      gas: tx.gas,
      gasPrice: tx.gasPrice,
      gasUsed: tx.receipt?.gasUsed || null,
      nonce: parseInt(tx.nonce, 10),
      transactionIndex: tx.transactionIndex,
      status: mapStatus(tx.receipt?.status),
      type: tx.type,
      input: tx.input,
      decodedInput: decodeInput(tx.input),
    }

    return successResponse(txData)
  } catch (error) {
    errorLogger.error(error, { component: 'api/v1/tx/[hash]', action: 'fetch-transaction' })

    if (error instanceof ApiError) {
      return apiErrorResponse(error)
    }

    return apiErrorResponse(
      new IndexerConnectionError(error instanceof Error ? error : undefined)
    )
  }
}

function mapStatus(status: number | undefined | null): 'success' | 'failed' | 'pending' {
  if (status === undefined || status === null) {
    return 'pending'
  }
  return status === 1 ? 'success' : 'failed'
}

function decodeInput(input: string): { method: string | null; params: unknown[] | null } {
  if (!input || input === '0x' || input.length < FORMATTING.METHOD_SELECTOR_HEX_LENGTH) {
    return { method: null, params: null }
  }
  return { method: input.slice(0, FORMATTING.METHOD_SELECTOR_HEX_LENGTH), params: null }
}
