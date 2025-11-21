'use client'

import { useState, useEffect } from 'react'
import { useSubscription, useQuery } from '@apollo/client'
import {
  SUBSCRIBE_NEW_BLOCK,
  SUBSCRIBE_NEW_TRANSACTION,
  SUBSCRIBE_PENDING_TRANSACTIONS,
  SUBSCRIBE_LOGS,
  GET_LATEST_HEIGHT,
} from '@/lib/apollo/queries'
import { transformBlock, transformTransaction } from '@/lib/utils/graphql-transforms'
import type { RawBlock, Block, RawTransaction, Transaction, RawLog, Log } from '@/types/graphql'

/**
 * Log filter options for subscription
 */
export interface LogFilter {
  address?: string
  addresses?: string[]
  topics?: (string | string[] | null)[]
  fromBlock?: string
  toBlock?: string
}

/**
 * Hook to subscribe to new pending transactions in real-time
 *
 * @param maxTransactions - Maximum number of transactions to keep in memory (default: 50)
 * @returns Object containing pending transactions array, loading state, and error
 *
 * @example
 * ```tsx
 * const { pendingTransactions, loading, error } = usePendingTransactions(100)
 * ```
 */
export function usePendingTransactions(maxTransactions = 50) {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([])

  const { data, loading, error } = useSubscription(SUBSCRIBE_PENDING_TRANSACTIONS, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      console.error('[Pending Transactions Subscription Error]:', error)
    },
  })

  useEffect(() => {
    if (data?.newPendingTransactions) {
      const rawTx = data.newPendingTransactions as RawTransaction
      const transformedTx = transformTransaction(rawTx)

      // Legitimate use case: updating state from external subscription data
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingTransactions((prev) => {
        // Add new transaction at the beginning
        const updated = [transformedTx, ...prev]
        // Keep only the most recent maxTransactions
        return updated.slice(0, maxTransactions)
      })
    }
  }, [data, maxTransactions])

  return {
    pendingTransactions,
    loading,
    error,
  }
}

/**
 * Hook to subscribe to logs with filtering
 *
 * @param filter - Filter for logs (address, topics, block range). All fields are optional but filter object is required.
 * @param maxLogs - Maximum number of logs to keep in memory (default: 100)
 * @returns Object containing logs array, loading state, and error
 *
 * @example
 * ```tsx
 * // Subscribe to all Transfer events from a specific contract
 * const { logs, loading, error } = useLogs({
 *   address: '0x...',
 *   topics: ['0xddf252ad...'] // Transfer event signature
 * })
 *
 * // Subscribe to all logs (empty filter)
 * const { logs, loading, error } = useLogs({})
 * ```
 */
export function useLogs(filter: LogFilter = {}, maxLogs = 100) {
  const [logs, setLogs] = useState<Log[]>([])

  const { data, loading, error } = useSubscription(SUBSCRIBE_LOGS, {
    fetchPolicy: 'no-cache',
    variables: { filter },
    onError: (error) => {
      console.error('[Logs Subscription Error]:', error)
    },
  })

  useEffect(() => {
    if (data?.logs) {
      const rawLog = data.logs as RawLog
      const transformedLog: Log = {
        address: rawLog.address,
        topics: rawLog.topics,
        data: rawLog.data,
        blockNumber: BigInt(rawLog.blockNumber),
        transactionHash: rawLog.transactionHash,
        logIndex: rawLog.logIndex,
      }

      // Legitimate use case: updating state from external subscription data
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogs((prev) => {
        // Add new log at the beginning
        const updated = [transformedLog, ...prev]
        // Keep only the most recent maxLogs
        return updated.slice(0, maxLogs)
      })
    }
  }, [data, maxLogs])

  /**
   * Clear all accumulated logs
   */
  const clearLogs = () => {
    setLogs([])
  }

  return {
    logs,
    loading,
    error,
    clearLogs,
  }
}

/**
 * Hook to subscribe to new blocks in real-time with initial data loading
 *
 * @param maxBlocks - Maximum number of blocks to keep in memory (default: 20)
 * @returns Object containing blocks array, loading state, error, and latest block
 *
 * @example
 * ```tsx
 * const { blocks, latestBlock, loading, error } = useNewBlocks(50)
 * ```
 */
export function useNewBlocks(maxBlocks = 20) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [latestBlock, setLatestBlock] = useState<Block | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Get latest height for initial data loading
  const { data: heightData } = useQuery(GET_LATEST_HEIGHT, {
    fetchPolicy: 'cache-first',
  })

  // Subscribe to new blocks
  const { data: subscriptionData, loading, error } = useSubscription(SUBSCRIBE_NEW_BLOCK, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      console.error('[New Block Subscription Error]:', error)
    },
  })

  // Load initial blocks when we have the latest height (only once)
  useEffect(() => {
    if (heightData?.latestHeight && !initialized) {
      setInitialized(true) // Set immediately to prevent re-execution

      const latestHeight = BigInt(heightData.latestHeight)
      const blocksToFetch: bigint[] = []

      // Calculate block numbers to fetch (latest N blocks)
      for (let i = 0; i < maxBlocks; i++) {
        const blockNum = latestHeight - BigInt(i)
        if (blockNum >= 0n) {
          blocksToFetch.push(blockNum)
        }
      }

      // Fetch blocks in parallel
      Promise.all(
        blocksToFetch.map(async (blockNum) => {
          try {
            const response = await fetch(
              `http://localhost:8080/graphql`,
              {
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
              }
            )
            const result = await response.json()
            return result.data?.block ? transformBlock(result.data.block as RawBlock) : null
          } catch (err) {
            console.error('[useNewBlocks] Failed to fetch block', blockNum, err)
            return null
          }
        })
      ).then((fetchedBlocks) => {
        const validBlocks = fetchedBlocks.filter((b): b is Block => b !== null)
        if (validBlocks.length > 0) {
          setBlocks(validBlocks)
          const firstBlock = validBlocks[0]
          if (firstBlock) {
            setLatestBlock(firstBlock)
          }
        }
      })
    }
  }, [heightData, initialized, maxBlocks])

  // Update from subscription (real-time updates)
  useEffect(() => {
    if (subscriptionData?.newBlock) {
      const rawBlock = subscriptionData.newBlock as RawBlock
      const transformedBlock = transformBlock(rawBlock)

      // Legitimate use case: updating state from external subscription data
      setLatestBlock(transformedBlock)

      // Legitimate use case: updating state from external subscription data
      setBlocks((prev) => {
        // Add new block at the beginning
        const updated = [transformedBlock, ...prev]
        // Keep only the most recent maxBlocks
        return updated.slice(0, maxBlocks)
      })
    }
  }, [subscriptionData, maxBlocks])

  /**
   * Clear all accumulated blocks
   */
  const clearBlocks = () => {
    setBlocks([])
    setLatestBlock(null)
    setInitialized(false)
  }

  return {
    blocks,
    latestBlock,
    loading: loading && !initialized,
    error,
    clearBlocks,
  }
}

/**
 * Hook to subscribe to new confirmed transactions in real-time
 *
 * @param maxTransactions - Maximum number of transactions to keep in memory (default: 50)
 * @returns Object containing transactions array, loading state, and error
 *
 * @example
 * ```tsx
 * const { transactions, loading, error } = useNewTransactions(100)
 * ```
 */
export function useNewTransactions(maxTransactions = 50) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const { data, loading, error } = useSubscription(SUBSCRIBE_NEW_TRANSACTION, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      console.error('[New Transaction Subscription Error]:', error)
    },
  })

  useEffect(() => {
    if (data?.newTransaction) {
      const rawTx = data.newTransaction as RawTransaction
      const transformedTx = transformTransaction(rawTx)

      // Legitimate use case: updating state from external subscription data
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransactions((prev) => {
        // Add new transaction at the beginning
        const updated = [transformedTx, ...prev]
        // Keep only the most recent maxTransactions
        return updated.slice(0, maxTransactions)
      })
    }
  }, [data, maxTransactions])

  /**
   * Clear all accumulated transactions
   */
  const clearTransactions = () => {
    setTransactions([])
  }

  return {
    transactions,
    loading,
    error,
    clearTransactions,
  }
}
