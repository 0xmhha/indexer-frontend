/**
 * Consensus State Store (Zustand)
 *
 * Global state management for real-time consensus monitoring.
 * Stores recent blocks, errors, forks, and validator changes
 * received via WebSocket subscriptions.
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  ConsensusBlockEvent,
  ConsensusErrorEvent,
  ConsensusForkEvent,
  ConsensusValidatorChangeEvent,
  ConsensusStats,
  NetworkHealth,
} from '@/types/consensus'

// ============================================================================
// Constants
// ============================================================================

/** Maximum number of recent blocks to keep in memory */
const MAX_RECENT_BLOCKS = 50

/** Maximum number of recent errors to keep in memory */
const MAX_RECENT_ERRORS = 100

/** Maximum number of recent forks to keep in memory */
const MAX_RECENT_FORKS = 20

/** Maximum number of recent validator changes to keep in memory */
const MAX_RECENT_VALIDATOR_CHANGES = 50

// ============================================================================
// Store Interface
// ============================================================================

interface ConsensusState {
  // Connection status
  isConnected: boolean
  lastConnectedAt: Date | null
  connectionError: string | null

  // Current state
  latestBlock: ConsensusBlockEvent | null
  recentBlocks: ConsensusBlockEvent[]
  recentErrors: ConsensusErrorEvent[]
  recentForks: ConsensusForkEvent[]
  recentValidatorChanges: ConsensusValidatorChangeEvent[]

  // Computed statistics
  stats: ConsensusStats

  // Network health
  networkHealth: NetworkHealth

  // Actions - Connection
  setConnectionStatus: (connected: boolean, error?: string) => void

  // Actions - Block Events
  setLatestBlock: (block: ConsensusBlockEvent) => void
  clearBlocks: () => void

  // Actions - Error Events
  addError: (error: ConsensusErrorEvent) => void
  clearErrors: () => void
  acknowledgeError: (blockNumber: number) => void

  // Actions - Fork Events
  addFork: (fork: ConsensusForkEvent) => void
  updateForkResolution: (forkBlockNumber: number, winningChain: number) => void
  clearForks: () => void

  // Actions - Validator Change Events
  addValidatorChange: (change: ConsensusValidatorChangeEvent) => void
  clearValidatorChanges: () => void

  // Actions - Reset
  clearAll: () => void

  // Internal - Update computed values
  _updateStats: () => void
  _updateNetworkHealth: () => void
}

// ============================================================================
// Initial State
// ============================================================================

const initialStats: ConsensusStats = {
  totalBlocks: 0,
  roundChanges: 0,
  averageParticipation: 0,
  errorCount: 0,
  errorsBySeverity: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  },
  lastUpdated: new Date().toISOString(),
}

const initialNetworkHealth: NetworkHealth = {
  score: 100,
  status: 'excellent',
  isHealthy: true,
  participationRate: 100,
  roundChangeRate: 0,
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useConsensusStore = create<ConsensusState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isConnected: false,
        lastConnectedAt: null,
        connectionError: null,

        latestBlock: null,
        recentBlocks: [],
        recentErrors: [],
        recentForks: [],
        recentValidatorChanges: [],

        stats: initialStats,
        networkHealth: initialNetworkHealth,

        // Connection management
        setConnectionStatus: (connected, error) => {
          set({
            isConnected: connected,
            lastConnectedAt: connected ? new Date() : get().lastConnectedAt,
            connectionError: error ?? null,
          })
        },

        // Block event handling
        setLatestBlock: (block) => {
          const blockWithTimestamp: ConsensusBlockEvent = {
            ...block,
            receivedAt: new Date(),
          }

          set((state) => {
            // Prevent duplicates
            const existingIndex = state.recentBlocks.findIndex(
              (b) => b.blockNumber === block.blockNumber
            )
            if (existingIndex !== -1) {
              return state // Block already exists
            }

            const newBlocks = [blockWithTimestamp, ...state.recentBlocks].slice(
              0,
              MAX_RECENT_BLOCKS
            )

            return {
              latestBlock: blockWithTimestamp,
              recentBlocks: newBlocks,
            }
          })

          // Update computed values
          get()._updateStats()
          get()._updateNetworkHealth()
        },

        clearBlocks: () => {
          set({
            latestBlock: null,
            recentBlocks: [],
          })
          get()._updateStats()
          get()._updateNetworkHealth()
        },

        // Error event handling
        addError: (error) => {
          const errorWithTimestamp: ConsensusErrorEvent = {
            ...error,
            receivedAt: new Date(),
          }

          set((state) => ({
            recentErrors: [errorWithTimestamp, ...state.recentErrors].slice(0, MAX_RECENT_ERRORS),
          }))

          get()._updateStats()
          get()._updateNetworkHealth()
        },

        clearErrors: () => {
          set({ recentErrors: [] })
          get()._updateStats()
        },

        acknowledgeError: (blockNumber) => {
          set((state) => ({
            recentErrors: state.recentErrors.filter((e) => e.blockNumber !== blockNumber),
          }))
          get()._updateStats()
        },

        // Fork event handling
        addFork: (fork) => {
          const forkWithTimestamp: ConsensusForkEvent = {
            ...fork,
            receivedAt: new Date(),
          }

          set((state) => ({
            recentForks: [forkWithTimestamp, ...state.recentForks].slice(0, MAX_RECENT_FORKS),
          }))
        },

        updateForkResolution: (forkBlockNumber, winningChain) => {
          set((state) => ({
            recentForks: state.recentForks.map((f) =>
              f.forkBlockNumber === forkBlockNumber ? { ...f, resolved: true, winningChain } : f
            ),
          }))
        },

        clearForks: () => {
          set({ recentForks: [] })
        },

        // Validator change handling
        addValidatorChange: (change) => {
          const changeWithTimestamp: ConsensusValidatorChangeEvent = {
            ...change,
            receivedAt: new Date(),
          }

          set((state) => ({
            recentValidatorChanges: [changeWithTimestamp, ...state.recentValidatorChanges].slice(
              0,
              MAX_RECENT_VALIDATOR_CHANGES
            ),
          }))
        },

        clearValidatorChanges: () => {
          set({ recentValidatorChanges: [] })
        },

        // Reset all state
        clearAll: () => {
          set({
            latestBlock: null,
            recentBlocks: [],
            recentErrors: [],
            recentForks: [],
            recentValidatorChanges: [],
            stats: initialStats,
            networkHealth: initialNetworkHealth,
          })
        },

        // Internal: Update statistics
        _updateStats: () => {
          const { recentBlocks, recentErrors } = get()

          const totalBlocks = recentBlocks.length
          const roundChanges = recentBlocks.filter((b) => b.roundChanged).length
          const averageParticipation =
            totalBlocks > 0
              ? recentBlocks.reduce((sum, b) => sum + b.participationRate, 0) / totalBlocks
              : 0

          const errorsBySeverity = {
            critical: recentErrors.filter((e) => e.severity === 'critical').length,
            high: recentErrors.filter((e) => e.severity === 'high').length,
            medium: recentErrors.filter((e) => e.severity === 'medium').length,
            low: recentErrors.filter((e) => e.severity === 'low').length,
          }

          set({
            stats: {
              totalBlocks,
              roundChanges,
              averageParticipation,
              errorCount: recentErrors.length,
              errorsBySeverity,
              lastUpdated: new Date().toISOString(),
            },
          })
        },

        // Internal: Update network health
        _updateNetworkHealth: () => {
          const { recentBlocks, recentErrors, stats } = get()

          // Calculate health score (0-100)
          let score = 100

          // Deduct for low participation (max -40 points)
          if (stats.averageParticipation < 100) {
            score -= Math.min(40, (100 - stats.averageParticipation) * 0.8)
          }

          // Deduct for round changes (max -20 points)
          const roundChangeRate =
            stats.totalBlocks > 0 ? stats.roundChanges / stats.totalBlocks : 0
          score -= Math.min(20, roundChangeRate * 100)

          // Deduct for errors (max -40 points)
          const errorPenalty =
            stats.errorsBySeverity.critical * 15 +
            stats.errorsBySeverity.high * 8 +
            stats.errorsBySeverity.medium * 3 +
            stats.errorsBySeverity.low * 1
          score -= Math.min(40, errorPenalty)

          // Ensure score is between 0 and 100
          score = Math.max(0, Math.min(100, Math.round(score)))

          // Determine status
          let status: NetworkHealth['status']
          if (score >= 90) status = 'excellent'
          else if (score >= 75) status = 'good'
          else if (score >= 60) status = 'fair'
          else status = 'poor'

          // Calculate time since last error
          const lastError = recentErrors[0]
          const timeSinceLastError = lastError?.receivedAt
            ? Date.now() - lastError.receivedAt.getTime()
            : null

          // Get latest participation rate
          const latestBlock = recentBlocks[0]
          const participationRate = latestBlock?.participationRate ?? 100

          // Build network health object, conditionally including timeSinceLastError
          const networkHealthUpdate: NetworkHealth = {
            score,
            status,
            isHealthy: score >= 60,
            participationRate,
            roundChangeRate,
          }

          if (timeSinceLastError !== null) {
            networkHealthUpdate.timeSinceLastError = timeSinceLastError
          }

          set({
            networkHealth: networkHealthUpdate,
          })
        },
      }),
      {
        name: 'consensus-store',
        // Only persist minimal data to localStorage
        partialize: (state) => ({
          // Persist only recent data for session recovery
          recentBlocks: state.recentBlocks.slice(0, 10),
          stats: state.stats,
        }),
        // Skip hydration on server to avoid SSR issues
        skipHydration: true,
      }
    ),
    {
      name: 'ConsensusStore',
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

/**
 * Get unacknowledged high-priority errors
 */
export const selectHighPriorityErrors = (state: ConsensusState) =>
  state.recentErrors.filter((e) => e.severity === 'critical' || e.severity === 'high')

/**
 * Get unresolved forks
 */
export const selectUnresolvedForks = (state: ConsensusState) =>
  state.recentForks.filter((f) => !f.resolved)

/**
 * Get recent epoch boundaries
 */
export const selectRecentEpochBoundaries = (state: ConsensusState) =>
  state.recentBlocks.filter((b) => b.isEpochBoundary)

/**
 * Get blocks with round changes
 */
export const selectRoundChangedBlocks = (state: ConsensusState) =>
  state.recentBlocks.filter((b) => b.roundChanged)
