'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { GET_BLOCKS_BY_TIME_RANGE, GET_NETWORK_METRICS } from '@/lib/apollo/queries'
import { transformBlocks, type TransformedBlock } from '@/lib/utils/graphql-transforms'
import { toBigInt } from '@/lib/utils/graphql-transforms'
import type { MinerStats } from '@/types/graphql'

/**
 * Hook to fetch blocks in a time range for analytics
 */
export function useBlocksByTimeRange(fromTime: bigint, toTime: bigint, limit = 1000) {
  const { data, loading, error, previousData } = useQuery(GET_BLOCKS_BY_TIME_RANGE, {
    variables: {
      fromTime: fromTime.toString(),
      toTime: toTime.toString(),
      limit,
    },
    skip: fromTime === BigInt(0) || toTime === BigInt(0),
    returnPartialData: true,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  const rawBlocks = effectiveData?.blocksByTimeRange?.nodes ?? []
  const blocks: TransformedBlock[] = transformBlocks(rawBlocks)
  const totalCount = effectiveData?.blocksByTimeRange?.totalCount ?? 0

  return {
    blocks,
    totalCount,
    loading,
    error,
  }
}

/**
 * Hook to fetch network metrics (block count and transaction count)
 */
export function useNetworkMetrics() {
  const { data, loading, error, previousData } = useQuery(GET_NETWORK_METRICS, {
    returnPartialData: true,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  return {
    blockCount: effectiveData?.blockCount ? toBigInt(effectiveData.blockCount) : null,
    transactionCount: effectiveData?.transactionCount ? toBigInt(effectiveData.transactionCount) : null,
    loading,
    error,
  }
}

/**
 * Hook to fetch top miners statistics
 * Note: Uses mock data until backend API is implemented
 */
export function useTopMiners(limit = 10) {
  const [miners, setMiners] = useState<MinerStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call with mock data
    const timer = setTimeout(() => {
      const mockMiners: MinerStats[] = [
        {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          blockCount: 1523,
          lastBlockNumber: BigInt(125678),
          percentage: 15.23,
        },
        {
          address: '0x8932Eb23BAD9bDdB5cF81426F78279A53c6c3b71',
          blockCount: 1342,
          lastBlockNumber: BigInt(125645),
          percentage: 13.42,
        },
        {
          address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
          blockCount: 1187,
          lastBlockNumber: BigInt(125634),
          percentage: 11.87,
        },
        {
          address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
          blockCount: 1045,
          lastBlockNumber: BigInt(125621),
          percentage: 10.45,
        },
        {
          address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
          blockCount: 987,
          lastBlockNumber: BigInt(125598),
          percentage: 9.87,
        },
        {
          address: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
          blockCount: 876,
          lastBlockNumber: BigInt(125576),
          percentage: 8.76,
        },
        {
          address: '0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b',
          blockCount: 754,
          lastBlockNumber: BigInt(125554),
          percentage: 7.54,
        },
        {
          address: '0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d',
          blockCount: 689,
          lastBlockNumber: BigInt(125532),
          percentage: 6.89,
        },
        {
          address: '0xd03ea8624C8C5987235048901fB614fDcA89b117',
          blockCount: 621,
          lastBlockNumber: BigInt(125510),
          percentage: 6.21,
        },
        {
          address: '0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC',
          blockCount: 567,
          lastBlockNumber: BigInt(125489),
          percentage: 5.67,
        },
      ].slice(0, limit)

      setMiners(mockMiners)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [limit])

  return {
    miners,
    loading,
    error: null,
  }
}
