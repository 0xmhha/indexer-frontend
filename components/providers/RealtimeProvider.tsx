'use client'

/**
 * RealtimeProvider - Single WebSocket Subscription Source
 *
 * This component is the ONLY place that subscribes to WebSocket data.
 * All other components should read from the Zustand store instead of subscribing directly.
 *
 * This prevents the "Maximum update depth exceeded" error caused by multiple
 * components subscribing and triggering cascading re-renders.
 */

import { useEffect, useRef } from 'react'
import { useSubscription } from '@apollo/client'
import {
  SUBSCRIBE_NEW_BLOCK,
  SUBSCRIBE_NEW_TRANSACTION,
  SUBSCRIBE_PENDING_TRANSACTIONS,
} from '@/lib/apollo/queries'
import {
  useRealtimeStore,
  type RealtimeBlock,
  type RealtimeTransaction,
} from '@/stores/realtimeStore'

interface RealtimeProviderProps {
  children: React.ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  // Get stable action references from store
  const setConnected = useRealtimeStore((s) => s.setConnected)
  const setLatestBlock = useRealtimeStore((s) => s.setLatestBlock)
  const setLatestTransaction = useRealtimeStore((s) => s.setLatestTransaction)
  const addPendingTransaction = useRealtimeStore((s) => s.addPendingTransaction)

  // Track if we've received any data (for connection status)
  const hasReceivedData = useRef(false)

  // =========================================================================
  // Block Subscription
  // =========================================================================
  const { error: blockError } = useSubscription<{ newBlock: RealtimeBlock }>(
    SUBSCRIBE_NEW_BLOCK,
    {
      fetchPolicy: 'no-cache',
      onData: ({ data }) => {
        if (data.data?.newBlock) {
          hasReceivedData.current = true
          setLatestBlock(data.data.newBlock)
        }
      },
      onError: (error) => {
        console.error('[RealtimeProvider] Block subscription error:', error.message)
        setConnected(false)
      },
    }
  )

  // =========================================================================
  // Transaction Subscription
  // =========================================================================
  const { error: txError } = useSubscription<{ newTransaction: RealtimeTransaction }>(
    SUBSCRIBE_NEW_TRANSACTION,
    {
      fetchPolicy: 'no-cache',
      onData: ({ data }) => {
        if (data.data?.newTransaction) {
          hasReceivedData.current = true
          setLatestTransaction(data.data.newTransaction)
        }
      },
      onError: (error) => {
        console.error('[RealtimeProvider] Transaction subscription error:', error.message)
      },
    }
  )

  // =========================================================================
  // Pending Transactions Subscription
  // =========================================================================
  const { error: pendingError } = useSubscription<{
    newPendingTransactions: RealtimeTransaction
  }>(SUBSCRIBE_PENDING_TRANSACTIONS, {
    fetchPolicy: 'no-cache',
    onData: ({ data }) => {
      if (data.data?.newPendingTransactions) {
        addPendingTransaction(data.data.newPendingTransactions)
      }
    },
    onError: (error) => {
      console.error('[RealtimeProvider] Pending tx subscription error:', error.message)
    },
  })

  // =========================================================================
  // Connection Status Management
  // =========================================================================
  useEffect(() => {
    // If any subscription has an error, mark as disconnected
    if (blockError || txError || pendingError) {
      setConnected(false)
    } else if (hasReceivedData.current) {
      setConnected(true)
    }
  }, [blockError, txError, pendingError, setConnected])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hasReceivedData.current = false
    }
  }, [])

  return <>{children}</>
}
