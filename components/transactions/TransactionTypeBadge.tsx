'use client'

import { cn } from '@/lib/utils'
import { getTxTypeName, getTxTypeColor, isValidTxType } from '@/lib/constants/transactions'
import { FORMATTING } from '@/lib/config/constants'

interface TransactionTypeMeta {
  label: string
  badgeClass: string
}

const DEFAULT_META: TransactionTypeMeta = {
  label: 'Unknown',
  badgeClass: 'bg-bg-tertiary text-text-muted',
}

function formatHexType(type: number): string {
  return `0x${type.toString(FORMATTING.HEX_RADIX).padStart(2, '0')}`
}

export function getTransactionTypeMeta(type?: number | null) {
  if (type === null || type === undefined) {
    return { ...DEFAULT_META, hex: '0x??' }
  }

  // Use centralized transaction type utilities
  const meta: TransactionTypeMeta = isValidTxType(type)
    ? {
        label: getTxTypeName(type),
        badgeClass: getTxTypeColor(type),
      }
    : DEFAULT_META

  return {
    ...meta,
    hex: formatHexType(type),
  }
}

interface TransactionTypeBadgeProps {
  type?: number | null
  className?: string
}

export function TransactionTypeBadge({ type, className }: TransactionTypeBadgeProps) {
  const meta = getTransactionTypeMeta(type)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px]',
        meta.badgeClass,
        className,
      )}
    >
      <span>{meta.label}</span>
      <span className="text-[10px] text-current opacity-70">{meta.hex}</span>
    </span>
  )
}
