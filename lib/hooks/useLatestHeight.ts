'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_LATEST_HEIGHT } from '@/lib/apollo/queries'
import { useRealtimeStore, selectLatestHeight } from '@/stores/realtimeStore'

/**
 * Hook to fetch latest indexed block height
 * Uses centralized RealtimeStore for real-time updates (no direct subscription)
 * Initial data from query, real-time updates from store
 */
export function useLatestHeight() {
  // Initial data from query (no polling - real-time updates come from store)
  const { data, loading, error, refetch, previousData } = useQuery(GET_LATEST_HEIGHT, {
    pollInterval: 0,
  })

  // Get real-time height from centralized store
  const realtimeHeight = useRealtimeStore(selectLatestHeight)

  // Local state for height
  const [latestHeight, setLatestHeight] = useState<bigint | null>(null)

  // Initialize from query data
  useEffect(() => {
    const currentData = data || previousData
    if (currentData?.latestHeight) {
      // Legitimate use case: Synchronizing state from external GraphQL query data
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLatestHeight(BigInt(currentData.latestHeight))
    }
  }, [data, previousData])

  // Update from realtime store (when new blocks arrive via WebSocket)
  useEffect(() => {
    if (realtimeHeight !== null) {
      // Legitimate use case: Synchronizing state from external Zustand store
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLatestHeight(realtimeHeight)
    }
  }, [realtimeHeight])

  return {
    latestHeight,
    loading: loading && !previousData,
    error,
    refetch,
  }
}
