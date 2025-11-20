'use client'

import { use, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAddressBalance, useAddressTransactions, useBalanceHistory } from '@/lib/hooks/useAddress'
import { useFilteredTransactions } from '@/lib/hooks/useFilteredTransactions'
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
import { TransactionFilters, type TransactionFilterValues } from '@/components/transactions/TransactionFilters'
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
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Parse initial filters from URL
  const getFiltersFromURL = useCallback((): TransactionFilterValues | null => {
    const fromBlock = searchParams.get('fromBlock')
    const toBlock = searchParams.get('toBlock')
    const minValue = searchParams.get('minValue')
    const maxValue = searchParams.get('maxValue')
    const txType = searchParams.get('txType')
    const successOnly = searchParams.get('successOnly')

    // Only return filters if at least one parameter is set
    if (fromBlock || toBlock || minValue || maxValue || txType || successOnly) {
      return {
        fromBlock: fromBlock || '',
        toBlock: toBlock || '',
        minValue: minValue || '',
        maxValue: maxValue || '',
        txType: txType ? parseInt(txType) : 0,
        successOnly: successOnly === 'true',
      }
    }
    return null
  }, [searchParams])

  // Filter state - initialize from URL
  const [activeFilters, setActiveFilters] = useState<TransactionFilterValues | null>(() =>
    getFiltersFromURL()
  )

  // Sync filters with URL on searchParams change
  useEffect(() => {
    const urlFilters = getFiltersFromURL()
    setActiveFilters(urlFilters)
  }, [getFiltersFromURL])

  // Get latest block height for balance history
  const { latestHeight } = useLatestHeight()

  // Calculate block range for balance history (last 1000 blocks or all if less)
  const toBlock = latestHeight ?? BigInt(0)
  const fromBlock = toBlock > BigInt(1000) ? toBlock - BigInt(1000) : BigInt(0)

  // Call hooks unconditionally
  const { balance, loading: balanceLoading, error: balanceError } = useAddressBalance(address)

  // Unfiltered transactions
  const {
    transactions: unfilteredTransactions,
    totalCount: unfilteredTotalCount,
    loading: unfilteredTxLoading,
    error: unfilteredTxError,
  } = useAddressTransactions(address, itemsPerPage, (currentPage - 1) * itemsPerPage)

  // Filtered transactions (only when filters are active)
  const {
    transactions: filteredTransactions,
    totalCount: filteredTotalCount,
    loading: filteredTxLoading,
    error: filteredTxError,
  } = useFilteredTransactions({
    address,
    fromBlock: activeFilters?.fromBlock || '0',
    toBlock: activeFilters?.toBlock || (latestHeight?.toString() || '0'),
    minValue: activeFilters?.minValue,
    maxValue: activeFilters?.maxValue,
    txType: activeFilters?.txType,
    successOnly: activeFilters?.successOnly,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  })

  // Use filtered or unfiltered data based on active filters
  const transactions = activeFilters ? filteredTransactions : unfilteredTransactions
  const totalCount = activeFilters ? filteredTotalCount : unfilteredTotalCount
  const txLoading = activeFilters ? filteredTxLoading : unfilteredTxLoading
  const txError = activeFilters ? filteredTxError : unfilteredTxError

  const {
    history,
    loading: historyLoading,
    error: historyError,
  } = useBalanceHistory(address, fromBlock, toBlock, 100)

  // Filter handlers
  const handleApplyFilters = (filters: TransactionFilterValues) => {
    // Set default block range if not provided
    const appliedFilters = {
      ...filters,
      fromBlock: filters.fromBlock || '0',
      toBlock: filters.toBlock || (latestHeight?.toString() || '0'),
    }
    setActiveFilters(appliedFilters)
    setCurrentPage(1)

    // Update URL with filter parameters
    const params = new URLSearchParams()
    if (appliedFilters.fromBlock && appliedFilters.fromBlock !== '0') {
      params.set('fromBlock', appliedFilters.fromBlock)
    }
    if (appliedFilters.toBlock) {
      params.set('toBlock', appliedFilters.toBlock)
    }
    if (appliedFilters.minValue) {
      params.set('minValue', appliedFilters.minValue)
    }
    if (appliedFilters.maxValue) {
      params.set('maxValue', appliedFilters.maxValue)
    }
    if (appliedFilters.txType !== 0) {
      params.set('txType', appliedFilters.txType.toString())
    }
    if (appliedFilters.successOnly) {
      params.set('successOnly', 'true')
    }

    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : '', { scroll: false })
  }

  const handleResetFilters = () => {
    setActiveFilters(null)
    setCurrentPage(1)
    // Clear URL parameters
    router.push('', { scroll: false })
  }

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

      {/* Transaction Filters */}
      <TransactionFilters
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        initialValues={activeFilters || undefined}
        isLoading={txLoading}
      />

      {/* Transactions */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center justify-between">
            <span>TRANSACTIONS {activeFilters && '(FILTERED)'}</span>
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
                  {activeFilters && <TableHead>STATUS</TableHead>}
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
                    {activeFilters && (
                      <TableCell>
                        {tx.receipt?.status === 1 ? (
                          <span className="font-mono text-xs text-accent-green">SUCCESS</span>
                        ) : tx.receipt?.status === 0 ? (
                          <span className="font-mono text-xs text-accent-orange">FAILED</span>
                        ) : (
                          <span className="font-mono text-xs text-text-muted">-</span>
                        )}
                      </TableCell>
                    )}
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
