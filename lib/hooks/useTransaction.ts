'use client'

import { useQuery } from '@apollo/client'
import { GET_TRANSACTION } from '@/lib/apollo/queries'

/**
 * Hook to fetch transaction by hash
 */
export function useTransaction(hash: string | null) {
  const { data, loading, error, refetch } = useQuery(GET_TRANSACTION, {
    variables: { hash: hash ?? '' },
    skip: !hash,
  })

  return {
    transaction: data?.transaction,
    loading,
    error,
    refetch,
  }
}
