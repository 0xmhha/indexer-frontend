'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUserOperations } from '@/lib/hooks/aa'
import { usePagination } from '@/lib/hooks/usePagination'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { ListPageSkeleton } from '@/components/skeletons/ListPageSkeleton'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { UserOpTable } from '@/components/aa/userops/UserOpTable'
import { formatNumber } from '@/lib/utils/format'
import { PAGINATION } from '@/lib/config/constants'

function UserOpsListContent() {
  const searchParams = useSearchParams()
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all')

  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const currentPageFromURL = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPageFromURL = limitParam ? parseInt(limitParam, 10) : PAGINATION.DEFAULT_PAGE_SIZE
  const offsetFromURL = (currentPageFromURL - 1) * itemsPerPageFromURL

  const { userOps, totalCount, loading, error } = useUserOperations({
    limit: itemsPerPageFromURL,
    offset: offsetFromURL,
    filter: statusFilter !== 'all' ? { status: statusFilter } : undefined,
  })

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

  if (loading && userOps.length === 0) {
    return <ListPageSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay title="Failed to load user operations" message={error.message} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">ACCOUNT ABSTRACTION</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">USER OPERATIONS</h1>
        <p className="font-mono text-xs text-text-secondary">
          Total: {formatNumber(totalCount)} user operations (EIP-4337)
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-4 flex items-center gap-2">
        <span className="font-mono text-xs text-text-secondary">Status:</span>
        {(['all', 'success', 'failed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status)
              setPage(1)
            }}
            className={`rounded-full px-3 py-1 font-mono text-xs transition-colors ${
              statusFilter === status
                ? 'bg-accent-blue text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            {status === 'all' ? 'All' : status === 'success' ? 'Success' : 'Failed'}
          </button>
        ))}
      </div>

      {/* UserOps Table */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center justify-between">
            <span>USER OPERATIONS LIST</span>
            <span className="font-mono text-xs text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <UserOpTable userOps={userOps} showAge={true} />

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

export default function UserOpsListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <UserOpsListContent />
    </Suspense>
  )
}
