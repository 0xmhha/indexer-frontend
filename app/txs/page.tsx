'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTransactions } from '@/lib/hooks/useTransactions'
import { POLLING_INTERVALS } from '@/lib/config/constants'
import { usePagination } from '@/lib/hooks/usePagination'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { ExportButton } from '@/components/common/ExportButton'
import { ListPageSkeleton } from '@/components/skeletons/ListPageSkeleton'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatNumber, formatHash, formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import type { Transaction } from '@/types/graphql'
import { TransactionTypeBadge } from '@/components/transactions/TransactionTypeBadge'

function TransactionsListContent() {
  const searchParams = useSearchParams()
  const [orderBy, setOrderBy] = useState<'blockNumber' | 'value'>('blockNumber')
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc')

  // Get pagination params from URL
  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const currentPageFromURL = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPageFromURL = limitParam ? parseInt(limitParam, 10) : 20
  const offsetFromURL = (currentPageFromURL - 1) * itemsPerPageFromURL

  // Fetch transactions with URL params (use slower polling for list page)
  const { transactions, totalCount, loading, error } = useTransactions({
    limit: itemsPerPageFromURL,
    offset: offsetFromURL,
    pollInterval: POLLING_INTERVALS.NORMAL, // 30s refresh for paginated list
  })

  // Setup pagination with URL support
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    setPage,
    setItemsPerPage,
  } = usePagination({
    totalCount,
    defaultItemsPerPage: 20,
  })

  const handleSort = (field: 'blockNumber' | 'value') => {
    if (orderBy === field) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setOrderBy(field)
      setOrderDirection('desc')
    }
    setPage(1)
  }

  if (loading && transactions.length === 0) {
    return <ListPageSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay title="Failed to load transactions" message={error.message} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">TRANSACTIONS</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">ALL TRANSACTIONS</h1>
        <p className="font-mono text-xs text-text-secondary">
          Total: {formatNumber(totalCount)} transactions
        </p>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center justify-between">
            <span>TRANSACTIONS LIST</span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-text-secondary">
                Page {currentPage} of {totalPages}
              </span>
              <ExportButton
                data={transactions.map((tx) => ({
                  hash: tx.hash,
                  blockNumber: tx.blockNumber,
                  from: tx.from,
                  to: tx.to || '',
                  value: tx.value,
                  type: tx.type,
                }))}
                filename="transactions"
                headers={['hash', 'blockNumber', 'from', 'to', 'value', 'type']}
                disabled={loading}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-text-muted">No transactions found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TX HASH</TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('blockNumber')}
                        className="flex items-center gap-1 hover:text-accent-blue"
                      >
                        BLOCK
                        {orderBy === 'blockNumber' && (
                          <span className="text-accent-blue">
                            {orderDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>AGE</TableHead>
                    <TableHead>FROM</TableHead>
                    <TableHead>TO</TableHead>
                    <TableHead className="text-right">
                      <button
                        onClick={() => handleSort('value')}
                        className="flex items-center gap-1 hover:text-accent-blue"
                      >
                        VALUE
                        {orderBy === 'value' && (
                          <span className="text-accent-blue">
                            {orderDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>TYPE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx: Transaction) => {
                    const value = BigInt(tx.value)
                    const isHighValue = value > BigInt('1000000000000000000') // > 1 ETH

                    return (
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
                        <TableCell className="font-mono text-xs text-text-secondary">
                          {/* Timestamp not available in Transaction type */}
                          -
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/address/${tx.from}`}
                            className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
                          >
                            {formatHash(tx.from, true)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {tx.to ? (
                            <Link
                              href={`/address/${tx.to}`}
                              className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
                            >
                              {formatHash(tx.to, true)}
                            </Link>
                          ) : (
                            <span className="font-mono text-xs text-text-muted">[Contract]</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-mono text-xs ${isHighValue ? 'font-bold text-accent-orange' : 'text-text-secondary'}`}
                          >
                            {formatCurrency(value, env.currencySymbol)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <TransactionTypeBadge type={tx.type} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-bg-tertiary p-4">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPage}
                    onItemsPerPageChange={setItemsPerPage}
                    showItemsPerPage={true}
                    showResultsInfo={true}
                    showPageInput={false}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function TransactionsListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <TransactionsListContent />
    </Suspense>
  )
}
