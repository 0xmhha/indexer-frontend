'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_TRANSACTIONS_BY_ADDRESS } from '@/lib/apollo/queries'
import { transformTransactions, type TransformedTransaction } from '@/lib/utils/graphql-transforms'
import { PAGINATION, POLLING_INTERVALS } from '@/lib/config/constants'

interface CachedTransactionData {
  transactions: TransformedTransaction[]
  totalCount: number
  pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean } | undefined
}

const EMPTY_CACHE: CachedTransactionData = { transactions: [], totalCount: 0, pageInfo: undefined }

/**
 * Hook to fetch transactions by address with auto-refresh
 */
export function useAddressTransactions(address: string | null, limit: number = PAGINATION.ADDRESS_TX_LIMIT, offset: number = 0) {
  const [cachedData, setCachedData] = useState<CachedTransactionData>(EMPTY_CACHE)

  const { data, loading, error, fetchMore } = useQuery(GET_TRANSACTIONS_BY_ADDRESS, {
    variables: {
      address: address ?? '',
      limit,
      offset,
    },
    skip: !address,
    fetchPolicy: 'network-only',
    pollInterval: POLLING_INTERVALS.FAST,
    notifyOnNetworkStatusChange: false,
  })

  // Cache latest successful result during render
  // Pattern: https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevData, setPrevData] = useState(data)
  if (data !== prevData) {
    setPrevData(data)
    if (data?.transactionsByAddress) {
      const rawTransactions = data.transactionsByAddress.nodes ?? []
      setCachedData({
        transactions: transformTransactions(rawTransactions),
        totalCount: data.transactionsByAddress.totalCount ?? 0,
        pageInfo: data.transactionsByAddress.pageInfo,
      })
    }
  }

  return {
    transactions: cachedData.transactions,
    totalCount: cachedData.totalCount,
    pageInfo: cachedData.pageInfo,
    loading,
    error,
    fetchMore,
  }
}
