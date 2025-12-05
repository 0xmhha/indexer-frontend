'use client'

import { useMemo } from 'react'
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
 * Extract balance from live data
 */
function extractLiveBalance(data: LiveBalanceData | undefined): { balance: bigint; blockNumber: bigint } | null {
  if (!data?.liveBalance) { return null }
  return {
    balance: BigInt(data.liveBalance.balance),
    blockNumber: BigInt(data.liveBalance.blockNumber),
  }
}

/**
 * Extract balance from indexed data
 */
function extractIndexedBalance(data: IndexedBalanceData | undefined): bigint | null {
  if (!data?.addressBalance) { return null }
  return BigInt(data.addressBalance)
}

/**
 * Hook to fetch real-time balance from chain RPC with fallback to indexed data
 */
export function useLiveBalance(address: string | null, blockNumber?: string) {
  const queryVars = { address: address ?? '', blockNumber: blockNumber ?? null }

  const { data: liveData, loading: liveLoading, error: liveError, previousData: livePreviousData } = useQuery<LiveBalanceData>(GET_LIVE_BALANCE, {
    variables: queryVars, skip: !address, pollInterval: LIVE_BALANCE_POLL_INTERVAL, notifyOnNetworkStatusChange: false, returnPartialData: true, errorPolicy: 'all',
  })

  const shouldUseFallback = !!liveError || (!liveLoading && !liveData?.liveBalance)

  const { data: indexedData, loading: indexedLoading, error: indexedError, previousData: indexedPreviousData } = useQuery<IndexedBalanceData>(GET_ADDRESS_BALANCE, {
    variables: queryVars, skip: !address || !shouldUseFallback, pollInterval: LIVE_BALANCE_POLL_INTERVAL, notifyOnNetworkStatusChange: false, returnPartialData: true,
  })

  const result = useMemo(() => {
    const effectiveLiveData = liveData ?? livePreviousData
    const effectiveIndexedData = indexedData ?? indexedPreviousData

    const liveResult = extractLiveBalance(effectiveLiveData)
    const indexedResult = extractIndexedBalance(effectiveIndexedData)

    const isUsingLiveData = !shouldUseFallback && liveResult !== null
    const isUsingIndexedData = shouldUseFallback && indexedResult !== null

    let balance: bigint | null = null
    let blockNumber: bigint | null = null

    if (isUsingLiveData && liveResult) {
      balance = liveResult.balance
      blockNumber = liveResult.blockNumber
    } else if (isUsingIndexedData) {
      balance = indexedResult
    }

    return { balance, blockNumber, isLive: isUsingLiveData, isFallback: isUsingIndexedData }
  }, [liveData, livePreviousData, indexedData, indexedPreviousData, shouldUseFallback])

  return {
    ...result,
    loading: liveLoading || (shouldUseFallback && indexedLoading),
    error: shouldUseFallback ? indexedError : undefined,
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
