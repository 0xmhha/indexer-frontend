'use client'

import { useQuery } from '@apollo/client'
import { GET_BLOCKS_BY_TIME_RANGE, GET_NETWORK_METRICS } from '@/lib/apollo/queries'
import { transformBlocks, type TransformedBlock } from '@/lib/utils/graphql-transforms'
import { toBigInt } from '@/lib/utils/graphql-transforms'

/**
 * Hook to fetch blocks in a time range for analytics
 */
export function useBlocksByTimeRange(fromTime: bigint, toTime: bigint, limit = 1000) {
  const { data, loading, error, previousData } = useQuery(GET_BLOCKS_BY_TIME_RANGE, {
    variables: {
      fromTime: fromTime.toString(),
      toTime: toTime.toString(),
      limit,
    },
    skip: fromTime === BigInt(0) || toTime === BigInt(0),
    returnPartialData: true,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  const rawBlocks = effectiveData?.blocksByTimeRange?.nodes ?? []
  const blocks: TransformedBlock[] = transformBlocks(rawBlocks)
  const totalCount = effectiveData?.blocksByTimeRange?.totalCount ?? 0

  return {
    blocks,
    totalCount,
    loading,
    error,
  }
}

/**
 * Hook to fetch network metrics (block count and transaction count)
 */
export function useNetworkMetrics() {
  const { data, loading, error, previousData } = useQuery(GET_NETWORK_METRICS, {
    returnPartialData: true,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  return {
    blockCount: effectiveData?.blockCount ? toBigInt(effectiveData.blockCount) : null,
    transactionCount: effectiveData?.transactionCount ? toBigInt(effectiveData.transactionCount) : null,
    loading,
    error,
  }
}
