/**
 * Application-wide constants and configuration
 *
 * This file has been refactored for better maintainability.
 * All constants are now organized in the constants/ directory:
 * - constants/pagination.ts: Pagination & limits
 * - constants/realtime.ts: Real-time, polling, timing, cache
 * - constants/consensus.ts: Consensus monitoring & thresholds
 * - constants/blockchain.ts: Blockchain, gas, ABI, formatting
 * - constants/system-contracts.ts: System contract addresses & utilities
 * - constants/ui.ts: UI, features, error logging, HTTP status
 *
 * This file re-exports everything for backward compatibility.
 * For new code, consider importing directly from the specific module.
 */

// Re-export everything from the new module structure
export * from './constants/index'
