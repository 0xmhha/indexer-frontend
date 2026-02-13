'use client'

import Link from 'next/link'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { AddressLink } from '@/components/common/AddressLink'
import { TransactionTypeBadge } from '@/components/transactions/TransactionTypeBadge'
import { formatHash, formatCurrency, formatNumber } from '@/lib/utils/format'
import { weiToGwei } from '@/lib/utils/gas'
import { env } from '@/lib/config/env'
import type { Transaction } from '@/types/graphql'

interface PendingTxTableProps {
  transactions: Transaction[]
  maxTransactions: number
}

/**
 * Nullable address cell — delegates to shared AddressLink for valid addresses
 */
function AddressCell({ address, isTo = false }: { address: string | null | undefined; isTo?: boolean }) {
  if (!address && isTo) {
    return <span className="font-mono text-text-muted">[Contract]</span>
  }
  if (!address) {
    return <span className="font-mono text-text-muted">-</span>
  }
  return <AddressLink address={address} />
}

/**
 * Gas price display
 */
function GasPriceCell({ gasPrice, maxFeePerGas }: { gasPrice: bigint | null; maxFeePerGas: bigint | null }) {
  const price = gasPrice || maxFeePerGas
  if (!price) {return <span className="text-text-muted">N/A</span>}
  return <>{weiToGwei(price).toFixed(2)} Gwei</>
}

/**
 * Pending transactions table (SRP: Only renders table rows)
 */
export function PendingTxTable({ transactions, maxTransactions }: PendingTxTableProps) {
  return (
    <div className="max-h-[600px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>TX HASH</TableHead>
            <TableHead>FROM</TableHead>
            <TableHead>TO</TableHead>
            <TableHead className="text-right">VALUE</TableHead>
            <TableHead>TYPE</TableHead>
            <TableHead className="text-right">GAS PRICE</TableHead>
            <TableHead className="text-right">NONCE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.slice(0, maxTransactions).map((tx) => (
            <TableRow key={`${tx.hash}-${tx.nonce}`} className="animate-fade-in">
              <TableCell>
                <Link
                  href={`/tx/${tx.hash}`}
                  className="font-mono text-accent-blue hover:text-accent-cyan"
                >
                  {formatHash(tx.hash)}
                </Link>
              </TableCell>
              <TableCell>
                <AddressCell address={tx.from} />
              </TableCell>
              <TableCell>
                <AddressCell address={tx.to} isTo />
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(tx.value, env.currencySymbol)}
              </TableCell>
              <TableCell>
                <TransactionTypeBadge type={tx.type} />
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-text-secondary">
                <GasPriceCell gasPrice={tx.gasPrice} maxFeePerGas={tx.maxFeePerGas} />
              </TableCell>
              <TableCell className="text-right font-mono">{formatNumber(tx.nonce)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
