'use client'

/**
 * RealtimeProvider - Single WebSocket Subscription Source
 *
 * This component is the ONLY place that subscribes to WebSocket data.
 * All other components should read from the Zustand store instead of subscribing directly.
 *
 * This prevents the "Maximum update depth exceeded" error caused by multiple
 * components subscribing and triggering cascading re-renders.
 *
 * Uses replayLast parameter to receive recent events immediately on connection,
 * solving the "empty page" problem on initial load.
 */

import { useEffect, useRef, useMemo } from 'react'
import { useSubscription } from '@apollo/client'
import {
  SUBSCRIBE_NEW_BLOCK,
  SUBSCRIBE_NEW_TRANSACTION,
  SUBSCRIBE_PENDING_TRANSACTIONS,
} from '@/lib/apollo/queries'
import { REPLAY } from '@/lib/config/constants'
import {
  useRealtimeStore,
  type RealtimeBlock,
  type RealtimeTransaction,
} from '@/stores/realtimeStore'

interface RealtimeProviderProps {
  children: React.ReactNode
  /** Number of recent blocks to replay on connection (default: REPLAY.BLOCKS_DEFAULT) */
  replayBlocks?: number
  /** Number of recent transactions to replay on connection (default: REPLAY.TRANSACTIONS_DEFAULT) */
  replayTransactions?: number
}

export function RealtimeProvider({
  children,
  replayBlocks = REPLAY.BLOCKS_DEFAULT,
  replayTransactions = REPLAY.TRANSACTIONS_DEFAULT,
}: RealtimeProviderProps) {
  // Get stable action references from store
  const setConnected = useRealtimeStore((s) => s.setConnected)
  const setLatestBlock = useRealtimeStore((s) => s.setLatestBlock)
  const setLatestTransaction = useRealtimeStore((s) => s.setLatestTransaction)
  const addPendingTransaction = useRealtimeStore((s) => s.addPendingTransaction)

  // Track if we've received any data (for connection status)
  const hasReceivedData = useRef(false)

  // Memoize subscription variables to prevent re-subscription
  const blockVariables = useMemo(() => ({ replayLast: replayBlocks }), [replayBlocks])
  const txVariables = useMemo(() => ({ replayLast: replayTransactions }), [replayTransactions])

  // =========================================================================
  // Block Subscription (with replay for instant data on connection)
  // =========================================================================
  const { error: blockError } = useSubscription<{ newBlock: RealtimeBlock }>(
    SUBSCRIBE_NEW_BLOCK,
    {
      variables: blockVariables,
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
  // Transaction Subscription (with replay for instant data on connection)
  // =========================================================================
  const { error: txError } = useSubscription<{ newTransaction: RealtimeTransaction }>(
    SUBSCRIBE_NEW_TRANSACTION,
    {
      variables: txVariables,
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
  // Pending Transactions Subscription (no replay - pending txs are ephemeral)
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
