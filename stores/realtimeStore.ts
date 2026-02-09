/**
 * Realtime Subscription Store (Zustand)
 *
 * Centralized store for real-time WebSocket subscription data.
 * Single subscription source prevents multiple re-renders and infinite loops.
 *
 * Pattern:
 *   WebSocket → RealtimeProvider (single subscriber) → Zustand Store → Components (readers)
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ============================================================================
// Types
// ============================================================================

export interface RealtimeBlock {
  number: string
  hash: string
  parentHash?: string
  timestamp: string
  miner?: string
  transactionCount?: number
}

export interface RealtimeTransaction {
  hash: string
  from: string
  to: string | null
  value: string
  nonce: string
  gas: string
  type: number
  gasPrice?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  blockNumber?: string
  blockHash?: string
  transactionIndex?: number
  feePayer?: string
  /** Timestamp when this tx was first seen as pending (ms since epoch) */
  seenAt?: number
}

export interface RealtimeState {
  // Connection status
  isConnected: boolean
  lastConnectedAt: Date | null

  // Latest block data
  latestBlock: RealtimeBlock | null
  recentBlocks: RealtimeBlock[]

  // Latest transaction data
  latestTransaction: RealtimeTransaction | null
  recentTransactions: RealtimeTransaction[]

  // Pending transactions
  pendingTransactions: RealtimeTransaction[]

  // Actions
  setConnected: (connected: boolean) => void
  setLatestBlock: (block: RealtimeBlock) => void
  setLatestTransaction: (tx: RealtimeTransaction) => void
  addPendingTransaction: (tx: RealtimeTransaction) => void
  removePendingTransaction: (hash: string) => void
  cleanExpiredPendingTransactions: (ttl: number) => void
  clearPendingTransactions: () => void
  reset: () => void
}

// ============================================================================
// Constants
// ============================================================================

const MAX_RECENT_BLOCKS = 50
const MAX_RECENT_TRANSACTIONS = 100
const MAX_PENDING_TRANSACTIONS = 200

// ============================================================================
// Store
// ============================================================================

export const useRealtimeStore = create<RealtimeState>()(
  devtools(
    (set) => ({
      // Initial state
      isConnected: false,
      lastConnectedAt: null,
      latestBlock: null,
      recentBlocks: [],
      latestTransaction: null,
      recentTransactions: [],
      pendingTransactions: [],

      // Actions
      setConnected: (connected) =>
        set({
          isConnected: connected,
          lastConnectedAt: connected ? new Date() : null,
        }),

      setLatestBlock: (block) =>
        set((state) => {
          // Skip if duplicate
          if (state.latestBlock?.hash === block.hash) {
            return state
          }

          const newBlocks = [block, ...state.recentBlocks]
            .filter((b, i, arr) => arr.findIndex((x) => x.hash === b.hash) === i) // Remove duplicates
            .slice(0, MAX_RECENT_BLOCKS)

          return {
            latestBlock: block,
            recentBlocks: newBlocks,
            isConnected: true,
          }
        }),

      setLatestTransaction: (tx) =>
        set((state) => {
          // Skip if duplicate
          if (state.latestTransaction?.hash === tx.hash) {
            return state
          }

          const newTxs = [tx, ...state.recentTransactions]
            .filter((t, i, arr) => arr.findIndex((x) => x.hash === t.hash) === i)
            .slice(0, MAX_RECENT_TRANSACTIONS)

          // Remove from pending if it was pending
          const newPending = state.pendingTransactions.filter(
            (p) => p.hash !== tx.hash
          )

          return {
            latestTransaction: tx,
            recentTransactions: newTxs,
            pendingTransactions: newPending,
          }
        }),

      addPendingTransaction: (tx) =>
        set((state) => {
          // Skip if already exists
          if (state.pendingTransactions.some((p) => p.hash === tx.hash)) {
            return state
          }

          return {
            pendingTransactions: [
              { ...tx, seenAt: Date.now() },
              ...state.pendingTransactions,
            ].slice(0, MAX_PENDING_TRANSACTIONS),
          }
        }),

      removePendingTransaction: (hash) =>
        set((state) => ({
          pendingTransactions: state.pendingTransactions.filter(
            (p) => p.hash !== hash
          ),
        })),

      cleanExpiredPendingTransactions: (ttl) =>
        set((state) => {
          const now = Date.now()
          const filtered = state.pendingTransactions.filter(
            (tx) => tx.seenAt && now - tx.seenAt < ttl
          )
          if (filtered.length === state.pendingTransactions.length) {
            return state
          }
          return { pendingTransactions: filtered }
        }),

      clearPendingTransactions: () =>
        set({ pendingTransactions: [] }),

      reset: () =>
        set({
          isConnected: false,
          lastConnectedAt: null,
          latestBlock: null,
          recentBlocks: [],
          latestTransaction: null,
          recentTransactions: [],
          pendingTransactions: [],
        }),
    }),
    { name: 'RealtimeStore' }
  )
)

// ============================================================================
// Selectors (for optimized reads)
// ============================================================================

export const selectLatestBlock = (state: RealtimeState) => state.latestBlock
export const selectRecentBlocks = (state: RealtimeState) => state.recentBlocks
export const selectLatestHeight = (state: RealtimeState) =>
  state.latestBlock ? BigInt(state.latestBlock.number) : null
export const selectIsConnected = (state: RealtimeState) => state.isConnected
export const selectLatestTransaction = (state: RealtimeState) => state.latestTransaction
export const selectRecentTransactions = (state: RealtimeState) => state.recentTransactions
export const selectPendingTransactions = (state: RealtimeState) => state.pendingTransactions
export const selectPendingCount = (state: RealtimeState) => state.pendingTransactions.length
