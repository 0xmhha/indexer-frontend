'use client'

import { useParams } from 'next/navigation'
import { useTransaction } from '@/lib/hooks/useTransaction'
import { TransactionDetailSkeleton } from '@/components/skeletons/TransactionDetailSkeleton'
import { NotFound } from '@/components/common/ErrorBoundary'
import {
  TxHeader,
  TxInfoCard,
  TxGasCard,
  TxDetailsCard,
  TxFeeDelegationCard,
  TxLogsCard,
} from '@/components/transactions/TxDetailCards'
import type { Log } from '@/types/graphql'

/**
 * Determine transaction status from receipt
 */
function getTransactionStatus(receipt?: { status: string } | null): string {
  return receipt?.status === '1' ? 'Success' : 'Failed'
}

/**
 * Check if fee delegation info should be shown
 */
function shouldShowFeeDelegation(
  feePayer: string | null | undefined,
  feePayerSignatures: unknown[] | null | undefined,
  txType: number
): boolean {
  const isFeeDelegationType = txType === 0x16
  const hasFeePayer = Boolean(feePayer)
  const hasSignatures = Boolean(feePayerSignatures && feePayerSignatures.length > 0)
  return hasFeePayer || hasSignatures || isFeeDelegationType
}

export default function TransactionPage() {
  const params = useParams()
  const hash = params.hash as string

  const { transaction, loading, error } = useTransaction(hash)

  if (loading) {
    return <TransactionDetailSkeleton />
  }

  if (error || !transaction) {
    return <NotFound message={`Transaction ${hash} not found`} />
  }

  const status = getTransactionStatus(transaction.receipt)
  const showFeeDelegation = shouldShowFeeDelegation(
    transaction.feePayer,
    transaction.feePayerSignatures,
    Number(transaction.type)
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <TxHeader
        hash={transaction.hash}
        status={status}
        type={transaction.type}
      />

      <TxInfoCard tx={transaction} status={status} />
      <TxGasCard tx={transaction} />
      <TxDetailsCard tx={transaction} />

      {showFeeDelegation && (
        <TxFeeDelegationCard
          feePayer={transaction.feePayer}
          signatures={transaction.feePayerSignatures}
        />
      )}

      <TxLogsCard logs={transaction.receipt?.logs as Log[]} />
    </div>
  )
}
