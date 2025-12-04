'use client'

import { useQuery } from '@apollo/client'
import { GET_LIVE_BALANCE, GET_ADDRESS_BALANCE } from '@/lib/apollo/queries'

/**
 * Live Balance API Response
 */
interface LiveBalanceResult {
  address: string
  balance: string
  blockNumber: string
}

interface LiveBalanceData {
  liveBalance: LiveBalanceResult
}

interface IndexedBalanceData {
  addressBalance: string
}

/**
 * Cache TTL for live balance (15 seconds)
 */
const LIVE_BALANCE_POLL_INTERVAL = 15000

/**
 * Hook to fetch real-time balance from chain RPC with fallback to indexed data
 *
 * Features:
 * - Uses liveBalance API for real-time data from chain RPC
 * - Falls back to addressBalance (indexed data) if liveBalance fails
 * - Auto-refreshes every 15 seconds (matching backend cache TTL)
 *
 * @param address - The address to query balance for
 * @param blockNumber - Optional specific block number (omit for latest)
 */
export function useLiveBalance(address: string | null, blockNumber?: string) {
  // Query live balance from chain RPC
  const {
    data: liveData,
    loading: liveLoading,
    error: liveError,
    previousData: livePreviousData,
  } = useQuery<LiveBalanceData>(GET_LIVE_BALANCE, {
    variables: {
      address: address ?? '',
      blockNumber: blockNumber ?? null,
    },
    skip: !address,
    pollInterval: LIVE_BALANCE_POLL_INTERVAL,
    notifyOnNetworkStatusChange: false,
    returnPartialData: true,
    // Don't fail silently - we need to know if RPC Proxy is disabled
    errorPolicy: 'all',
  })

  // Fallback to indexed balance if live balance fails
  const shouldUseFallback = !!liveError || (!liveLoading && !liveData?.liveBalance)
  const {
    data: indexedData,
    loading: indexedLoading,
    error: indexedError,
    previousData: indexedPreviousData,
  } = useQuery<IndexedBalanceData>(GET_ADDRESS_BALANCE, {
    variables: {
      address: address ?? '',
      blockNumber: blockNumber ?? null,
    },
    skip: !address || !shouldUseFallback,
    pollInterval: LIVE_BALANCE_POLL_INTERVAL,
    notifyOnNetworkStatusChange: false,
    returnPartialData: true,
  })

  // Use previous data to prevent flickering during polling
  const effectiveLiveData = liveData ?? livePreviousData
  const effectiveIndexedData = indexedData ?? indexedPreviousData

  // Determine which data source to use (explicitly cast to boolean)
  const isUsingLiveData = !shouldUseFallback && !!effectiveLiveData?.liveBalance
  const isUsingIndexedData = shouldUseFallback && effectiveIndexedData?.addressBalance !== undefined

  // Extract balance value
  let balance: bigint | null = null
  let blockNumberResult: bigint | null = null

  if (isUsingLiveData && effectiveLiveData?.liveBalance) {
    balance = BigInt(effectiveLiveData.liveBalance.balance)
    blockNumberResult = BigInt(effectiveLiveData.liveBalance.blockNumber)
  } else if (isUsingIndexedData && effectiveIndexedData?.addressBalance) {
    balance = BigInt(effectiveIndexedData.addressBalance)
    // Indexed data doesn't return block number
    blockNumberResult = null
  }

  // Combined loading state
  const loading = liveLoading || (shouldUseFallback && indexedLoading)

  // Only surface error if both sources fail
  const error = shouldUseFallback ? indexedError : undefined

  return {
    balance,
    blockNumber: blockNumberResult,
    loading,
    error,
    // Additional metadata
    isLive: isUsingLiveData,
    isFallback: isUsingIndexedData,
    liveError: liveError ?? null,
  }
}

/**
 * Hook specifically for address overview that provides formatted balance
 * with loading states and error handling
 */
export function useAddressLiveBalance(address: string | null) {
  const { balance, blockNumber, loading, error, isLive, isFallback, liveError } = useLiveBalance(address)

  return {
    // Raw balance in wei
    balanceWei: balance,
    // Block number at which balance was queried (null for indexed data)
    blockNumber,
    // Loading state
    loading,
    // Error (only if both live and indexed fail)
    error,
    // Data source indicators
    isLive,
    isFallback,
    // RPC Proxy error (for debugging/display)
    rpcProxyError: liveError,
    // Convenience: has valid balance data
    hasBalance: balance !== null,
  }
}
