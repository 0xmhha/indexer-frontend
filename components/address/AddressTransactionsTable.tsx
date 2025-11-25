'use client'

import Link from 'next/link'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { TransactionTypeBadge } from '@/components/transactions/TransactionTypeBadge'
import { formatCurrency, formatHash, formatNumber } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import type { Transaction } from '@/types/graphql'

interface AddressTransactionsTableProps {
  transactions: Transaction[]
  address: string
  showStatus?: boolean
}

/**
 * Render address cell with self-detection
 */
function AddressCell({
  txAddress,
  currentAddress,
  isRecipient = false,
}: {
  txAddress: string | null | undefined
  currentAddress: string
  isRecipient?: boolean
}) {
  if (txAddress === currentAddress) {
    return <span className="font-mono text-text-secondary">Self</span>
  }

  if (!txAddress && isRecipient) {
    return <span className="font-mono text-text-muted">[Contract]</span>
  }

  if (!txAddress) {
    return <span className="font-mono text-text-muted">-</span>
  }

  return (
    <Link
      href={`/address/${txAddress}`}
      className="font-mono text-accent-blue hover:text-accent-cyan"
    >
      {formatHash(txAddress, true)}
    </Link>
  )
}

/**
 * Render transaction status badge
 */
function StatusCell({ status }: { status: number | undefined }) {
  if (status === 1) {
    return <span className="font-mono text-xs text-accent-green">SUCCESS</span>
  }
  if (status === 0) {
    return <span className="font-mono text-xs text-accent-orange">FAILED</span>
  }
  return <span className="font-mono text-xs text-text-muted">-</span>
}

/**
 * Address transactions table component (SRP: Only renders transaction rows)
 */
export function AddressTransactionsTable({
  transactions,
  address,
  showStatus = false,
}: AddressTransactionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>TX HASH</TableHead>
          <TableHead>BLOCK</TableHead>
          <TableHead>FROM</TableHead>
          <TableHead>TO</TableHead>
          <TableHead className="text-right">VALUE</TableHead>
          <TableHead>TYPE</TableHead>
          {showStatus && <TableHead>STATUS</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.hash}>
            <TableCell>
              <Link
                href={`/tx/${tx.hash}`}
                className="font-mono text-accent-blue hover:text-accent-cyan"
              >
                {formatHash(tx.hash)}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                href={`/block/${tx.blockNumber}`}
                className="font-mono text-accent-blue hover:text-accent-cyan"
              >
                {formatNumber(BigInt(tx.blockNumber))}
              </Link>
            </TableCell>
            <TableCell>
              <AddressCell txAddress={tx.from} currentAddress={address} />
            </TableCell>
            <TableCell>
              <AddressCell txAddress={tx.to} currentAddress={address} isRecipient />
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(BigInt(tx.value), env.currencySymbol)}
            </TableCell>
            <TableCell>
              <TransactionTypeBadge type={tx.type} />
            </TableCell>
            {showStatus && (
              <TableCell>
                <StatusCell status={tx.receipt?.status} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
