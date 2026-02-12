'use client'

import { useMemo } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from '@/components/ui/Table'
import { TransactionRow } from './TransactionRow'
import { useContractDetection } from '@/lib/hooks/useContractDetection'
import type { Transaction } from '@/types/graphql'

interface TransactionTableProps {
  transactions: Transaction[]
  /** Current address for self-detection (optional) */
  currentAddress?: string | undefined
  /** Show status column */
  showStatus?: boolean | undefined
  /** Show age column */
  showAge?: boolean | undefined
  /** Column click handler for sorting */
  onSortColumn?: ((column: 'blockNumber' | 'value') => void) | undefined
  /** Current sort column */
  sortColumn?: 'blockNumber' | 'value' | undefined
  /** Sort direction */
  sortDirection?: 'asc' | 'desc' | undefined
}

/**
 * Sortable column header
 */
function SortableHeader({
  label,
  column,
  onSort,
  currentSort,
  currentDirection,
  align = 'left',
}: {
  label: string
  column: 'blockNumber' | 'value'
  onSort?: ((column: 'blockNumber' | 'value') => void) | undefined
  currentSort?: 'blockNumber' | 'value' | undefined
  currentDirection?: 'asc' | 'desc' | undefined
  align?: 'left' | 'right' | undefined
}) {
  if (!onSort) {
    return <span>{label}</span>
  }

  return (
    <button
      onClick={() => onSort(column)}
      className={`flex items-center gap-1 hover:text-accent-blue ${align === 'right' ? 'ml-auto' : ''}`}
    >
      {label}
      {currentSort === column && (
        <span className="text-accent-blue">
          {currentDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  )
}

/**
 * Shared transaction table component
 * Used in /txs page, address transactions, and block transactions
 */
export function TransactionTable({
  transactions,
  currentAddress,
  showStatus = false,
  showAge = false,
  onSortColumn,
  sortColumn,
  sortDirection,
}: TransactionTableProps) {
  // Collect unique addresses from all transactions for batch contract detection
  const allAddresses = useMemo(() => {
    const set = new Set<string>()
    for (const tx of transactions) {
      if (tx.from) {set.add(tx.from)}
      if (tx.to) {set.add(tx.to)}
    }
    return [...set]
  }, [transactions])

  const contractMap = useContractDetection(allAddresses)

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-text-muted">No transactions found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>TX HASH</TableHead>
          <TableHead>
            <SortableHeader
              label="BLOCK"
              column="blockNumber"
              onSort={onSortColumn}
              currentSort={sortColumn}
              currentDirection={sortDirection}
            />
          </TableHead>
          {showAge && <TableHead>AGE</TableHead>}
          <TableHead>FROM</TableHead>
          <TableHead>TO</TableHead>
          <TableHead className="text-right">
            <SortableHeader
              label="VALUE"
              column="value"
              onSort={onSortColumn}
              currentSort={sortColumn}
              currentDirection={sortDirection}
              align="right"
            />
          </TableHead>
          <TableHead>TYPE</TableHead>
          {showStatus && <TableHead>STATUS</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TransactionRow
            key={tx.hash}
            tx={tx}
            currentAddress={currentAddress}
            showStatus={showStatus}
            showAge={showAge}
            contractMap={contractMap}
          />
        ))}
      </TableBody>
    </Table>
  )
}
