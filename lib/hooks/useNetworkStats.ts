'use client'

import { useQuery } from '@apollo/client'
import {
  GET_NETWORK_STATS,
  GET_BLOCKS_OVER_TIME,
  GET_TOP_MINERS,
} from '@/lib/apollo/queries-extended'

/**
 * Hook to fetch network statistics
 */
export function useNetworkStats() {
  const { data, loading, error } = useQuery(GET_NETWORK_STATS)

  const stats = data?.networkStats ?? null

  return {
    stats,
    loading,
    error,
  }
}

/**
 * Hook to fetch blocks over time data for charts
 */
export function useBlocksOverTime(from: bigint, to: bigint, interval: string = '1h') {
  const { data, loading, error } = useQuery(GET_BLOCKS_OVER_TIME, {
    variables: {
      from: from.toString(),
      to: to.toString(),
      interval,
    },
  })

  const blocksOverTime = data?.blocksOverTime ?? []

  return {
    blocksOverTime,
    loading,
    error,
  }
}

/**
 * Hook to fetch top miners
 */
export function useTopMiners(limit = 10) {
  const { data, loading, error } = useQuery(GET_TOP_MINERS, {
    variables: {
      limit,
    },
  })

  const topMiners = data?.topMiners ?? []

  return {
    topMiners,
    loading,
    error,
  }
}
