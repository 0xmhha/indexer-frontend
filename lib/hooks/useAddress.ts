'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { GET_ADDRESS_BALANCE, GET_TRANSACTIONS_BY_ADDRESS, GET_BALANCE_HISTORY } from '@/lib/apollo/queries'
import type { TokenBalance } from '@/types/graphql'

/**
 * Hook to fetch address balance
 */
export function useAddressBalance(address: string | null, blockNumber?: string) {
  const { data, loading, error, previousData } = useQuery(GET_ADDRESS_BALANCE, {
    variables: {
      address: address ?? '',
      blockNumber: blockNumber ?? null,
    },
    skip: !address,
    returnPartialData: true,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  return {
    balance: effectiveData?.addressBalance ? BigInt(effectiveData.addressBalance) : null,
    loading,
    error,
  }
}

/**
 * Hook to fetch transactions by address
 */
export function useAddressTransactions(address: string | null, limit = 10, offset = 0) {
  const { data, loading, error, fetchMore, previousData } = useQuery(GET_TRANSACTIONS_BY_ADDRESS, {
    variables: {
      address: address ?? '',
      limit,
      offset,
    },
    skip: !address,
    returnPartialData: true,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  const transactions = effectiveData?.transactionsByAddress?.nodes ?? []
  const totalCount = effectiveData?.transactionsByAddress?.totalCount ?? 0
  const pageInfo = effectiveData?.transactionsByAddress?.pageInfo

  return {
    transactions,
    totalCount,
    pageInfo,
    loading,
    error,
    fetchMore,
  }
}

/**
 * Hook to fetch balance history for an address
 */
export function useBalanceHistory(
  address: string | null,
  fromBlock: bigint,
  toBlock: bigint,
  limit = 100
) {
  const { data, loading, error, previousData } = useQuery(GET_BALANCE_HISTORY, {
    variables: {
      address: address ?? '',
      fromBlock: fromBlock.toString(),
      toBlock: toBlock.toString(),
      limit,
      offset: 0,
    },
    skip: !address,
    returnPartialData: true,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  const history = effectiveData?.balanceHistory?.nodes ?? []
  const totalCount = effectiveData?.balanceHistory?.totalCount ?? 0

  return {
    history,
    totalCount,
    loading,
    error,
  }
}

/**
 * Hook to fetch token balances for an address
 * Note: Uses mock data until backend API is implemented
 */
export function useTokenBalances(address: string | null) {
  const [state, setState] = useState<{
    balances: TokenBalance[]
    loading: boolean
  }>({
    balances: [],
    loading: !address ? false : true,
  })

  useEffect(() => {
    if (!address) {
      return
    }

    // Simulate API call with mock data
    const timer = setTimeout(() => {
      const mockBalances: TokenBalance[] = [
        {
          contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          tokenType: 'ERC-20',
          balance: BigInt('1250500000'), // 1,250.50 USDC (6 decimals)
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6,
        },
        {
          contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          tokenType: 'ERC-20',
          balance: BigInt('500000000000000000000'), // 500 DAI (18 decimals)
          name: 'Dai Stablecoin',
          symbol: 'DAI',
          decimals: 18,
        },
        {
          contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          tokenType: 'ERC-20',
          balance: BigInt('10000000000'), // 10,000 USDT (6 decimals)
          name: 'Tether USD',
          symbol: 'USDT',
          decimals: 6,
        },
        {
          contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
          tokenType: 'ERC-721',
          balance: BigInt('3'), // 3 NFTs
          name: 'Bored Ape Yacht Club',
          symbol: 'BAYC',
          decimals: null,
        },
        {
          contractAddress: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
          tokenType: 'ERC-721',
          balance: BigInt('12'), // 12 NFTs
          name: 'Mutant Ape Yacht Club',
          symbol: 'MAYC',
          decimals: null,
        },
        {
          contractAddress: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
          tokenType: 'ERC-1155',
          balance: BigInt('47'), // 47 items
          name: 'OpenSea Shared Storefront',
          symbol: 'OPENSTORE',
          decimals: null,
        },
        {
          contractAddress: '0x2953399124F0cBB46d2CbACD8A89cF0599974963',
          tokenType: 'ERC-20',
          balance: BigInt('2500000000000000000000'), // 2,500 (18 decimals)
          name: 'Wrapped Ether',
          symbol: 'WETH',
          decimals: 18,
        },
        {
          contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
          tokenType: 'ERC-20',
          balance: BigInt('15750000000000000000000'), // 15,750 UNI (18 decimals)
          name: 'Uniswap',
          symbol: 'UNI',
          decimals: 18,
        },
      ]

      setState({ balances: mockBalances, loading: false })
    }, 500)

    return () => clearTimeout(timer)
  }, [address])

  return {
    balances: state.balances,
    loading: state.loading,
    error: null,
  }
}
