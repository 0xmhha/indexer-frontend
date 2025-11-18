'use client'

import { useQuery } from '@apollo/client'
import { GET_TRANSACTIONS } from '@/lib/apollo/queries-extended'

interface UseTransactionsParams {
  limit?: number
  offset?: number
  blockNumberFrom?: string
  blockNumberTo?: string
  from?: string
  to?: string
  type?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

/**
 * Hook to fetch transactions with pagination and filtering
 */
export function useTransactions(params: UseTransactionsParams = {}) {
  const {
    limit = 20,
    offset = 0,
    blockNumberFrom,
    blockNumberTo,
    from,
    to,
    type,
    orderBy = 'blockNumber',
    orderDirection = 'desc',
  } = params

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_TRANSACTIONS, {
    variables: {
      limit,
      offset,
      blockNumberFrom,
      blockNumberTo,
      from,
      to,
      type,
      orderBy,
      orderDirection,
    },
  })

  const transactions = data?.transactions?.nodes ?? []
  const totalCount = data?.transactions?.totalCount ?? 0
  const pageInfo = data?.transactions?.pageInfo

  return {
    transactions,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    fetchMore,
  }
}
