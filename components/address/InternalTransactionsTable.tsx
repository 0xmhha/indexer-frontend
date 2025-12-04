'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useInternalTransactionsByAddress } from '@/lib/hooks/useAddressIndexing'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatCurrency, formatHash, formatNumber } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import { PAGINATION } from '@/lib/config/constants'
import type { InternalTransaction } from '@/types/address-indexing'

interface InternalTransactionsTableProps {
  address: string
  limit?: number
}

export function InternalTransactionsTable({ address, limit = PAGINATION.DEFAULT_PAGE_SIZE }: InternalTransactionsTableProps) {
  const [currentOffset, setCurrentOffset] = useState(0)

  // isFrom=true: get transactions FROM this address
  const { internalTransactions, totalCount, pageInfo, loading, error, loadMore } =
    useInternalTransactionsByAddress(address, true, { limit, offset: currentOffset })

  const handleLoadMore = () => {
    if (pageInfo.hasNextPage) {
      setCurrentOffset((prev) => prev + limit)
      loadMore?.()
    }
  }

  if (loading && internalTransactions.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorDisplay title="Failed to load internal transactions" message={error.message} />
      </div>
    )
  }

  if (internalTransactions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-text-muted">No internal transactions found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TX HASH</TableHead>
              <TableHead>TYPE</TableHead>
              <TableHead>FROM</TableHead>
              <TableHead>TO</TableHead>
              <TableHead className="text-right">VALUE</TableHead>
              <TableHead>BLOCK</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {internalTransactions.map((tx: InternalTransaction, index: number) => (
              <TableRow key={`${tx.transactionHash}-${index}`}>
                <TableCell>
                  <Link
                    href={`/tx/${tx.transactionHash}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {formatHash(tx.transactionHash)}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-text-secondary">{tx.type}</span>
                </TableCell>
                <TableCell>
                  {tx.from === address ? (
                    <span className="font-mono text-text-secondary">Self</span>
                  ) : (
                    <Link
                      href={`/address/${tx.from}`}
                      className="font-mono text-accent-blue hover:text-accent-cyan"
                    >
                      {formatHash(tx.from, true)}
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  {tx.to === null ? (
                    <span className="font-mono text-text-muted">[Contract Creation]</span>
                  ) : tx.to === address ? (
                    <span className="font-mono text-text-secondary">Self</span>
                  ) : (
                    <Link
                      href={`/address/${tx.to}`}
                      className="font-mono text-accent-blue hover:text-accent-cyan"
                    >
                      {formatHash(tx.to, true)}
                    </Link>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(tx.value, env.currencySymbol)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/block/${tx.blockNumber}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {formatNumber(tx.blockNumber)}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Load More Button */}
      {pageInfo.hasNextPage && (
        <div className="border-t border-bg-tertiary p-4 text-center">
          <Button onClick={handleLoadMore} disabled={loading} variant="outline">
            {loading ? (
              <>
                <LoadingSpinner className="mr-2" size="sm" />
                Loading...
              </>
            ) : (
              <>
                Load More ({formatNumber(totalCount - internalTransactions.length)} remaining)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Total Count */}
      <div className="border-t border-bg-tertiary p-4 text-center">
        <p className="font-mono text-xs text-text-secondary">
          Showing {formatNumber(internalTransactions.length)} of {formatNumber(totalCount)} internal
          transactions
        </p>
      </div>
    </div>
  )
}
