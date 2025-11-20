'use client'

import { cn } from '@/lib/utils'

interface TransactionTypeMeta {
  label: string
  badgeClass: string
}

const TYPE_META: Record<number, TransactionTypeMeta> = {
  0: { label: 'Legacy', badgeClass: 'bg-bg-tertiary text-text-secondary' },
  1: { label: 'Access List', badgeClass: 'bg-accent-blue/10 text-accent-blue' },
  2: { label: 'EIP-1559', badgeClass: 'bg-accent-cyan/10 text-accent-cyan' },
  3: { label: 'Blob', badgeClass: 'bg-accent-orange/10 text-accent-orange' },
  22: { label: 'Fee Delegation', badgeClass: 'bg-accent-cyan/10 text-accent-cyan' },
}

const DEFAULT_META: TransactionTypeMeta = {
  label: 'Unknown',
  badgeClass: 'bg-bg-tertiary text-text-muted',
}

function formatHexType(type: number): string {
  return `0x${type.toString(16).padStart(2, '0')}`
}

export function getTransactionTypeMeta(type?: number | null) {
  if (type === null || type === undefined) {
    return { ...DEFAULT_META, hex: '0x??' }
  }

  const meta = TYPE_META[type] ?? DEFAULT_META
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
