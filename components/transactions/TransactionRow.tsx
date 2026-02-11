'use client'

import Link from 'next/link'
import { formatHash, formatNumber, formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import { TransactionTypeBadge } from './TransactionTypeBadge'
import { AddressLink } from '@/components/common/AddressLink'
import { TableRow, TableCell } from '@/components/ui/Table'
import type { Transaction } from '@/types/graphql'

interface TransactionRowProps {
  tx: Transaction
  /** Current address for self-detection (optional) */
  currentAddress?: string | undefined
  /** Show status column */
  showStatus?: boolean | undefined
  /** Show age column */
  showAge?: boolean | undefined
  /** Map of lowercase address -> isContract */
  contractMap?: Map<string, boolean> | undefined
}

/**
 * Render address with self-detection and contract creation handling
 */
function AddressDisplay({
  address,
  currentAddress,
  contractAddress,
  isRecipient = false,
  isContract,
}: {
  address: string | null | undefined
  currentAddress?: string | undefined
  contractAddress?: string | null | undefined
  isRecipient?: boolean | undefined
  isContract?: boolean | undefined
}) {
  // Self transaction
  if (address && currentAddress && address.toLowerCase() === currentAddress.toLowerCase()) {
    return <span className="font-mono text-text-secondary">Self</span>
  }

  // Contract creation: to is null but contractAddress exists
  if (!address && isRecipient && contractAddress) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-xs text-accent-orange">[Created]</span>
        <AddressLink address={contractAddress} isContract={true} />
      </span>
    )
  }

  // Contract creation without address
  if (!address && isRecipient) {
    return <span className="font-mono text-xs text-text-muted">[Contract]</span>
  }

  // No address
  if (!address) {
    return <span className="font-mono text-xs text-text-muted">-</span>
  }

  // Normal address
  return <AddressLink address={address} isContract={isContract} />
}

/**
 * Transaction status badge
 */
function StatusBadge({ status }: { status?: number | undefined }) {
  if (status === 1) {
    return <span className="font-mono text-xs text-accent-green">SUCCESS</span>
  }
  if (status === 0) {
    return <span className="font-mono text-xs text-accent-orange">FAILED</span>
  }
  return <span className="font-mono text-xs text-text-muted">-</span>
}

/**
 * Shared transaction row component
 * Used in /txs page, address transactions, and block transactions
 */
export function TransactionRow({
  tx,
  currentAddress,
  showStatus = false,
  showAge = false,
  contractMap,
}: TransactionRowProps) {
  const value = BigInt(tx.value ?? '0')
  const isHighValue = value > BigInt('1000000000000000000') // > 1 ETH

  const fromIsContract = tx.from ? contractMap?.get(tx.from.toLowerCase()) : undefined
  const toIsContract = tx.to ? contractMap?.get(tx.to.toLowerCase()) : undefined

  return (
    <TableRow>
      {/* TX Hash */}
      <TableCell>
        <Link
          href={`/tx/${tx.hash}`}
          className="font-mono text-accent-blue hover:text-accent-cyan"
        >
          {formatHash(tx.hash)}
        </Link>
      </TableCell>

      {/* Block */}
      <TableCell>
        <Link
          href={`/block/${tx.blockNumber}`}
          className="font-mono text-accent-blue hover:text-accent-cyan"
        >
          {formatNumber(BigInt(tx.blockNumber ?? '0'))}
        </Link>
      </TableCell>

      {/* Age (optional) */}
      {showAge && (
        <TableCell className="font-mono text-xs text-text-secondary">
          -
        </TableCell>
      )}

      {/* From */}
      <TableCell>
        <AddressDisplay
          address={tx.from}
          currentAddress={currentAddress}
          isContract={fromIsContract}
        />
      </TableCell>

      {/* To */}
      <TableCell>
        <AddressDisplay
          address={tx.to}
          currentAddress={currentAddress}
          contractAddress={tx.contractAddress}
          isRecipient
          isContract={toIsContract}
        />
      </TableCell>

      {/* Value */}
      <TableCell className="text-right">
        <span
          className={`font-mono text-xs ${isHighValue ? 'font-bold text-accent-orange' : 'text-text-secondary'}`}
        >
          {formatCurrency(value, env.currencySymbol)}
        </span>
      </TableCell>

      {/* Type */}
      <TableCell>
        <TransactionTypeBadge type={tx.type} />
      </TableCell>

      {/* Status (optional) */}
      {showStatus && (
        <TableCell>
          <StatusBadge status={tx.receipt?.status} />
        </TableCell>
      )}
    </TableRow>
  )
}
