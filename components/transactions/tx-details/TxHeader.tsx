'use client'

import { TransactionTypeBadge } from '@/components/transactions/TransactionTypeBadge'
import { CopyButton } from '@/components/common/CopyButton'

function StatusBadge({ status }: { status: string }) {
  const isSuccess = status === 'Success'
  const isPending = status === 'Pending'

  const getBgColor = () => {
    if (isSuccess) { return 'bg-success' }
    if (isPending) { return 'bg-warning animate-pulse' }
    return 'bg-error'
  }

  const getTextColor = () => {
    if (isSuccess) { return 'text-success' }
    if (isPending) { return 'text-warning' }
    return 'text-error'
  }

  return (
    <div className="inline-flex items-center gap-2 rounded border px-3 py-1">
      <div className={`h-2 w-2 rounded-full ${getBgColor()}`} />
      <span className={`font-mono text-xs ${getTextColor()}`}>
        {status.toUpperCase()}
      </span>
    </div>
  )
}

export function TxHeader({
  hash,
  status,
  type,
}: {
  hash: string
  status: string
  type: number
}) {
  return (
    <div className="mb-8">
      <div className="annotation mb-2">TRANSACTION DETAILS</div>
      <div className="mb-4 flex items-center gap-2">
        <h1 className="break-all font-mono text-xl font-bold text-accent-blue">{hash}</h1>
        <CopyButton text={hash} size="md" />
      </div>
      <div className="flex flex-wrap gap-3">
        <StatusBadge status={status} />
        <TransactionTypeBadge type={type} />
      </div>
    </div>
  )
}
