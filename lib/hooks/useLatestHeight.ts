'use client'

import { useQuery } from '@apollo/client'
import { GET_LATEST_HEIGHT } from '@/lib/apollo/queries'

/**
 * Hook to fetch latest indexed block height
 * Polls every 5 seconds for updates
 */
export function useLatestHeight() {
  const { data, loading, error, refetch } = useQuery(GET_LATEST_HEIGHT, {
    pollInterval: 5000, // Poll every 5 seconds
  })

  return {
    latestHeight: data?.latestHeight ? BigInt(data.latestHeight) : null,
    loading,
    error,
    refetch,
  }
}
