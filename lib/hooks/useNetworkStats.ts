'use client'

/**
 * Network Stats Compatibility Layer
 * Re-exports from useAnalytics and useStats for backward compatibility
 */

export { useNetworkMetrics as useNetworkStats } from './useAnalytics'
export { useBlocksByTimeRange as useBlocksOverTime } from './useAnalytics'
export { useTopMiners } from './useStats'
