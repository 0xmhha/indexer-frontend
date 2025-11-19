'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useAddressBalance, useAddressTransactions, useBalanceHistory } from '@/lib/hooks/useAddress'
import { useLatestHeight } from '@/lib/hooks/useLatestHeight'
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
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { AddressDetailSkeleton } from '@/components/skeletons/AddressDetailSkeleton'
import { formatCurrency, formatHash, formatNumber } from '@/lib/utils/format'
import { isValidAddress } from '@/lib/utils/validation'
import { env } from '@/lib/config/env'
import type { Transaction } from '@/types/graphql'

// Lazy load heavy chart component
const BalanceHistoryChart = dynamic(
  () => import('@/components/address/BalanceHistoryChart').then((mod) => ({ default: mod.BalanceHistoryChart })),
  {
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
)

interface PageProps {
  params: Promise<{ address: string }>
}

export default function AddressPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const address = resolvedParams.address

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Get latest block height for balance history
  const { latestHeight } = useLatestHeight()

  // Calculate block range for balance history (last 1000 blocks or all if less)
  const toBlock = latestHeight ?? BigInt(0)
  const fromBlock = toBlock > BigInt(1000) ? toBlock - BigInt(1000) : BigInt(0)

  // Call hooks unconditionally
  const { balance, loading: balanceLoading, error: balanceError } = useAddressBalance(address)
  const {
    transactions,
    totalCount,
    loading: txLoading,
    error: txError,
  } = useAddressTransactions(address, itemsPerPage, (currentPage - 1) * itemsPerPage)
  const {
    history,
    loading: historyLoading,
    error: historyError,
  } = useBalanceHistory(address, fromBlock, toBlock, 100)

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // Validate address
  if (!isValidAddress(address)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay title="Invalid Address" message="The provided address is not valid" />
      </div>
    )
  }

  if (balanceLoading) {
    return <AddressDetailSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">ADDRESS</div>
        <h1 className="mb-4 break-all font-mono text-xl font-bold text-accent-blue">{address}</h1>
      </div>

      {/* Balance Card */}
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>OVERVIEW</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {balanceError ? (
            <ErrorDisplay title="Failed to load balance" message={balanceError.message} />
          ) : (
            <div>
              <div className="annotation mb-2">BALANCE</div>
              <div className="font-mono text-3xl font-bold text-accent-blue">
                {balance !== null ? formatCurrency(balance, env.currencySymbol) : 'Loading...'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance History Chart */}
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>BALANCE HISTORY</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {historyLoading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : historyError ? (
            <ErrorDisplay title="Failed to load balance history" message={historyError.message} />
          ) : (
            <BalanceHistoryChart history={history} />
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center justify-between">
            <span>TRANSACTIONS</span>
            {totalCount > 0 && (
              <span className="font-mono text-xs text-text-secondary">
                {formatNumber(totalCount)} total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {txLoading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : txError ? (
            <div className="p-6">
              <ErrorDisplay title="Failed to load transactions" message={txError.message} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-text-muted">No transactions found for this address</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TX HASH</TableHead>
                  <TableHead>BLOCK</TableHead>
                  <TableHead>FROM</TableHead>
                  <TableHead>TO</TableHead>
                  <TableHead className="text-right">VALUE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx: Transaction) => (
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
                      {tx.to === address ? (
                        <span className="font-mono text-text-secondary">Self</span>
                      ) : tx.to ? (
                        <Link
                          href={`/address/${tx.to}`}
                          className="font-mono text-accent-blue hover:text-accent-cyan"
                        >
                          {formatHash(tx.to, true)}
                        </Link>
                      ) : (
                        <span className="font-mono text-text-muted">[Contract]</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(BigInt(tx.value), env.currencySymbol)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  )
}
