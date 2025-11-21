'use client'

import { useState, useEffect } from 'react'
import { useSubscription } from '@apollo/client'
import { SUBSCRIBE_PENDING_TRANSACTIONS, SUBSCRIBE_LOGS } from '@/lib/apollo/queries'
import { transformTransaction } from '@/lib/utils/graphql-transforms'
import type { RawTransaction, Transaction, RawLog, Log } from '@/types/graphql'

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
 * Hook to subscribe to logs with optional filtering
 *
 * @param filter - Optional filter for logs (address, topics, block range)
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
 * ```
 */
export function useLogs(filter?: LogFilter, maxLogs = 100) {
  const [logs, setLogs] = useState<Log[]>([])

  const { data, loading, error } = useSubscription(SUBSCRIBE_LOGS, {
    ...(filter && { variables: { filter } }),
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
