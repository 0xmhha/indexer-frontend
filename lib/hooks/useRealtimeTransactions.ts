'use client'

import { useEffect, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/lib/providers/WebSocketProvider'
import {
  transformTransaction,
  type RawTransaction,
  type TransformedTransaction,
} from '@/lib/utils/graphql-transforms'

interface RealtimeTransactionsOptions {
  /** Callback when a new transaction is received */
  onNewTransaction?: (transaction: TransformedTransaction) => void
  /** Whether to automatically subscribe on mount */
  autoSubscribe?: boolean
}

interface RealtimeTransactionsResult {
  /** Whether WebSocket is connected */
  isConnected: boolean
  /** Latest transaction received via WebSocket */
  latestTransaction: TransformedTransaction | null
  /** Subscribe to new transactions */
  subscribe: () => void
  /** Unsubscribe from new transactions */
  unsubscribe: () => void
}

/**
 * Hook for real-time transaction updates via WebSocket
 *
 * @example
 * ```tsx
 * const { isConnected, latestTransaction } = useRealtimeTransactions({
 *   onNewTransaction: (tx) => console.log('New tx:', tx.hash),
 *   autoSubscribe: true
 * })
 * ```
 */
export function useRealtimeTransactions(
  options: RealtimeTransactionsOptions = {}
): RealtimeTransactionsResult {
  const { onNewTransaction, autoSubscribe = true } = options
  const { client, isConnected, lastMessage } = useWebSocket()
  const queryClient = useQueryClient()
  const [latestTransaction, setLatestTransaction] = useState<TransformedTransaction | null>(null)

  const subscribe = useCallback(() => {
    if (client) {
      client.subscribe('newTransaction')
    }
  }, [client])

  const unsubscribe = useCallback(() => {
    if (client) {
      client.unsubscribe('newTransaction')
    }
  }, [client])

  // Auto-subscribe on mount
  useEffect(() => {
    if (autoSubscribe && client && isConnected) {
      subscribe()
    }

    return () => {
      if (autoSubscribe && client) {
        unsubscribe()
      }
    }
  }, [autoSubscribe, client, isConnected, subscribe, unsubscribe])

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage?.type === 'newTransaction' && lastMessage.data) {
      try {
        const rawTransaction = lastMessage.data as RawTransaction
        const transformedTransaction = transformTransaction(rawTransaction)
        // This is a valid use case - updating state based on external WebSocket event
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLatestTransaction(transformedTransaction)

        // Invalidate related queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        queryClient.invalidateQueries({ queryKey: ['networkMetrics'] })

        // Call user callback
        if (onNewTransaction) {
          onNewTransaction(transformedTransaction)
        }
      } catch (error) {
        console.error('[useRealtimeTransactions] Failed to transform transaction:', error)
      }
    }
  }, [lastMessage, queryClient, onNewTransaction])

  return {
    isConnected,
    latestTransaction,
    subscribe,
    unsubscribe,
  }
}
