'use client'

import { useRef } from 'react'
import { useQuery } from '@apollo/client'
import { GET_BALANCE_HISTORY } from '@/lib/apollo/queries'
import { PAGINATION } from '@/lib/config/constants'

interface BalanceHistoryNode {
  blockNumber: string
  balance: string
  delta: string
  transactionHash: string | null
}

/**
 * Check if new balance history has meaningful changes
 */
function shouldUpdateBalanceHistory(
  current: BalanceHistoryNode[],
  incoming: BalanceHistoryNode[]
): boolean {
  if (incoming.length === 0 && current.length > 0) {
    return false
  }

  if (current.length === 0) {
    return incoming.length > 0
  }

  const currentMaxBlock = Math.max(...current.map((n) => Number(n.blockNumber)))
  const incomingMaxBlock = incoming.length > 0
    ? Math.max(...incoming.map((n) => Number(n.blockNumber)))
    : 0

  if (incomingMaxBlock > currentMaxBlock) {
    const newEntries = incoming.filter((n) => Number(n.blockNumber) > currentMaxBlock)
    return newEntries.some((n) => n.balance !== '0' || n.delta !== '0')
  }

  if (incoming.length !== current.length) {
    return true
  }

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
 * Hook to fetch balance history for an address with auto-refresh
 */
export function useBalanceHistory(
  address: string | null,
  fromBlock: bigint,
  toBlock: bigint,
  limit = PAGINATION.BALANCE_HISTORY_LIMIT
) {
  const hasValidRange = toBlock > BigInt(0)

  const historyRef = useRef<BalanceHistoryNode[]>([])
  const totalCountRef = useRef<number>(0)
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
    pollInterval: 0,
    notifyOnNetworkStatusChange: false,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  })

  const effectiveData = data ?? previousData

  const incomingHistory = effectiveData?.balanceHistory?.nodes ?? []
  const incomingTotalCount = effectiveData?.balanceHistory?.totalCount ?? 0

  if (shouldUpdateBalanceHistory(historyRef.current, incomingHistory)) {
    historyRef.current = incomingHistory
    hasReceivedDataRef.current = true
  }

  if (incomingTotalCount > 0 || !hasReceivedDataRef.current) {
    if (totalCountRef.current !== incomingTotalCount) {
      totalCountRef.current = incomingTotalCount
    }
  }

  return {
    history: historyRef.current,
    totalCount: totalCountRef.current,
    loading: loading && !hasReceivedDataRef.current,
    error,
  }
}
