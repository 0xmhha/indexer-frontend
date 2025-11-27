'use client'

import { gql, useQuery } from '@apollo/client'
import { transformBlocks, type TransformedBlock } from '@/lib/utils/graphql-transforms'
import { PAGINATION, POLLING_INTERVALS } from '@/lib/config/constants'

// Query for blocks with pagination
const GET_BLOCKS = gql`
  query GetBlocks(
    $limit: Int
    $offset: Int
    $numberFrom: String
    $numberTo: String
    $miner: String
  ) {
    blocks(
      pagination: { limit: $limit, offset: $offset }
      filter: { numberFrom: $numberFrom, numberTo: $numberTo, miner: $miner }
    ) {
      nodes {
        number
        hash
        timestamp
        miner
        gasUsed
        gasLimit
        size
        transactionCount
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

interface UseBlocksParams {
  limit?: number
  offset?: number
  numberFrom?: string
  numberTo?: string
  miner?: string
  pollInterval?: number // Auto-refresh interval in ms
}

/**
 * Hook to fetch blocks with pagination and filtering
 */
export function useBlocks(params: UseBlocksParams = {}) {
  const {
    limit = PAGINATION.DEFAULT_PAGE_SIZE,
    offset = 0,
    numberFrom,
    numberTo,
    miner,
    pollInterval = POLLING_INTERVALS.VERY_FAST, // Default: 5 seconds
  } = params

  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(GET_BLOCKS, {
    variables: {
      limit,
      offset,
      numberFrom,
      numberTo,
      miner,
    },
    // Use previous data while loading to prevent flickering
    returnPartialData: true,
    // Enable polling for real-time updates
    pollInterval,
    // Always fetch fresh data from network, bypass stale cache
    fetchPolicy: 'network-only',
    // Notify on network status change for proper loading states
    notifyOnNetworkStatusChange: true,
  })

  // Use previous data while loading new data to prevent flickering
  const effectiveData = data ?? previousData

  const rawBlocks = effectiveData?.blocks?.nodes ?? []
  const blocks: TransformedBlock[] = transformBlocks(rawBlocks)
  const totalCount = effectiveData?.blocks?.totalCount ?? 0
  const pageInfo = effectiveData?.blocks?.pageInfo

  return {
    blocks,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    fetchMore,
  }
}
