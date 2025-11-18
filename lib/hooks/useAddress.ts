'use client'

import { useQuery } from '@apollo/client'
import { GET_ADDRESS_BALANCE, GET_TRANSACTIONS_BY_ADDRESS } from '@/lib/apollo/queries'

/**
 * Hook to fetch address balance
 */
export function useAddressBalance(address: string | null, blockNumber?: string) {
  const { data, loading, error } = useQuery(GET_ADDRESS_BALANCE, {
    variables: {
      address: address ?? '',
      blockNumber: blockNumber ?? null,
    },
    skip: !address,
  })

  return {
    balance: data?.addressBalance ? BigInt(data.addressBalance) : null,
    loading,
    error,
  }
}

/**
 * Hook to fetch transactions by address
 */
export function useAddressTransactions(address: string | null, limit = 10, offset = 0) {
  const { data, loading, error, fetchMore } = useQuery(GET_TRANSACTIONS_BY_ADDRESS, {
    variables: {
      address: address ?? '',
      limit,
      offset,
    },
    skip: !address,
  })

  const transactions = data?.transactionsByAddress?.nodes ?? []
  const totalCount = data?.transactionsByAddress?.totalCount ?? 0
  const pageInfo = data?.transactionsByAddress?.pageInfo

  return {
    transactions,
    totalCount,
    pageInfo,
    loading,
    error,
    fetchMore,
  }
}
