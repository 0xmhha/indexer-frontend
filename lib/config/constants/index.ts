/**
 * Application-wide constants and configuration
 *
 * This module has been refactored for better maintainability:
 * - pagination.ts: Pagination & limits
 * - realtime.ts: Real-time, polling, timing, cache
 * - consensus.ts: Consensus monitoring & thresholds
 * - blockchain.ts: Blockchain, gas, ABI, formatting
 * - system-contracts.ts: System contract addresses & utilities
 * - ui.ts: UI, features, error logging, HTTP status
 *
 * All exports are re-exported here for backward compatibility.
 */

// Pagination & Limits
export { PAGINATION } from './pagination'
export type { PaginationLimit } from './pagination'

// Real-time, Polling, Timing, Cache
export {
  REALTIME,
  REPLAY,
  POLLING_INTERVALS,
  TIMING,
  TIMEOUTS,
  CACHE_POLICIES,
} from './realtime'
export type { CachePolicy, PollingInterval } from './realtime'

// Consensus & Thresholds
export { CONSENSUS, THRESHOLDS } from './consensus'

// Blockchain, Gas, ABI, Formatting
export { BLOCKCHAIN, GAS, FORMATTING, ABI } from './blockchain'

// System Contracts
export {
  SYSTEM_CONTRACT_ADDRESSES,
  SYSTEM_CONTRACTS,
  getSystemContractInfo,
  isSystemContract,
} from './system-contracts'
export type { SystemContractInfo } from './system-contracts'

// UI, Features, Error Logging, HTTP
export { UI, FEATURES, ERROR_LOGGING, HTTP_STATUS } from './ui'

// ============================================================================
// Helper Functions
// ============================================================================

import { FEATURES } from './ui'

/**
 * Check if polling is enabled
 */
export function isPollingEnabled(interval: number): boolean {
  return FEATURES.ENABLE_POLLING && interval > 0
}

/**
 * Log only in development mode
 */
export function devLog(message: string, ...args: unknown[]): void {
  if (FEATURES.ENABLE_DEV_LOGGING) {
    console.log(`[DEV] ${message}`, ...args)
  }
}
