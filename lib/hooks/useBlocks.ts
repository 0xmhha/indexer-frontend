'use client'

import { gql, useQuery } from '@apollo/client'
import { transformBlocks, type TransformedBlock } from '@/lib/utils/graphql-transforms'

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
}

/**
 * Hook to fetch blocks with pagination and filtering
 */
export function useBlocks(params: UseBlocksParams = {}) {
  const { limit = 20, offset = 0, numberFrom, numberTo, miner } = params

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
