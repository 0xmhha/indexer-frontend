'use client'

import { useEffect, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/lib/providers/WebSocketProvider'
import { transformBlock, type RawBlock, type TransformedBlock } from '@/lib/utils/graphql-transforms'

interface RealtimeBlocksOptions {
  /** Callback when a new block is received */
  onNewBlock?: (block: TransformedBlock) => void
  /** Whether to automatically subscribe on mount */
  autoSubscribe?: boolean
}

interface RealtimeBlocksResult {
  /** Whether WebSocket is connected */
  isConnected: boolean
  /** Latest block received via WebSocket */
  latestBlock: TransformedBlock | null
  /** Subscribe to new blocks */
  subscribe: () => void
  /** Unsubscribe from new blocks */
  unsubscribe: () => void
}

/**
 * Hook for real-time block updates via WebSocket
 *
 * @example
 * ```tsx
 * const { isConnected, latestBlock } = useRealtimeBlocks({
 *   onNewBlock: (block) => console.log('New block:', block.number),
 *   autoSubscribe: true
 * })
 * ```
 */
export function useRealtimeBlocks(options: RealtimeBlocksOptions = {}): RealtimeBlocksResult {
  const { onNewBlock, autoSubscribe = true } = options
  const { client, isConnected, lastMessage } = useWebSocket()
  const queryClient = useQueryClient()
  const [latestBlock, setLatestBlock] = useState<TransformedBlock | null>(null)

  const subscribe = useCallback(() => {
    if (client) {
      client.subscribe('newBlock')
    }
  }, [client])

  const unsubscribe = useCallback(() => {
    if (client) {
      client.unsubscribe('newBlock')
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
    if (lastMessage?.type === 'newBlock' && lastMessage.data) {
      try {
        const rawBlock = lastMessage.data as RawBlock
        const transformedBlock = transformBlock(rawBlock)
        // This is a valid use case - updating state based on external WebSocket event
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLatestBlock(transformedBlock)

        // Invalidate related queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['blocks'] })
        queryClient.invalidateQueries({ queryKey: ['latestHeight'] })
        queryClient.invalidateQueries({ queryKey: ['networkMetrics'] })

        // Call user callback
        if (onNewBlock) {
          onNewBlock(transformedBlock)
        }
      } catch (error) {
        console.error('[useRealtimeBlocks] Failed to transform block:', error)
      }
    }
  }, [lastMessage, queryClient, onNewBlock])

  return {
    isConnected,
    latestBlock,
    subscribe,
    unsubscribe,
  }
}
