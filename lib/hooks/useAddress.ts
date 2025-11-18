'use client'

import { useQuery } from '@apollo/client'
import { GET_ADDRESS_BALANCE, GET_TRANSACTIONS_BY_ADDRESS, GET_BALANCE_HISTORY } from '@/lib/apollo/queries'

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

/**
 * Hook to fetch balance history for an address
 */
export function useBalanceHistory(
  address: string | null,
  fromBlock: bigint,
  toBlock: bigint,
  limit = 100
) {
  const { data, loading, error } = useQuery(GET_BALANCE_HISTORY, {
    variables: {
      address: address ?? '',
      fromBlock: fromBlock.toString(),
      toBlock: toBlock.toString(),
      limit,
      offset: 0,
    },
    skip: !address,
  })

  const history = data?.balanceHistory?.nodes ?? []
  const totalCount = data?.balanceHistory?.totalCount ?? 0

  return {
    history,
    totalCount,
    loading,
    error,
  }
}
