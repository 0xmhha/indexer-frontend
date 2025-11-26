'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useBlocksWithSubscription } from '@/lib/hooks/useBlocksWithSubscription'
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
import { formatNumber, formatTimeAgo } from '@/lib/utils/format'
import type { Block } from '@/types/graphql'

function BlocksListContent() {
  const searchParams = useSearchParams()
  const [orderBy, setOrderBy] = useState<'number' | 'timestamp'>('number')
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc')

  // Get pagination params from URL
  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const currentPageFromURL = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPageFromURL = limitParam ? parseInt(limitParam, 10) : 20
  const offsetFromURL = (currentPageFromURL - 1) * itemsPerPageFromURL

  // Fetch blocks with WebSocket subscription for real-time updates
  const isFirstPage = currentPageFromURL === 1
  const { blocks: rawBlocks, totalCount, loading, error } = useBlocksWithSubscription({
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

  // Sort blocks based on orderBy and orderDirection
  const blocks = [...rawBlocks].sort((a, b) => {
    let comparison = 0
    if (orderBy === 'number') {
      comparison = Number(BigInt(a.number) - BigInt(b.number))
    } else if (orderBy === 'timestamp') {
      comparison = Number(BigInt(a.timestamp) - BigInt(b.timestamp))
    }
    return orderDirection === 'desc' ? -comparison : comparison
  })

  const handleSort = (field: 'number' | 'timestamp') => {
    if (orderBy === field) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setOrderBy(field)
      setOrderDirection('desc')
    }
    setPage(1)
  }

  if (loading && blocks.length === 0) {
    return <ListPageSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay title="Failed to load blocks" message={error.message} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">BLOCKS</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">ALL BLOCKS</h1>
        <p className="font-mono text-xs text-text-secondary">
          Total: {formatNumber(totalCount)} blocks
        </p>
      </div>

      {/* Blocks Table */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center justify-between">
            <span>BLOCKS LIST</span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-text-secondary">
                Page {currentPage} of {totalPages}
              </span>
              <ExportButton
                data={blocks.map((block) => ({
                  number: block.number,
                  hash: block.hash,
                  timestamp: block.timestamp,
                  miner: block.miner,
                  transactionCount: block.transactionCount,
                  gasUsed: block.gasUsed,
                  gasLimit: block.gasLimit,
                }))}
                filename="blocks"
                headers={['number', 'hash', 'timestamp', 'miner', 'transactionCount', 'gasUsed', 'gasLimit']}
                disabled={loading}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {blocks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-text-muted">No blocks found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        onClick={() => handleSort('number')}
                        className="flex items-center gap-1 hover:text-accent-blue"
                      >
                        BLOCK
                        {orderBy === 'number' && (
                          <span className="text-accent-blue">
                            {orderDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('timestamp')}
                        className="flex items-center gap-1 hover:text-accent-blue"
                      >
                        AGE
                        {orderBy === 'timestamp' && (
                          <span className="text-accent-blue">
                            {orderDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>MINER</TableHead>
                    <TableHead className="text-right">TXNS</TableHead>
                    <TableHead className="text-right">GAS USED</TableHead>
                    <TableHead className="text-right">GAS LIMIT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocks.map((block: Block) => {
                    const blockNumber = BigInt(block.number)
                    const timestamp = BigInt(block.timestamp)
                    const gasUsed = BigInt(block.gasUsed || 0)
                    const gasLimit = BigInt(block.gasLimit || 0)
                    const gasUsedPercent = gasLimit > 0n ? Number((gasUsed * 100n) / gasLimit) : 0

                    return (
                      <TableRow key={block.hash}>
                        <TableCell>
                          <Link
                            href={`/block/${block.number}`}
                            className="font-mono text-accent-blue hover:text-accent-cyan"
                          >
                            #{formatNumber(blockNumber)}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-text-secondary">
                          {formatTimeAgo(timestamp)}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/address/${block.miner}`}
                            className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
                          >
                            {block.miner.slice(0, 10)}...
                          </Link>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {block.transactionCount}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-mono text-xs">
                              {formatNumber(gasUsed)}
                            </span>
                            <div className="flex items-center gap-1">
                              <div className="h-1 w-16 bg-bg-tertiary">
                                <div
                                  className="h-full bg-accent-blue"
                                  style={{ width: `${gasUsedPercent}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-[10px] text-text-muted">
                                {gasUsedPercent.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {formatNumber(gasLimit)}
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

export default function BlocksListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <BlocksListContent />
    </Suspense>
  )
}
