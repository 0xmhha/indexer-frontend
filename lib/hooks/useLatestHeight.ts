'use client'

import { useState, useEffect } from 'react'
import { useQuery, useSubscription } from '@apollo/client'
import { GET_LATEST_HEIGHT, SUBSCRIBE_NEW_BLOCK } from '@/lib/apollo/queries'
import { transformBlock } from '@/lib/utils/graphql-transforms'
import type { RawBlock } from '@/types/graphql'

/**
 * Hook to fetch latest indexed block height
 * Uses WebSocket subscription for real-time updates (no polling)
 * Uses previousData pattern to prevent flickering
 */
export function useLatestHeight() {
  // Initial data from query (no polling)
  const { data, loading, error, refetch, previousData } = useQuery(GET_LATEST_HEIGHT, {
    pollInterval: 0, // No polling - use subscription instead
  })

  // Subscribe to new blocks for real-time updates (no cache to avoid conflicts)
  const { data: subscriptionData } = useSubscription(SUBSCRIBE_NEW_BLOCK, {
    fetchPolicy: 'no-cache',
  })

  // State for latest height
  const [latestHeight, setLatestHeight] = useState<bigint | null>(null)

  // Initialize from query data (prevents flickering on mount)
  useEffect(() => {
    const currentData = data || previousData
    if (currentData?.latestHeight) {
      // Legitimate use case: Synchronizing state from external GraphQL query data
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLatestHeight(BigInt(currentData.latestHeight))
    }
  }, [data, previousData])

  // Update from subscription (real-time)
  useEffect(() => {
    if (subscriptionData?.newBlock) {
      const rawBlock = subscriptionData.newBlock as RawBlock
      const transformedBlock = transformBlock(rawBlock)
      // Legitimate use case: Synchronizing state from external GraphQL subscription
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLatestHeight(transformedBlock.number)
    }
  }, [subscriptionData])

  return {
    latestHeight,
    loading: loading && !previousData,
    error,
    refetch,
  }
}
