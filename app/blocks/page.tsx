'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useBlocks } from '@/lib/hooks/useBlocks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { LoadingPage } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatNumber, formatTimeAgo } from '@/lib/utils/format'
import type { Block } from '@/types/graphql'

const ITEMS_PER_PAGE = 20

export default function BlocksListPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [orderBy, setOrderBy] = useState<'number' | 'timestamp'>('number')
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc')

  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  const { blocks, totalCount, loading, error } = useBlocks({
    limit: ITEMS_PER_PAGE,
    offset,
    orderBy,
    orderDirection,
  })

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSort = (field: 'number' | 'timestamp') => {
    if (orderBy === field) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setOrderBy(field)
      setOrderDirection('desc')
    }
    setCurrentPage(1)
  }

  if (loading && blocks.length === 0) {
    return <LoadingPage />
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
            <span className="font-mono text-xs text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
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
                    const gasUsed = BigInt(block.gasUsed)
                    const gasLimit = BigInt(block.gasLimit)
                    const gasUsedPercent = Number((gasUsed * BigInt(100)) / gasLimit)

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
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
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
