'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTransactions } from '@/lib/hooks/useTransactions'
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
import { formatNumber, formatHash, formatCurrency, formatTimeAgo } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import type { Transaction } from '@/types/graphql'

const ITEMS_PER_PAGE = 20

export default function TransactionsListPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [orderBy, setOrderBy] = useState<'blockNumber' | 'value'>('blockNumber')
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc')

  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  const { transactions, totalCount, loading, error } = useTransactions({
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

  const handleSort = (field: 'blockNumber' | 'value') => {
    if (orderBy === field) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setOrderBy(field)
      setOrderDirection('desc')
    }
    setCurrentPage(1)
  }

  if (loading && transactions.length === 0) {
    return <LoadingPage />
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
            <span className="font-mono text-xs text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
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
                          {tx.timestamp ? formatTimeAgo(BigInt(tx.timestamp)) : 'Pending'}
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
                          <span className="font-mono text-xs text-text-muted">{tx.type}</span>
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
