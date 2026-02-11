'use client'

import { useQuery } from '@apollo/client'
import { GET_ADDRESS_STATS } from '@/lib/apollo/queries'

export interface AddressStats {
  address: string
  totalTransactions: number
  sentCount: number
  receivedCount: number
  successCount: number
  failedCount: number
  totalGasUsed: string
  totalGasCost: string
  totalValueSent: string
  totalValueReceived: string
  contractInteractionCount: number
  uniqueAddressCount: number
  firstTransactionTimestamp: string | null
  lastTransactionTimestamp: string | null
}

/**
 * Hook to fetch pre-computed address statistics from backend
 */
export function useAddressStats(address: string | null) {
  const { data, loading, error, previousData, refetch } = useQuery<{ addressStats: AddressStats }>(
    GET_ADDRESS_STATS,
    {
      variables: { address: address ?? '' },
      skip: !address,
      returnPartialData: true,
    }
  )

  const effectiveData = data ?? previousData
  const stats: AddressStats | null = effectiveData?.addressStats ?? null

  return {
    stats,
    loading,
    error,
    refetch,
  }
}
