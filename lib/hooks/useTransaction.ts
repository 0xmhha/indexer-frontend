'use client'

import { useQuery } from '@apollo/client'
import { GET_TRANSACTION } from '@/lib/apollo/queries'

/**
 * Hook to fetch transaction by hash
 */
export function useTransaction(hash: string | null) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_TRANSACTION, {
    variables: { hash: hash ?? '' },
    skip: !hash,
    returnPartialData: true,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  return {
    transaction: effectiveData?.transaction,
    loading,
    error,
    refetch,
  }
}
