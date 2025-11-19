'use client'

import { useQuery } from '@apollo/client'
import { GET_BLOCK, GET_BLOCK_BY_HASH } from '@/lib/apollo/queries'

/**
 * Hook to fetch block by number or hash
 */
export function useBlock(numberOrHash: bigint | string | null) {
  const isHash = typeof numberOrHash === 'string' && numberOrHash.startsWith('0x')
  const query = isHash ? GET_BLOCK_BY_HASH : GET_BLOCK

  const variables = isHash ? { hash: numberOrHash } : { number: numberOrHash?.toString() ?? '0' }

  const { data, loading, error, refetch, previousData } = useQuery(query, {
    variables,
    skip: !numberOrHash,
    returnPartialData: true,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData
  const block = isHash ? effectiveData?.blockByHash : effectiveData?.block

  return {
    block,
    loading,
    error,
    refetch,
  }
}
