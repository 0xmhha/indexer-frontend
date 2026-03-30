/**
 * Hook to fetch stats for a single paymaster address
 */

'use client'

import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { GET_PAYMASTER_STATS } from '@/lib/apollo/queries/aa'
import { transformPaymasterStats } from '@/lib/utils/aa-transforms'
import type { RawPaymasterStats, PaymasterWithStats } from '@/types/aa'

interface UsePaymasterStatsResult {
  stats: PaymasterWithStats | null
  loading: boolean
  error: Error | null
}

export function usePaymasterStats(address: string): UsePaymasterStatsResult {
  const { data, loading, error } = useQuery(GET_PAYMASTER_STATS, {
    variables: { address },
    skip: !address,
    fetchPolicy: 'cache-and-network',
  })

  const stats = useMemo((): PaymasterWithStats | null => {
    const raw = data?.paymasterStats as RawPaymasterStats | undefined
    if (!raw) { return null }
    const transformed = transformPaymasterStats(raw)
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
