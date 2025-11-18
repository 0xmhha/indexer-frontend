'use client'

import { useQuery } from '@apollo/client'
import { GET_BLOCKS } from '@/lib/apollo/queries-extended'

interface UseBlocksParams {
  limit?: number
  offset?: number
  numberFrom?: string
  numberTo?: string
  miner?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

/**
 * Hook to fetch blocks with pagination and filtering
 */
export function useBlocks(params: UseBlocksParams = {}) {
  const {
    limit = 20,
    offset = 0,
    numberFrom,
    numberTo,
    miner,
    orderBy = 'number',
    orderDirection = 'desc',
  } = params

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_BLOCKS, {
    variables: {
      limit,
      offset,
      numberFrom,
      numberTo,
      miner,
      orderBy,
      orderDirection,
    },
  })

  const blocks = data?.blocks?.nodes ?? []
  const totalCount = data?.blocks?.totalCount ?? 0
  const pageInfo = data?.blocks?.pageInfo

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
