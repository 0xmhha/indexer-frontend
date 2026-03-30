/**
 * Hook to fetch Paymaster list
 *
 * Delegates to usePaymasterList which aggregates data from recent UserOps.
 * Returns PaymasterWithStats[] (real data from backend stats queries).
 */

'use client'

import { usePaymasterList } from './usePaymasterList'
import type { PaymasterWithStats } from '@/types/aa'

interface UsePaymastersResult {
  paymasters: PaymasterWithStats[]
  totalCount: number
  loading: boolean
  error: Error | null
}

export function usePaymasters(): UsePaymastersResult {
  return usePaymasterList()
}
