'use client'

import { useQuery } from '@apollo/client'
import { GET_ADDRESS_BALANCE, GET_TRANSACTIONS_BY_ADDRESS, GET_BALANCE_HISTORY, GET_TOKEN_BALANCES } from '@/lib/apollo/queries'
import type { TokenBalance } from '@/types/graphql'
import { PAGINATION, POLLING_INTERVALS } from '@/lib/config/constants'

/**
 * Hook to fetch address balance with auto-refresh
 */
export function useAddressBalance(address: string | null, blockNumber?: string) {
  const { data, loading, error, previousData } = useQuery(GET_ADDRESS_BALANCE, {
    variables: {
      address: address ?? '',
      blockNumber: blockNumber ?? null,
    },
    skip: !address,
    returnPartialData: true,
    // Enable polling for real-time balance updates (10 seconds)
    pollInterval: POLLING_INTERVALS.FAST,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  return {
    balance: effectiveData?.addressBalance != null ? BigInt(effectiveData.addressBalance) : null,
    loading,
    error,
  }
}

/**
 * Hook to fetch transactions by address with auto-refresh
 */
export function useAddressTransactions(address: string | null, limit: number = PAGINATION.ADDRESS_TX_LIMIT, offset: number = 0) {
  const { data, loading, error, fetchMore, previousData } = useQuery(GET_TRANSACTIONS_BY_ADDRESS, {
    variables: {
      address: address ?? '',
      limit,
      offset,
    },
    skip: !address,
    returnPartialData: true,
    // Enable polling for real-time transaction updates (10 seconds)
    pollInterval: POLLING_INTERVALS.FAST,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  const transactions = effectiveData?.transactionsByAddress?.nodes ?? []
  const totalCount = effectiveData?.transactionsByAddress?.totalCount ?? 0
  const pageInfo = effectiveData?.transactionsByAddress?.pageInfo

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
 * Hook to fetch balance history for an address with auto-refresh
 */
export function useBalanceHistory(
  address: string | null,
  fromBlock: bigint,
  toBlock: bigint,
  limit = PAGINATION.BALANCE_HISTORY_LIMIT
) {
  const { data, loading, error, previousData } = useQuery(GET_BALANCE_HISTORY, {
    variables: {
      address: address ?? '',
      fromBlock: fromBlock.toString(),
      toBlock: toBlock.toString(),
      limit,
      offset: 0,
    },
    skip: !address,
    returnPartialData: true,
    // Enable polling for balance history updates (10 seconds)
    pollInterval: POLLING_INTERVALS.FAST,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  const history = effectiveData?.balanceHistory?.nodes ?? []
  const totalCount = effectiveData?.balanceHistory?.totalCount ?? 0

  return {
    history,
    totalCount,
    loading,
    error,
  }
}

/**
 * Raw token balance data from GraphQL (before transformation)
 */
interface RawTokenBalance {
  contractAddress: string
  tokenType: string
  balance: string // String from GraphQL, needs to be converted to bigint
  tokenId: string | null
  name: string | null
  symbol: string | null
  decimals: number | null
  metadata: string | null
}

/**
 * Hook to fetch token balances for an address with auto-refresh
 * ✅ Now using real backend API (implemented 2025-11-24)
 * Supports filtering by tokenType (ERC-20, ERC-721, ERC-1155)
 */
export function useTokenBalances(address: string | null, tokenType?: string) {
  const { data, loading, error, previousData } = useQuery(GET_TOKEN_BALANCES, {
    variables: {
      address: address ?? '',
      ...(tokenType && { tokenType }),
    },
    skip: !address,
    returnPartialData: true,
    // Enable polling for token balance updates (10 seconds)
    pollInterval: POLLING_INTERVALS.FAST,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  const rawBalances = effectiveData?.tokenBalances ?? []

  // Transform balance strings to bigint
  const balances: TokenBalance[] = rawBalances.map((balance: RawTokenBalance) => ({
    ...balance,
    balance: BigInt(balance.balance),
  }))

  return {
    balances,
    loading,
    error,
  }
}
