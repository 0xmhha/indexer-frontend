'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useContracts } from '@/lib/hooks/useContracts'
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
import { ListPageSkeleton } from '@/components/skeletons/ListPageSkeleton'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatTimeAgo, formatHash, formatNumber } from '@/lib/utils/format'
import { PAGINATION } from '@/lib/config/constants'

// ============================================================
// Main Content Component
// ============================================================

function ContractsListContent() {
  const searchParams = useSearchParams()

  // Parse pagination from URL
  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const currentPageFromURL = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPageFromURL = limitParam ? parseInt(limitParam, 10) : PAGINATION.DEFAULT_PAGE_SIZE
  const offsetFromURL = (currentPageFromURL - 1) * itemsPerPageFromURL

  // Fetch contracts
  const { contracts, totalCount, loading, error } = useContracts({
    limit: itemsPerPageFromURL,
    offset: offsetFromURL,
  })

  // Pagination state
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    setPage,
    setItemsPerPage,
  } = usePagination({
    totalCount,
    defaultItemsPerPage: PAGINATION.DEFAULT_PAGE_SIZE,
  })

  // Loading state
  if (loading && contracts.length === 0) {
    return <ListPageSkeleton />
  }

  // Error state - check if it's a "not supported" error
  if (error) {
    const isNotSupported = error.message.includes('Cannot query field') ||
      error.message.includes('does not support')

    if (isNotSupported) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="annotation mb-2">CONTRACTS</div>
            <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">
              DEPLOYED CONTRACTS
            </h1>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 text-4xl">🚧</div>
              <h2 className="mb-2 font-mono text-lg font-bold text-text-primary">
                Feature Coming Soon
              </h2>
              <p className="mb-4 max-w-md text-center font-mono text-sm text-text-muted">
                The contracts list feature requires backend support that is not yet available.
                Please check back later or contact your administrator.
              </p>
              <Link
                href="/"
                className="font-mono text-sm text-accent-blue hover:text-accent-cyan"
              >
                ← Return to Home
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay title="Failed to load contracts" message={error.message} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">CONTRACTS</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">
          DEPLOYED CONTRACTS
        </h1>
        <p className="font-mono text-xs text-text-secondary">
          Total: {formatNumber(BigInt(totalCount))} contracts
        </p>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center justify-between">
            <span>CONTRACTS LIST</span>
            <span className="font-mono text-xs text-text-secondary">
              Page {currentPage} of {totalPages || 1}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {contracts.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="font-mono text-sm text-text-muted">No contracts found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CONTRACT ADDRESS</TableHead>
                      <TableHead>NAME</TableHead>
                      <TableHead>DEPLOYER</TableHead>
                      <TableHead>TX HASH</TableHead>
                      <TableHead className="text-right">BLOCK</TableHead>
                      <TableHead className="text-right">SIZE</TableHead>
                      <TableHead className="text-right">DEPLOYED</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract) => (
                      <TableRow key={contract.contractAddress}>
                        <TableCell>
                          <Link
                            href={`/address/${contract.contractAddress}`}
                            className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
                          >
                            {formatHash(contract.contractAddress)}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {contract.name ? (
                            <span className="text-accent-green">{contract.name}</span>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/address/${contract.creator}`}
                            className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
                          >
                            {formatHash(contract.creator)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/tx/${contract.transactionHash}`}
                            className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
                          >
                            {formatHash(contract.transactionHash)}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/block/${contract.blockNumber}`}
                            className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
                          >
                            {formatNumber(contract.blockNumber)}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-text-secondary">
                          {contract.bytecodeSize.toLocaleString()} bytes
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-text-secondary">
                          {formatTimeAgo(contract.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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

// ============================================================
// Page Export
// ============================================================

export default function ContractsListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ContractsListContent />
    </Suspense>
  )
}
