'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@apollo/client'
import { GET_NETWORK_METRICS } from '@/lib/apollo/queries'
import { useNewBlocks } from '@/lib/hooks/useSubscriptions'

/**
 * Hook to get real-time network metrics using WebSocket subscriptions
 * Calculates total transactions, block count, and average block time
 * Uses previousData pattern to prevent flickering
 */
export function useNetworkMetrics() {
  // Initial data from query (fallback if subscription fails)
  const { data, loading, error, previousData } = useQuery(GET_NETWORK_METRICS, {
    // Don't poll - we'll use subscription for updates
    pollInterval: 0,
    // Show previous data while loading to prevent flickering
    returnPartialData: true,
  })

  // Use subscription for real-time updates
  const { blocks: recentBlocks, latestBlock } = useNewBlocks(20)

  // State for calculated metrics
  const [metrics, setMetrics] = useState<{
    blockCount: bigint | null
    transactionCount: bigint | null
    avgBlockTime: number | null
  }>({
    blockCount: null,
    transactionCount: null,
    avgBlockTime: null,
  })

  // Track block timestamps for avg block time calculation
  const blockTimestamps = useRef<bigint[]>([])

  // Initialize from query data (prevents flickering on mount)
  useEffect(() => {
    const currentData = data || previousData
    if (currentData) {
      // Legitimate use case: Synchronizing state from external GraphQL query data
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMetrics((prev) => ({
        blockCount: currentData.blockCount ? BigInt(currentData.blockCount) : prev.blockCount,
        transactionCount: currentData.transactionCount
          ? BigInt(currentData.transactionCount)
          : prev.transactionCount,
        avgBlockTime: prev.avgBlockTime, // Keep existing avg until calculated
      }))
    }
  }, [data, previousData])

  // Update metrics when new block arrives via subscription
  useEffect(() => {
    if (latestBlock) {
      // Increment block count
      // Legitimate use case: Synchronizing state from external GraphQL subscription
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMetrics((prev) => ({
        blockCount: prev.blockCount !== null ? prev.blockCount + BigInt(1) : BigInt(latestBlock.number),
        transactionCount:
          prev.transactionCount !== null
            ? prev.transactionCount + BigInt(latestBlock.transactionCount)
            : BigInt(latestBlock.transactionCount),
        avgBlockTime: prev.avgBlockTime,
      }))

      // Add timestamp for avg block time calculation
      blockTimestamps.current.push(latestBlock.timestamp)

      // Keep only last 20 timestamps
      if (blockTimestamps.current.length > 20) {
        blockTimestamps.current.shift()
      }

      // Calculate average block time if we have at least 2 blocks
      if (blockTimestamps.current.length >= 2) {
        const timestamps = blockTimestamps.current
        const timeDiffs: number[] = []

        for (let i = 1; i < timestamps.length; i++) {
          const current = timestamps[i]
          const previous = timestamps[i - 1]
          if (current && previous) {
            const diff = Number(current - previous)
            if (diff > 0 && diff < 3600) {
              // Ignore outliers (>1 hour)
              timeDiffs.push(diff)
            }
          }
        }

        if (timeDiffs.length > 0) {
          const avgTime = timeDiffs.reduce((sum, t) => sum + t, 0) / timeDiffs.length
          setMetrics((prev) => ({
            ...prev,
            avgBlockTime: avgTime,
          }))
        }
      }
    }
  }, [latestBlock])

  // Initialize block timestamps from recent blocks
  useEffect(() => {
    if (recentBlocks.length > 0 && blockTimestamps.current.length === 0) {
      blockTimestamps.current = recentBlocks
        .slice(0, 20)
        .map((block) => block.timestamp)
        .sort((a, b) => (a > b ? 1 : -1))
    }
  }, [recentBlocks])

  return {
    blockCount: metrics.blockCount,
    transactionCount: metrics.transactionCount,
    avgBlockTime: metrics.avgBlockTime,
    loading: loading && !previousData,
    error,
  }
}
