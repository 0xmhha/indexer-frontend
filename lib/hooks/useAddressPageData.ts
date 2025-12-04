'use client'

import { useMemo } from 'react'
import { useAddressTransactions, useBalanceHistory, useTokenBalances } from '@/lib/hooks/useAddress'
import { useLiveBalance } from '@/lib/hooks/useLiveBalance'
import { useFilteredTransactions, type FilteredTransactionsParams } from '@/lib/hooks/useFilteredTransactions'
import { useLatestHeight } from '@/lib/hooks/useLatestHeight'
import { usePagination } from '@/lib/hooks/usePagination'
import { useURLFilters, type UseURLFiltersResult } from '@/lib/hooks/useURLFilters'
import type { TransformedTransaction } from '@/lib/utils/graphql-transforms'

// ============================================================
// Types
// ============================================================

export interface AddressPageDataResult {
  // Native balance data (via liveBalance API with fallback to indexed)
  balance: bigint | null
  balanceLoading: boolean
  balanceError: Error | null
  balanceBlockNumber: bigint | null
  isLiveBalance: boolean
  isFallbackBalance: boolean

  // History data
  history: ReturnType<typeof useBalanceHistory>['history']
  historyLoading: boolean
  historyError: Error | null

  // Token balances
  balances: ReturnType<typeof useTokenBalances>['balances']
  balancesLoading: boolean

  // Transactions (filtered or unfiltered)
  transactions: TransformedTransaction[]
  totalCount: number
  txLoading: boolean
  txError: Error | null

  // Filter state
  activeFilters: UseURLFiltersResult['activeFilters']
  itemsPerPage: number

  // Pagination
  currentPage: number
  totalPages: number

  // Actions
  handleApplyFilters: (filters: UseURLFiltersResult['activeFilters']) => void
  handleResetFilters: () => void
  setPage: (page: number) => void
  setItemsPerPage: (size: number) => void
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Block range constant for balance history queries
 * Using a fixed range size to prevent unnecessary re-queries
 */
const BALANCE_HISTORY_BLOCK_RANGE = BigInt(1000)

/**
 * Select transactions based on filter state
 */
function selectTransactionData(
  activeFilters: UseURLFiltersResult['activeFilters'],
  filteredData: {
    transactions: TransformedTransaction[]
    totalCount: number
    loading: boolean
    error: Error | undefined
  },
  unfilteredData: {
    transactions: TransformedTransaction[]
    totalCount: number
    loading: boolean
    error: Error | undefined
  }
) {
  if (activeFilters) {
    return {
      transactions: filteredData.transactions,
      totalCount: filteredData.totalCount,
      txLoading: filteredData.loading,
      txError: filteredData.error ?? null,
    }
  }
  return {
    transactions: unfilteredData.transactions,
    totalCount: unfilteredData.totalCount,
    txLoading: unfilteredData.loading,
    txError: unfilteredData.error ?? null,
  }
}

// ============================================================
// Main Hook
// ============================================================

/**
 * Hook to manage all address page data fetching and state
 */
export function useAddressPageData(address: string): AddressPageDataResult {
  // URL filters
  const { activeFilters, itemsPerPage, offset, applyFilters, resetFilters } = useURLFilters()

  // Latest block height
  const { latestHeight } = useLatestHeight()

  // Memoize block range to prevent unnecessary re-queries
  // Only recalculate when latestHeight actually changes
  const { fromBlock, toBlock } = useMemo(() => {
    const to = latestHeight ?? BigInt(0)
    const from = to > BALANCE_HISTORY_BLOCK_RANGE ? to - BALANCE_HISTORY_BLOCK_RANGE : BigInt(0)
    return { fromBlock: from, toBlock: to }
  }, [latestHeight])

  // Native balance data via liveBalance API (real-time from chain RPC with 15s cache)
  // Falls back to indexed addressBalance if liveBalance fails
  const {
    balance,
    blockNumber: balanceBlockNumber,
    loading: balanceLoading,
    error: balanceError,
    isLive: isLiveBalance,
    isFallback: isFallbackBalance,
  } = useLiveBalance(address)

  // Balance history
  const { history, loading: historyLoading, error: historyError } = useBalanceHistory(
    address,
    fromBlock,
    toBlock,
    100
  )

  // Token balances
  const { balances, loading: balancesLoading } = useTokenBalances(address)

  // Unfiltered transactions
  const unfilteredResult = useAddressTransactions(address, itemsPerPage, offset)

  // Build filtered params
  const filteredParams: FilteredTransactionsParams = {
    address,
    fromBlock: activeFilters?.fromBlock || '0',
    toBlock: activeFilters?.toBlock || (latestHeight?.toString() || '0'),
    minValue: activeFilters?.minValue,
    maxValue: activeFilters?.maxValue,
    txType: activeFilters?.txType,
    successOnly: activeFilters?.successOnly,
    limit: itemsPerPage,
    offset,
  }

  // Filtered transactions
  const filteredResult = useFilteredTransactions(filteredParams)

  // Select data based on filter state
  const { transactions, totalCount, txLoading, txError } = selectTransactionData(
    activeFilters,
    {
      transactions: filteredResult.transactions,
      totalCount: filteredResult.totalCount,
      loading: filteredResult.loading,
      error: filteredResult.error,
    },
    {
      transactions: unfilteredResult.transactions,
      totalCount: unfilteredResult.totalCount,
      loading: unfilteredResult.loading,
      error: unfilteredResult.error,
    }
  )

  // Pagination
  const { currentPage, totalPages, setPage, setItemsPerPage } = usePagination({
    totalCount,
    defaultItemsPerPage: 20,
  })

  // Filter handlers
  const handleApplyFilters = (filters: UseURLFiltersResult['activeFilters']) => {
    if (filters) {
      applyFilters(filters, latestHeight ?? undefined)
      setPage(1)
    }
  }

  const handleResetFilters = () => {
    resetFilters()
    setPage(1)
  }

  return {
    // Native balance data (via liveBalance API with fallback to indexed)
    balance,
    balanceLoading,
    balanceError: balanceError ?? null,
    balanceBlockNumber,
    isLiveBalance,
    isFallbackBalance,

    // History data
    history,
    historyLoading,
    historyError: historyError ?? null,

    // Token balances
    balances,
    balancesLoading,

    // Transactions
    transactions,
    totalCount,
    txLoading,
    txError,

    // Filter state
    activeFilters,
    itemsPerPage,

    // Pagination
    currentPage,
    totalPages,

    // Actions
    handleApplyFilters,
    handleResetFilters,
    setPage,
    setItemsPerPage,
  }
}
