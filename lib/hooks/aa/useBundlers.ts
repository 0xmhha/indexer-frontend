/**
 * Hook to fetch Bundler list
 *
 * Currently uses mock data. Will switch to GraphQL when indexer schema is ready.
 * TODO: Replace mock data with actual GET_BUNDLERS query
 */

'use client'

import { useState } from 'react'
import { MOCK_BUNDLERS } from './mock-data'
import type { Bundler } from '@/types/aa'

interface UseBundlersResult {
  bundlers: Bundler[]
  totalCount: number
  loading: boolean
  error: Error | null
}

export function useBundlers(): UseBundlersResult {
  // TODO: Replace with useQuery(GET_BUNDLERS)
  const [loading] = useState(false)
  const [error] = useState<Error | null>(null)

  return {
    bundlers: MOCK_BUNDLERS,
    totalCount: MOCK_BUNDLERS.length,
    loading,
    error,
  }
}
