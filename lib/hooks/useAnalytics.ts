'use client'

import { useQuery } from '@apollo/client'
import { GET_BLOCKS_BY_TIME_RANGE, GET_NETWORK_METRICS } from '@/lib/apollo/queries'
import { transformBlocks, type TransformedBlock } from '@/lib/utils/graphql-transforms'
import { toBigInt } from '@/lib/utils/graphql-transforms'

/**
 * Hook to fetch blocks in a time range for analytics
 */
export function useBlocksByTimeRange(fromTime: bigint, toTime: bigint, limit = 1000) {
  const { data, loading, error } = useQuery(GET_BLOCKS_BY_TIME_RANGE, {
    variables: {
      fromTime: fromTime.toString(),
      toTime: toTime.toString(),
      limit,
    },
    skip: fromTime === BigInt(0) || toTime === BigInt(0),
  })

  const rawBlocks = data?.blocksByTimeRange?.nodes ?? []
  const blocks: TransformedBlock[] = transformBlocks(rawBlocks)
  const totalCount = data?.blocksByTimeRange?.totalCount ?? 0

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
  const { data, loading, error } = useQuery(GET_NETWORK_METRICS)

  return {
    blockCount: data?.blockCount ? toBigInt(data.blockCount) : null,
    transactionCount: data?.transactionCount ? toBigInt(data.transactionCount) : null,
    loading,
    error,
  }
}
