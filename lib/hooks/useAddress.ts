'use client'

import { useRef } from 'react'
import { useQuery } from '@apollo/client'
import { GET_ADDRESS_BALANCE, GET_TRANSACTIONS_BY_ADDRESS, GET_BALANCE_HISTORY, GET_TOKEN_BALANCES } from '@/lib/apollo/queries'
import type { TokenBalance } from '@/types/graphql'
import { PAGINATION, POLLING_INTERVALS } from '@/lib/config/constants'

interface BalanceHistoryNode {
  blockNumber: string
  balance: string
  delta: string
  transactionHash: string | null
}

/**
 * Check if new balance history has meaningful changes
 * Returns true if the new data should replace the current data
 *
 * Rules:
 * 1. If new data is empty and we have existing data, keep existing (no update)
 * 2. If new data has different block numbers with actual balances, update
 * 3. If new data is the same as existing, no update
 */
function shouldUpdateBalanceHistory(
  current: BalanceHistoryNode[],
  incoming: BalanceHistoryNode[]
): boolean {
  // If incoming is empty but we have data, don't update (keep existing)
  if (incoming.length === 0 && current.length > 0) {
    return false
  }

  // If we have no current data, accept any incoming data
  if (current.length === 0) {
    return incoming.length > 0
  }

  // Compare by checking if there are new block numbers with balance changes
  // Get the highest block number in current data
  const currentMaxBlock = Math.max(...current.map((n) => Number(n.blockNumber)))
  const incomingMaxBlock = incoming.length > 0
    ? Math.max(...incoming.map((n) => Number(n.blockNumber)))
    : 0

  // If incoming has a higher block number, check if it has actual balance data
  if (incomingMaxBlock > currentMaxBlock) {
    // Find entries with the new block numbers
    const newEntries = incoming.filter((n) => Number(n.blockNumber) > currentMaxBlock)
    // If any new entry has a non-zero balance change, update
    return newEntries.some((n) => n.balance !== '0' || n.delta !== '0')
  }

  // If block numbers are the same, check for actual content differences
  if (incoming.length !== current.length) {
    return true
  }

  // Deep compare for same-length arrays
  for (let i = 0; i < current.length; i++) {
    const currentItem = current[i]
    const incomingItem = incoming[i]
    if (!currentItem || !incomingItem) {return true}
    if (
      currentItem.blockNumber !== incomingItem.blockNumber ||
      currentItem.balance !== incomingItem.balance
    ) {
      return true
    }
  }

  return false
}

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
    // Prevent re-renders during polling to avoid flickering
    notifyOnNetworkStatusChange: false,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  return {
    balance: effectiveData?.addressBalance !== null && effectiveData?.addressBalance !== undefined ? BigInt(effectiveData.addressBalance) : null,
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
    // Prevent re-renders during polling to avoid flickering
    notifyOnNetworkStatusChange: false,
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
 * Uses stable reference pattern to prevent unnecessary re-renders when data hasn't changed
 *
 * Key optimizations:
 * 1. No polling - balance history is fetched on demand when block range changes
 * 2. Cache-first policy with network update for efficiency
 * 3. Only updates chart when there are actual NEW balance changes
 */
export function useBalanceHistory(
  address: string | null,
  fromBlock: bigint,
  toBlock: bigint,
  limit = PAGINATION.BALANCE_HISTORY_LIMIT
) {
  // Skip query if no address or invalid block range
  const hasValidRange = toBlock > BigInt(0)

  // Stable reference for history data - maintains last valid data
  const historyRef = useRef<BalanceHistoryNode[]>([])
  const totalCountRef = useRef<number>(0)
  // Track if we've ever received valid data
  const hasReceivedDataRef = useRef<boolean>(false)

  const { data, loading, error, previousData } = useQuery(GET_BALANCE_HISTORY, {
    variables: {
      address: address ?? '',
      fromBlock: fromBlock.toString(),
      toBlock: toBlock.toString(),
      limit,
      offset: 0,
    },
    skip: !address || !hasValidRange,
    returnPartialData: true,
    // No polling - rely on block range updates from latestHeight
    // This prevents constant re-fetches that reset the chart tooltip
    pollInterval: 0,
    // Prevent re-renders during network status changes
    notifyOnNetworkStatusChange: false,
    // Use cache-and-network to show cached data immediately while fetching fresh data
    fetchPolicy: 'cache-and-network',
    // Keep previous data during loading
    nextFetchPolicy: 'cache-first',
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  const incomingHistory = effectiveData?.balanceHistory?.nodes ?? []
  const incomingTotalCount = effectiveData?.balanceHistory?.totalCount ?? 0

  // Only update the reference if there are meaningful changes
  // This prevents unnecessary re-renders of the chart and tooltip resets
  if (shouldUpdateBalanceHistory(historyRef.current, incomingHistory)) {
    historyRef.current = incomingHistory
    hasReceivedDataRef.current = true
  }

  // Update total count only if we have valid data or it's a real change
  if (incomingTotalCount > 0 || !hasReceivedDataRef.current) {
    if (totalCountRef.current !== incomingTotalCount) {
      totalCountRef.current = incomingTotalCount
    }
  }

  return {
    history: historyRef.current,
    totalCount: totalCountRef.current,
    // Only show loading if we haven't received any data yet
    loading: loading && !hasReceivedDataRef.current,
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
    // Prevent re-renders during polling to avoid flickering
    notifyOnNetworkStatusChange: false,
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
