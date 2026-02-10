'use client'

import { useRef, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { GET_ADDRESS_BALANCE, GET_ADDRESS_OVERVIEW, GET_TRANSACTIONS_BY_ADDRESS, GET_BALANCE_HISTORY, GET_TOKEN_BALANCES, GET_ADDRESS_SETCODE_INFO, GET_ADDRESS_STATS } from '@/lib/apollo/queries'
import { transformTransactions, type TransformedTransaction } from '@/lib/utils/graphql-transforms'
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

  // Memoize balance transformation and return value for stable reference
  return useMemo(() => ({
    balance: effectiveData?.addressBalance !== null && effectiveData?.addressBalance !== undefined ? BigInt(effectiveData.addressBalance) : null,
    loading,
    error,
  }), [effectiveData?.addressBalance, loading, error])
}

// ============================================================================
// Address Overview Types
// ============================================================================

interface RawAddressOverview {
  address: string
  isContract: boolean
  balance: string
  transactionCount: number
  sentCount: number
  receivedCount: number
  internalTxCount: number
  erc20TokenCount: number
  erc721TokenCount: number
  firstSeen: string | null
  lastSeen: string | null
}

export interface AddressOverview {
  address: string
  isContract: boolean
  balance: bigint
  transactionCount: number
  sentCount: number
  receivedCount: number
  internalTxCount: number
  erc20TokenCount: number
  erc721TokenCount: number
  firstSeen: bigint | null
  lastSeen: bigint | null
}

/**
 * Hook to fetch comprehensive address overview including isContract flag
 * This is the most reliable way to determine if an address is a contract
 */
export function useAddressOverview(address: string | null) {
  const { data, loading, error, previousData } = useQuery(GET_ADDRESS_OVERVIEW, {
    variables: {
      address: address ?? '',
    },
    skip: !address,
    returnPartialData: true,
    // Enable polling for real-time updates (30 seconds - slower since this is overview data)
    pollInterval: POLLING_INTERVALS.SLOW,
    notifyOnNetworkStatusChange: false,
  })

  const effectiveData = data ?? previousData
  const rawOverview: RawAddressOverview | null = effectiveData?.addressOverview ?? null

  // Memoize overview transformation to prevent unnecessary re-renders
  const overview = useMemo((): AddressOverview | null => {
    if (!rawOverview) return null

    return {
      address: rawOverview.address,
      isContract: rawOverview.isContract,
      balance: BigInt(rawOverview.balance),
      transactionCount: rawOverview.transactionCount,
      sentCount: rawOverview.sentCount,
      receivedCount: rawOverview.receivedCount,
      internalTxCount: rawOverview.internalTxCount,
      erc20TokenCount: rawOverview.erc20TokenCount,
      erc721TokenCount: rawOverview.erc721TokenCount,
      firstSeen: rawOverview.firstSeen ? BigInt(rawOverview.firstSeen) : null,
      lastSeen: rawOverview.lastSeen ? BigInt(rawOverview.lastSeen) : null,
    }
  }, [rawOverview])

  // Memoize return value for stable reference
  return useMemo(() => ({
    overview,
    isContract: overview?.isContract ?? false,
    loading,
    error,
  }), [overview, loading, error])
}

/**
 * Hook to fetch transactions by address with auto-refresh
 * Uses same transformation as useTransactions for consistency
 */
export function useAddressTransactions(address: string | null, limit: number = PAGINATION.ADDRESS_TX_LIMIT, offset: number = 0) {
  // Track last successful offset to prevent data mixing between pages
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
    // Use network-only to prevent stale cache issues when offset changes
    fetchPolicy: 'network-only',
    // Enable polling for real-time transaction updates (10 seconds)
    pollInterval: POLLING_INTERVALS.FAST,
    // Prevent re-renders during polling to avoid flickering
    notifyOnNetworkStatusChange: false,
  })

  // Memoize transformed data to prevent unnecessary re-renders
  const result = useMemo(() => {
    if (data?.transactionsByAddress) {
      const rawTransactions = data.transactionsByAddress.nodes ?? []
      const transactions = transformTransactions(rawTransactions)
      const totalCount = data.transactionsByAddress.totalCount ?? 0
      const pageInfo = data.transactionsByAddress.pageInfo

      // Cache successful result
      lastOffsetRef.current = offset
      cachedDataRef.current = { transactions, totalCount, pageInfo }

      return { transactions, totalCount, pageInfo }
    }

    // Use cached data only if offset matches (same page)
    if (cachedDataRef.current && lastOffsetRef.current === offset) {
      return cachedDataRef.current
    }

    // Return empty state for new page while loading
    return {
      transactions: [] as TransformedTransaction[],
      totalCount: cachedDataRef.current?.totalCount ?? 0, // Keep total count for pagination
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
  address: string // Token contract address (field name from schema)
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

  // Memoize balance transformation to prevent unnecessary re-renders
  const balances = useMemo((): TokenBalance[] =>
    rawBalances.map((balance: RawTokenBalance) => ({
      ...balance,
      balance: BigInt(balance.balance),
    })),
    [rawBalances]
  )

  // Memoize return value for stable reference
  return useMemo(() => ({
    balances,
    loading,
    error,
  }), [balances, loading, error])
}

// ============================================================================
// EIP-7702 SetCode Types and Hook
// ============================================================================

/**
 * Address SetCode delegation info from backend index
 */
export interface AddressSetCodeInfo {
  address: string
  hasDelegation: boolean
  delegationTarget: string | null
  asAuthorityCount: number
  asTargetCount: number
  lastActivityBlock: string | null
  lastActivityTimestamp: string | null
}

/**
 * Hook to fetch EIP-7702 SetCode delegation info for an address
 * Uses the authoritative addressSetCodeInfo API instead of filtering transactions.
 *
 * @param address - The address to check for SetCode delegation
 */
export function useAddressSetCodeInfo(address: string | null) {
  const { data, loading, error, previousData } = useQuery(GET_ADDRESS_SETCODE_INFO, {
    variables: {
      address: address ?? '',
    },
    skip: !address,
    returnPartialData: true,
    pollInterval: POLLING_INTERVALS.SLOW,
    notifyOnNetworkStatusChange: false,
  })

  const effectiveData = data ?? previousData
  const info: AddressSetCodeInfo | null = effectiveData?.addressSetCodeInfo ?? null

  return {
    info,
    hasDelegation: info?.hasDelegation ?? false,
    delegationTarget: info?.delegationTarget ?? null,
    loading,
    error,
  }
}

/**
 * Backend address stats response shape
 */
export interface AddressStats {
  address: string
  totalTransactions: number
  sentCount: number
  receivedCount: number
  successCount: number
  failedCount: number
  totalGasUsed: string
  totalGasCost: string
  totalValueSent: string
  totalValueReceived: string
  contractInteractionCount: number
  uniqueAddressCount: number
  firstTransactionTimestamp: string | null
  lastTransactionTimestamp: string | null
}

/**
 * Hook to fetch pre-computed address statistics from backend
 * More efficient than calculating stats client-side from transaction arrays
 */
export function useAddressStats(address: string | null) {
  const { data, loading, error, previousData, refetch } = useQuery<{ addressStats: AddressStats }>(
    GET_ADDRESS_STATS,
    {
      variables: { address: address ?? '' },
      skip: !address,
      returnPartialData: true,
    }
  )

  const effectiveData = data ?? previousData
  const stats: AddressStats | null = effectiveData?.addressStats ?? null

  return {
    stats,
    loading,
    error,
    refetch,
  }
}
