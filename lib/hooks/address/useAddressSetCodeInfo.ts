'use client'

import { useQuery } from '@apollo/client'
import { GET_ADDRESS_SETCODE_INFO } from '@/lib/apollo/queries'
import { POLLING_INTERVALS } from '@/lib/config/constants'

export interface AddressSetCodeInfo {
  address: string
  hasDelegation: boolean
  delegationTarget: string | null
  asAuthorityCount: number
  asTargetCount: number
  lastActivityBlock: string | null
  lastActivityTimestamp: string | null
}

/**
 * Hook to fetch EIP-7702 SetCode delegation info for an address
 */
export function useAddressSetCodeInfo(address: string | null) {
  const { data, loading, error, previousData } = useQuery(GET_ADDRESS_SETCODE_INFO, {
    variables: {
      address: address ?? '',
    },
    skip: !address,
    returnPartialData: true,
    pollInterval: POLLING_INTERVALS.SLOW,
    notifyOnNetworkStatusChange: false,
  })

  const effectiveData = data ?? previousData
  const info: AddressSetCodeInfo | null = effectiveData?.addressSetCodeInfo ?? null

  return {
    info,
    hasDelegation: info?.hasDelegation ?? false,
    delegationTarget: info?.delegationTarget ?? null,
    loading,
    error,
  }
}
