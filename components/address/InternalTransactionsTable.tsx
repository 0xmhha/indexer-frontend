'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useInternalTransactionsByAddress } from '@/lib/hooks/useAddressIndexing'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
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

  // Query transactions FROM this address
  const {
    internalTransactions: fromTransactions,
    totalCount: fromTotalCount,
    pageInfo: fromPageInfo,
    loading: fromLoading,
    error: fromError,
    loadMore: loadMoreFrom,
  } = useInternalTransactionsByAddress(address, true, { limit, offset: currentOffset })

  // Query transactions TO this address
  const {
    internalTransactions: toTransactions,
    totalCount: toTotalCount,
    pageInfo: toPageInfo,
    loading: toLoading,
    error: toError,
    loadMore: loadMoreTo,
  } = useInternalTransactionsByAddress(address, false, { limit, offset: currentOffset })

  // Merge and deduplicate transactions from both directions
  const internalTransactions = useMemo(() => {
    const seen = new Set<string>()
    const merged: InternalTransaction[] = []

    // Add FROM transactions
    for (const tx of fromTransactions) {
      const key = `${tx.transactionHash}-${tx.from}-${tx.to}-${tx.value.toString()}`
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(tx)
      }
    }

    // Add TO transactions (avoiding duplicates)
    for (const tx of toTransactions) {
      const key = `${tx.transactionHash}-${tx.from}-${tx.to}-${tx.value.toString()}`
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(tx)
      }
    }

    // Sort by block number descending
    return merged.sort((a, b) => Number(b.blockNumber - a.blockNumber))
  }, [fromTransactions, toTransactions])

  const totalCount = fromTotalCount + toTotalCount
  const loading = fromLoading || toLoading
  const error = fromError || toError
  const pageInfo = {
    hasNextPage: fromPageInfo.hasNextPage || toPageInfo.hasNextPage,
    hasPreviousPage: fromPageInfo.hasPreviousPage || toPageInfo.hasPreviousPage,
  }

  const loadMore = () => {
    if (fromPageInfo.hasNextPage) loadMoreFrom?.()
    if (toPageInfo.hasNextPage) loadMoreTo?.()
  }

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
                  ) : tx.type.startsWith('CREATE') ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-accent-orange">[Created]</span>
                      <Link
                        href={`/address/${tx.to}`}
                        className="font-mono text-accent-blue hover:text-accent-cyan"
                      >
                        {formatHash(tx.to, true)}
                      </Link>
                    </span>
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
