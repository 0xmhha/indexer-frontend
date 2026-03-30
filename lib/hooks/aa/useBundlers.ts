/**
 * Hook to fetch Bundler list
 *
 * Delegates to useBundlerList which aggregates data from recent UserOps.
 * Returns BundlerWithStats[] (real data from backend stats queries).
 */

'use client'

import { useBundlerList } from './useBundlerList'
import type { BundlerWithStats } from '@/types/aa'

interface UseBundlersResult {
  bundlers: BundlerWithStats[]
  totalCount: number
  loading: boolean
  error: Error | null
}

export function useBundlers(): UseBundlersResult {
  return useBundlerList()
}
