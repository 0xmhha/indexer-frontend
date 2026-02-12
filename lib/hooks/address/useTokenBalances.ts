'use client'

import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { GET_TOKEN_BALANCES } from '@/lib/apollo/queries'
import type { TokenBalance } from '@/types/graphql'
import { POLLING_INTERVALS } from '@/lib/config/constants'

interface RawTokenBalance {
  address: string
  tokenType: string
  balance: string
  tokenId: string | null
  name: string | null
  symbol: string | null
  decimals: number | null
  metadata: string | null
}

/**
 * Hook to fetch token balances for an address with auto-refresh
 */
export function useTokenBalances(address: string | null, tokenType?: string) {
  const { data, loading, error, previousData } = useQuery(GET_TOKEN_BALANCES, {
    variables: {
      address: address ?? '',
      ...(tokenType && { tokenType }),
    },
    skip: !address,
    returnPartialData: true,
    pollInterval: POLLING_INTERVALS.FAST,
    notifyOnNetworkStatusChange: false,
  })

  const effectiveData = data ?? previousData

  const balances = useMemo((): TokenBalance[] => {
    const rawBalances = effectiveData?.tokenBalances ?? []
    return rawBalances.map((balance: RawTokenBalance) => ({
      ...balance,
      balance: BigInt(balance.balance),
    }))
  }, [effectiveData])

  return useMemo(() => ({
    balances,
    loading,
    error,
  }), [balances, loading, error])
}
