'use client'

import { useEffect, useRef } from 'react'
import { useSubscription } from '@apollo/client'
import { useBlocks } from './useBlocks'
import { SUBSCRIBE_NEW_BLOCK } from '@/lib/apollo/queries'

interface UseBlocksWithSubscriptionParams {
  limit?: number
  offset?: number
  isFirstPage?: boolean
  orderDirection?: 'asc' | 'desc'
}

/**
 * Hook that combines paginated blocks query with WebSocket subscription
 * On first page with desc order, subscription triggers refetch for real-time updates
 */
export function useBlocksWithSubscription(params: UseBlocksWithSubscriptionParams = {}) {
  const { limit = 20, offset = 0, isFirstPage = true, orderDirection = 'desc' } = params

  // Track last seen block to avoid duplicate refetches
  const lastBlockHashRef = useRef<string | null>(null)

  // Fetch blocks (no polling - subscription handles updates)
  const { blocks, totalCount, loading, error, refetch } = useBlocks({
    limit,
    offset,
    pollInterval: 0, // Disable polling - use subscription instead
  })

  // Subscribe to new blocks (only on first page with desc order)
  const { data: subscriptionData } = useSubscription(SUBSCRIBE_NEW_BLOCK, {
    fetchPolicy: 'no-cache',
    skip: !isFirstPage || orderDirection !== 'desc',
  })

  // When new block notification arrives, refetch to get complete data
  useEffect(() => {
    if (subscriptionData?.newBlock && isFirstPage && orderDirection === 'desc') {
      const newBlockHash = subscriptionData.newBlock.hash

      // Only refetch if this is a new block we haven't seen
      if (newBlockHash !== lastBlockHashRef.current) {
        lastBlockHashRef.current = newBlockHash
        refetch()
      }
    }
  }, [subscriptionData, isFirstPage, orderDirection, refetch])

  // Reset last block hash when page changes
  useEffect(() => {
    lastBlockHashRef.current = null
  }, [offset, limit])

  return {
    blocks,
    totalCount,
    loading,
    error,
    refetch,
  }
}
