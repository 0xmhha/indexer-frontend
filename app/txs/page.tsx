'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTransactionsWithSubscription } from '@/lib/hooks/useTransactionsWithSubscription'
import { usePagination } from '@/lib/hooks/usePagination'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { ExportButton } from '@/components/common/ExportButton'
import { ListPageSkeleton } from '@/components/skeletons/ListPageSkeleton'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import { formatNumber } from '@/lib/utils/format'
import { PAGINATION } from '@/lib/config/constants'

function TransactionsListContent() {
  const searchParams = useSearchParams()
  const [orderBy, setOrderBy] = useState<'blockNumber' | 'value'>('blockNumber')
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc')

  // Get pagination params from URL
  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const currentPageFromURL = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPageFromURL = limitParam ? parseInt(limitParam, 10) : PAGINATION.DEFAULT_PAGE_SIZE
  const offsetFromURL = (currentPageFromURL - 1) * itemsPerPageFromURL

  // Fetch transactions with WebSocket subscription for real-time updates
  const isFirstPage = currentPageFromURL === 1
  const { transactions, totalCount, loading, error } = useTransactionsWithSubscription({
    limit: itemsPerPageFromURL,
    offset: offsetFromURL,
    isFirstPage,
    orderDirection,
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
          <TransactionTable
            transactions={transactions}
            showAge={true}
            onSortColumn={handleSort}
            sortColumn={orderBy}
            sortDirection={orderDirection}
          />

          {/* Pagination - always show when there are transactions */}
          {totalCount > 0 && (
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
