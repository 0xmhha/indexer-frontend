'use client'

import { useEffect, useRef } from 'react'
import { useSubscription } from '@apollo/client'
import { useTransactions } from './useTransactions'
import { SUBSCRIBE_NEW_TRANSACTION } from '@/lib/apollo/queries'

interface UseTransactionsWithSubscriptionParams {
  limit?: number
  offset?: number
  isFirstPage?: boolean
  orderDirection?: 'asc' | 'desc'
}

/**
 * Hook that combines paginated transactions query with WebSocket subscription
 * On first page with desc order, subscription triggers refetch for real-time updates
 */
export function useTransactionsWithSubscription(params: UseTransactionsWithSubscriptionParams = {}) {
  const { limit = 20, offset = 0, isFirstPage = true, orderDirection = 'desc' } = params

  // Track last seen transaction to avoid duplicate refetches
  const lastTxHashRef = useRef<string | null>(null)

  // Fetch transactions (no polling - subscription handles updates)
  const { transactions, totalCount, loading, error, refetch } = useTransactions({
    limit,
    offset,
    pollInterval: 0, // Disable polling - use subscription instead
  })

  // Subscribe to new transactions (only on first page with desc order)
  const { data: subscriptionData } = useSubscription(SUBSCRIBE_NEW_TRANSACTION, {
    fetchPolicy: 'no-cache',
    skip: !isFirstPage || orderDirection !== 'desc',
  })

  // When new transaction notification arrives, refetch to get complete data
  useEffect(() => {
    if (subscriptionData?.newTransaction && isFirstPage && orderDirection === 'desc') {
      const newTxHash = subscriptionData.newTransaction.hash

      // Only refetch if this is a new transaction we haven't seen
      if (newTxHash !== lastTxHashRef.current) {
        lastTxHashRef.current = newTxHash
        refetch()
      }
    }
  }, [subscriptionData, isFirstPage, orderDirection, refetch])

  // Reset last tx hash when page changes
  useEffect(() => {
    lastTxHashRef.current = null
  }, [offset, limit])

  return {
    transactions,
    totalCount,
    loading,
    error,
    refetch,
  }
}
