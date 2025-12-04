'use client'

import { useParams } from 'next/navigation'
import { useTransaction } from '@/lib/hooks/useTransaction'
import { useReceipt } from '@/lib/hooks/useReceipt'
import { TransactionDetailSkeleton } from '@/components/skeletons/TransactionDetailSkeleton'
import { NotFound } from '@/components/common/ErrorBoundary'
import {
  TxHeader,
  TxInfoCard,
  TxGasCard,
  TxDetailsCard,
  TxFeeDelegationCard,
  TxLogsCard,
  TxReceiptCard,
} from '@/components/transactions/TxDetailCards'
import { InternalCallsViewer } from '@/components/transactions/InternalCallsViewer'
import type { Log } from '@/types/graphql'
import { BLOCKCHAIN } from '@/lib/config/constants'

/**
 * Check if fee delegation info should be shown
 */
function shouldShowFeeDelegation(
  feePayer: string | null | undefined,
  feePayerSignatures: unknown[] | null | undefined,
  txType: number
): boolean {
  const isFeeDelegationType = txType === BLOCKCHAIN.SYSTEM_CONTRACT_TYPE
  const hasFeePayer = Boolean(feePayer)
  const hasSignatures = Boolean(feePayerSignatures && feePayerSignatures.length > 0)
  return hasFeePayer || hasSignatures || isFeeDelegationType
}

/**
 * Determine transaction status from available receipt data
 * Uses separate receipt query first, falls back to embedded receipt
 */
function determineTransactionStatus(
  receiptStatus: { isSuccess: boolean; isFailed: boolean; isPending: boolean },
  embeddedReceiptStatus: number | undefined
): 'Success' | 'Failed' | 'Pending' {
  // First priority: use status from separate receipt query
  if (!receiptStatus.isPending) {
    if (receiptStatus.isSuccess) { return 'Success' }
    if (receiptStatus.isFailed) { return 'Failed' }
  }

  // Fallback: use embedded receipt status from transaction query
  if (embeddedReceiptStatus !== undefined) {
    if (embeddedReceiptStatus === 1) { return 'Success' }
    if (embeddedReceiptStatus === 0) { return 'Failed' }
  }

  // No receipt available - transaction is pending
  return 'Pending'
}

export default function TransactionPage() {
  const params = useParams()
  const hash = params.hash as string

  const { transaction, loading: txLoading, error: txError } = useTransaction(hash)
  // Fetch receipt separately for more reliable status and detailed receipt info
  const { receipt, loading: receiptLoading, isSuccess, isFailed, isPending } = useReceipt(hash)

  const loading = txLoading || receiptLoading

  if (loading) {
    return <TransactionDetailSkeleton />
  }

  if (txError || !transaction) {
    return <NotFound message={`Transaction ${hash} not found`} />
  }

  // Determine status using both receipt sources for reliability
  const status = determineTransactionStatus(
    { isSuccess, isFailed, isPending },
    transaction.receipt?.status
  )
  const showFeeDelegation = shouldShowFeeDelegation(
    transaction.feePayer,
    transaction.feePayerSignatures,
    Number(transaction.type)
  )

  // Use logs from receipt query, fallback to embedded receipt logs
  const logs = receipt?.logs ?? transaction.receipt?.logs

  return (
    <div className="container mx-auto px-4 py-8">
      <TxHeader
        hash={transaction.hash}
        status={status}
        type={transaction.type}
      />

      <TxInfoCard tx={transaction} status={status} />
      <TxGasCard tx={transaction} receipt={receipt} />
      <TxDetailsCard tx={transaction} />

      {/* Receipt Card - shows detailed receipt information */}
      {receipt && <TxReceiptCard receipt={receipt} />}

      {/* Internal Calls - via debug_traceTransaction RPC */}
      <InternalCallsViewer txHash={hash} />

      {showFeeDelegation && (
        <TxFeeDelegationCard
          feePayer={transaction.feePayer}
          signatures={transaction.feePayerSignatures}
        />
      )}

      <TxLogsCard logs={logs as Log[]} />
    </div>
  )
}
