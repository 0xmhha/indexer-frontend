'use client'

import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { GET_ADDRESS_BALANCE } from '@/lib/apollo/queries'
import { POLLING_INTERVALS } from '@/lib/config/constants'

/**
 * Hook to fetch address balance with auto-refresh
 */
export function useAddressBalance(address: string | null, blockNumber?: string) {
  const { data, loading, error, previousData } = useQuery(GET_ADDRESS_BALANCE, {
    variables: {
      address: address ?? '',
      blockNumber: blockNumber ?? null,
    },
    skip: !address,
    returnPartialData: true,
    pollInterval: POLLING_INTERVALS.FAST,
    notifyOnNetworkStatusChange: false,
  })

  const effectiveData = data ?? previousData

  return useMemo(() => ({
    balance: effectiveData?.addressBalance !== null && effectiveData?.addressBalance !== undefined ? BigInt(effectiveData.addressBalance) : null,
    loading,
    error,
  }), [effectiveData?.addressBalance, loading, error])
}
