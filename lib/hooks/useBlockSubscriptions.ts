'use client'

/**
 * Block & Transaction Subscription Hooks
 * Real-time block and transaction subscriptions via centralized store
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { GET_LATEST_HEIGHT } from '@/lib/apollo/queries'
import {
  transformBlock,
  transformTransaction,
} from '@/lib/utils/graphql-transforms'
import type {
  RawBlock,
  Block,
  RawTransaction,
} from '@/types/graphql'
import { env } from '@/lib/config/env'
import { REALTIME } from '@/lib/config/constants'
import { errorLogger } from '@/lib/errors/logger'
import {
  useRealtimeStore,
  selectRecentBlocks,
  selectLatestBlock,
  selectRecentTransactions,
  selectPendingTransactions,
  selectIsConnected,
  type RealtimeBlock,
} from '@/stores/realtimeStore'

/**
 * Convert RealtimeBlock to RawBlock for transformation.
 * RealtimeBlock is a subset of RawBlock - all extra RawBlock fields are optional
 * and handled with defaults by transformBlock.
 */
function toRawBlock(block: RealtimeBlock): RawBlock {
  return {
    number: block.number,
    hash: block.hash,
    ...(block.parentHash != null && { parentHash: block.parentHash }),
    timestamp: block.timestamp,
    ...(block.miner != null && { miner: block.miner }),
    ...(block.transactionCount != null && { transactionCount: block.transactionCount }),
  }
}

/**
 * Transaction filter options for subscription
 */
export interface TransactionFilter {
  from?: string
  to?: string
}

/**
 * Hook to get pending transactions from centralized store
 */
export function usePendingTransactions(maxTransactions: number = REALTIME.MAX_PENDING_TRANSACTIONS) {
  const allPending = useRealtimeStore(selectPendingTransactions)
  const isConnected = useRealtimeStore(selectIsConnected)

  const pendingTransactions = useMemo(() => {
    return allPending.slice(0, maxTransactions).map((tx) => transformTransaction(tx as RawTransaction))
  }, [allPending, maxTransactions])

  return {
    pendingTransactions,
    loading: !isConnected && pendingTransactions.length === 0,
    error: null,
  }
}

/**
 * Hook to get blocks from centralized store with initial data loading
 */
export function useNewBlocks(maxBlocks: number = REALTIME.MAX_BLOCKS) {
  const [initialBlocks, setInitialBlocks] = useState<Block[]>([])
  const [initialized, setInitialized] = useState(false)

  const realtimeBlocks = useRealtimeStore(selectRecentBlocks)
  const realtimeLatestBlock = useRealtimeStore(selectLatestBlock)
  const isConnected = useRealtimeStore(selectIsConnected)

  const { data: heightData } = useQuery(GET_LATEST_HEIGHT, {
    fetchPolicy: 'cache-first',
  })

  useEffect(() => {
    if (heightData?.latestHeight && !initialized) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialized(true)

      const latestHeight = BigInt(heightData.latestHeight)
      const blocksToFetch: bigint[] = []

      for (let i = 0; i < maxBlocks; i++) {
        const blockNum = latestHeight - BigInt(i)
        if (blockNum >= BigInt(0)) {
          blocksToFetch.push(blockNum)
        }
      }

      Promise.all(
        blocksToFetch.map(async (blockNum) => {
          try {
            const response = await fetch(env.graphqlEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                  query GetBlock($number: String!) {
                    block(number: $number) {
                      number
                      hash
                      parentHash
                      timestamp
                      miner
                      gasUsed
                      gasLimit
                      size
                      transactionCount
                    }
                  }
                `,
                variables: { number: blockNum.toString() },
              }),
            })
            const result = await response.json()
            return result.data?.block ? transformBlock(result.data.block as RawBlock) : null
          } catch (err) {
            errorLogger.error(err, { component: 'useNewBlocks', action: 'fetch-block', metadata: { blockNumber: blockNum } })
            return null
          }
        })
      ).then((fetchedBlocks) => {
        const validBlocks = fetchedBlocks.filter((b): b is Block => b !== null)
        if (validBlocks.length > 0) {
          setInitialBlocks(validBlocks)
        }
      })
    }
  }, [heightData, initialized, maxBlocks])

  const blocks = useMemo(() => {
    const realtimeTransformed = realtimeBlocks.map((b) => transformBlock(toRawBlock(b)))
    const merged = [...realtimeTransformed]

    initialBlocks.forEach((block) => {
      if (!merged.some((b) => b.hash === block.hash)) {
        merged.push(block)
      }
    })

    return merged
      .sort((a, b) => (b.number > a.number ? 1 : -1))
      .slice(0, maxBlocks)
  }, [realtimeBlocks, initialBlocks, maxBlocks])

  const latestBlock = useMemo(() => {
    if (realtimeLatestBlock) {
      return transformBlock(toRawBlock(realtimeLatestBlock))
    }
    return blocks[0] ?? null
  }, [realtimeLatestBlock, blocks])

  const clearBlocks = useCallback(() => {
    setInitialBlocks([])
    setInitialized(false)
  }, [])

  return {
    blocks,
    latestBlock,
    loading: !initialized && !isConnected,
    error: null,
    clearBlocks,
  }
}

/**
 * Hook to get confirmed transactions from centralized store
 */
export function useNewTransactions(maxTransactions: number = REALTIME.MAX_TRANSACTIONS) {
  const realtimeTransactions = useRealtimeStore(selectRecentTransactions)
  const isConnected = useRealtimeStore(selectIsConnected)

  const transactions = useMemo(() => {
    return realtimeTransactions
      .slice(0, maxTransactions)
      .map((tx) => transformTransaction(tx as RawTransaction))
  }, [realtimeTransactions, maxTransactions])

  const clearTransactions = useCallback(() => {
    // No-op for now - store manages its own state
  }, [])

  return {
    transactions,
    loading: !isConnected && transactions.length === 0,
    error: null,
    clearTransactions,
  }
}

/**
 * Hook to get filtered transactions from centralized store
 */
export function useFilteredNewTransactions(
  filter: TransactionFilter = {},
  maxTransactions: number = REALTIME.MAX_TRANSACTIONS
) {
  const realtimeTransactions = useRealtimeStore(selectRecentTransactions)
  const isConnected = useRealtimeStore(selectIsConnected)

  const transactions = useMemo(() => {
    const transformed = realtimeTransactions.map((tx) =>
      transformTransaction(tx as RawTransaction)
    )

    const filtered = transformed.filter((tx) => {
      if (filter.from && tx.from.toLowerCase() !== filter.from.toLowerCase()) {
        return false
      }
      if (filter.to && tx.to?.toLowerCase() !== filter.to.toLowerCase()) {
        return false
      }
      return true
    })

    return filtered.slice(0, maxTransactions)
  }, [realtimeTransactions, filter.from, filter.to, maxTransactions])

  const clearFilteredTransactions = useCallback(() => {
    // No-op for now - store manages its own state
  }, [])

  return {
    transactions,
    loading: !isConnected && transactions.length === 0,
    error: null,
    clearTransactions: clearFilteredTransactions,
  }
}
