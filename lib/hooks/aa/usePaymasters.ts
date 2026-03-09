/**
 * Hook to fetch Paymaster list
 *
 * Currently uses mock data. Will switch to GraphQL when indexer schema is ready.
 * TODO: Replace mock data with actual GET_PAYMASTERS query
 */

'use client'

import { useState } from 'react'
import { MOCK_PAYMASTERS } from './mock-data'
import type { Paymaster } from '@/types/aa'

interface UsePaymastersResult {
  paymasters: Paymaster[]
  totalCount: number
  loading: boolean
  error: Error | null
}

export function usePaymasters(): UsePaymastersResult {
  // TODO: Replace with useQuery(GET_PAYMASTERS)
  const [loading] = useState(false)
  const [error] = useState<Error | null>(null)

  return {
    paymasters: MOCK_PAYMASTERS,
    totalCount: MOCK_PAYMASTERS.length,
    loading,
    error,
  }
}
