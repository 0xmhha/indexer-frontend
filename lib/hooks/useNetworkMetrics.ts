'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@apollo/client'
import { GET_BLOCK_COUNT, GET_TRANSACTION_COUNT } from '@/lib/apollo/queries'
import { useNewBlocks } from '@/lib/hooks/useSubscriptions'
import { UI, FORMATTING } from '@/lib/config/constants'

/**
 * Hook to get real-time network metrics using WebSocket subscriptions
 * Calculates total transactions, block count, and average block time
 * Uses previousData pattern to prevent flickering
 */
export function useNetworkMetrics() {
  // Initial data from efficient root queries (fallback if subscription fails)
  const { data: blockData, loading: blockLoading, error: blockError, previousData: blockPrevData } = useQuery(
    GET_BLOCK_COUNT,
    { pollInterval: 0, returnPartialData: true }
  )
  const { data: txData, loading: txLoading, error: txError, previousData: txPrevData } = useQuery(
    GET_TRANSACTION_COUNT,
    { pollInterval: 0, returnPartialData: true }
  )

  const loading = blockLoading || txLoading
  const error = blockError || txError

  // Use subscription for real-time updates
  const { blocks: recentBlocks, latestBlock } = useNewBlocks(UI.CHART_RECENT_BLOCKS)

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
    const currentBlockData = blockData || blockPrevData
    const currentTxData = txData || txPrevData

    if (currentBlockData || currentTxData) {
      // Legitimate use case: Synchronizing state from external GraphQL query data
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMetrics((prev) => ({
        blockCount: currentBlockData?.blockCount ? BigInt(currentBlockData.blockCount) : prev.blockCount,
        transactionCount: currentTxData?.transactionCount
          ? BigInt(currentTxData.transactionCount)
          : prev.transactionCount,
        avgBlockTime: prev.avgBlockTime, // Keep existing avg until calculated
      }))
    }
  }, [blockData, blockPrevData, txData, txPrevData])

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

      // Keep only last N timestamps
      if (blockTimestamps.current.length > UI.CHART_RECENT_BLOCKS) {
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
            if (diff > 0 && diff < FORMATTING.SECONDS_PER_HOUR) {
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
        .slice(0, UI.CHART_RECENT_BLOCKS)
        .map((block) => block.timestamp)
        .sort((a, b) => (a > b ? 1 : -1))
    }
  }, [recentBlocks])

  return {
    blockCount: metrics.blockCount,
    transactionCount: metrics.transactionCount,
    avgBlockTime: metrics.avgBlockTime,
    loading: loading && !blockPrevData && !txPrevData,
    error,
  }
}
