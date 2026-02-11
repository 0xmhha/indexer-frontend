'use client'

import { useRef, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { GET_TRANSACTIONS_BY_ADDRESS } from '@/lib/apollo/queries'
import { transformTransactions, type TransformedTransaction } from '@/lib/utils/graphql-transforms'
import { PAGINATION, POLLING_INTERVALS } from '@/lib/config/constants'

/**
 * Hook to fetch transactions by address with auto-refresh
 */
export function useAddressTransactions(address: string | null, limit: number = PAGINATION.ADDRESS_TX_LIMIT, offset: number = 0) {
  const lastOffsetRef = useRef<number>(offset)
  const cachedDataRef = useRef<{
    transactions: TransformedTransaction[]
    totalCount: number
    pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean } | undefined
  } | null>(null)

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

  const result = useMemo(() => {
    if (data?.transactionsByAddress) {
      const rawTransactions = data.transactionsByAddress.nodes ?? []
      const transactions = transformTransactions(rawTransactions)
      const totalCount = data.transactionsByAddress.totalCount ?? 0
      const pageInfo = data.transactionsByAddress.pageInfo

      lastOffsetRef.current = offset
      cachedDataRef.current = { transactions, totalCount, pageInfo }

      return { transactions, totalCount, pageInfo }
    }

    if (cachedDataRef.current && lastOffsetRef.current === offset) {
      return cachedDataRef.current
    }

    return {
      transactions: [] as TransformedTransaction[],
      totalCount: cachedDataRef.current?.totalCount ?? 0,
      pageInfo: undefined,
    }
  }, [data, offset])

  return {
    transactions: result.transactions,
    totalCount: result.totalCount,
    pageInfo: result.pageInfo,
    loading,
    error,
    fetchMore,
  }
}
