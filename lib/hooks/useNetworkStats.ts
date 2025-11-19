'use client'

import { useNetworkMetrics } from './useAnalytics'

/**
 * Hook to fetch network statistics
 * This is a compatibility wrapper for existing code that uses useNetworkStats
 */
export function useNetworkStats() {
  const { blockCount, transactionCount, loading, error } = useNetworkMetrics()

  // Transform to match expected interface
  const stats = blockCount && transactionCount
    ? {
        totalBlocks: blockCount,
        totalTransactions: transactionCount,
      }
    : null

  return {
    stats,
    loading,
    error,
  }
}

// Re-export hooks from useAnalytics for backward compatibility
export { useBlocksByTimeRange as useBlocksOverTime } from './useAnalytics'

/**
 * Placeholder for top miners - not yet implemented in backend
 */
export function useTopMiners(_limit = 10) {
  return {
    topMiners: [],
    loading: false,
    error: null,
  }
}
