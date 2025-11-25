'use client'

import { useAddressBalance, useAddressTransactions, useBalanceHistory, useTokenBalances } from '@/lib/hooks/useAddress'
import { useFilteredTransactions, type FilteredTransactionsParams } from '@/lib/hooks/useFilteredTransactions'
import { useLatestHeight } from '@/lib/hooks/useLatestHeight'
import { usePagination } from '@/lib/hooks/usePagination'
import { useURLFilters, type UseURLFiltersResult } from '@/lib/hooks/useURLFilters'
import type { TransformedTransaction } from '@/lib/utils/graphql-transforms'

// ============================================================
// Types
// ============================================================

export interface AddressPageDataResult {
  // Balance data
  balance: ReturnType<typeof useAddressBalance>['balance']
  balanceLoading: boolean
  balanceError: Error | null

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
 * Calculate block range for balance history
 */
function calculateBlockRange(latestHeight: bigint | null) {
  const toBlock = latestHeight ?? BigInt(0)
  const fromBlock = toBlock > BigInt(1000) ? toBlock - BigInt(1000) : BigInt(0)
  return { fromBlock, toBlock }
}

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
  const { fromBlock, toBlock } = calculateBlockRange(latestHeight)

  // Balance data
  const { balance, loading: balanceLoading, error: balanceError } = useAddressBalance(address)

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
    // Balance data
    balance,
    balanceLoading,
    balanceError: balanceError ?? null,

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
