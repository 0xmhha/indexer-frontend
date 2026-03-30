/**
 * Hook to fetch stats for a single bundler address
 */

'use client'

import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { GET_BUNDLER_STATS } from '@/lib/apollo/queries/aa'
import { transformBundlerStats } from '@/lib/utils/aa-transforms'
import type { RawBundlerStats, BundlerWithStats } from '@/types/aa'

interface UseBundlerStatsResult {
  stats: BundlerWithStats | null
  loading: boolean
  error: Error | null
}

export function useBundlerStats(address: string): UseBundlerStatsResult {
  const { data, loading, error } = useQuery(GET_BUNDLER_STATS, {
    variables: { address },
    skip: !address,
    fetchPolicy: 'cache-and-network',
  })

  const stats = useMemo((): BundlerWithStats | null => {
    const raw = data?.bundlerStats as RawBundlerStats | undefined
    if (!raw) { return null }
    const transformed = transformBundlerStats(raw)
    const successRate = transformed.totalOps > 0
      ? (transformed.successfulOps / transformed.totalOps) * 100
      : 0
    return { ...transformed, successRate }
  }, [data])

  return {
    stats,
    loading,
    error: error ?? null,
  }
}
