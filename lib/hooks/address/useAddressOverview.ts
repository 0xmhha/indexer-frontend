'use client'

import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { GET_ADDRESS_OVERVIEW } from '@/lib/apollo/queries'
import { POLLING_INTERVALS } from '@/lib/config/constants'

interface RawAddressOverview {
  address: string
  isContract: boolean
  balance: string
  transactionCount: number
  sentCount: number
  receivedCount: number
  internalTxCount: number
  erc20TokenCount: number
  erc721TokenCount: number
  firstSeen: string | null
  lastSeen: string | null
}

export interface AddressOverview {
  address: string
  isContract: boolean
  balance: bigint
  transactionCount: number
  sentCount: number
  receivedCount: number
  internalTxCount: number
  erc20TokenCount: number
  erc721TokenCount: number
  firstSeen: bigint | null
  lastSeen: bigint | null
}

/**
 * Hook to fetch comprehensive address overview including isContract flag
 */
export function useAddressOverview(address: string | null) {
  const { data, loading, error, previousData } = useQuery(GET_ADDRESS_OVERVIEW, {
    variables: {
      address: address ?? '',
    },
    skip: !address,
    returnPartialData: true,
    pollInterval: POLLING_INTERVALS.SLOW,
    notifyOnNetworkStatusChange: false,
  })

  const effectiveData = data ?? previousData
  const rawOverview: RawAddressOverview | null = effectiveData?.addressOverview ?? null

  const overview = useMemo((): AddressOverview | null => {
    if (!rawOverview) return null

    return {
      address: rawOverview.address,
      isContract: rawOverview.isContract,
      balance: BigInt(rawOverview.balance),
      transactionCount: rawOverview.transactionCount,
      sentCount: rawOverview.sentCount,
      receivedCount: rawOverview.receivedCount,
      internalTxCount: rawOverview.internalTxCount,
      erc20TokenCount: rawOverview.erc20TokenCount,
      erc721TokenCount: rawOverview.erc721TokenCount,
      firstSeen: rawOverview.firstSeen ? BigInt(rawOverview.firstSeen) : null,
      lastSeen: rawOverview.lastSeen ? BigInt(rawOverview.lastSeen) : null,
    }
  }, [rawOverview])

  return useMemo(() => ({
    overview,
    isContract: overview?.isContract ?? false,
    loading,
    error,
  }), [overview, loading, error])
}
