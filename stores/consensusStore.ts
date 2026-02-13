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
import { CONSENSUS } from '@/lib/config/constants'

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
}

// ============================================================================
// Pure computation functions (no side effects)
// ============================================================================

function computeStats(
  recentBlocks: ConsensusBlockEvent[],
  recentErrors: ConsensusErrorEvent[]
): ConsensusStats {
  const totalBlocks = recentBlocks.length

  // Single pass over blocks (replaces separate filter + reduce)
  let roundChanges = 0
  let participationSum = 0
  for (const b of recentBlocks) {
    if (b.roundChanged) {roundChanges++}
    participationSum += b.participationRate
  }

  // Single pass over errors (replaces 4 separate filters)
  let critical = 0, high = 0, medium = 0, low = 0
  for (const e of recentErrors) {
    switch (e.severity) {
      case 'critical': critical++; break
      case 'high': high++; break
      case 'medium': medium++; break
      case 'low': low++; break
      // no default
    }
  }

  return {
    totalBlocks,
    roundChanges,
    averageParticipation: totalBlocks > 0 ? participationSum / totalBlocks : 0,
    errorCount: recentErrors.length,
    errorsBySeverity: { critical, high, medium, low },
    lastUpdated: new Date().toISOString(),
  }
}

function computeNetworkHealth(
  recentBlocks: ConsensusBlockEvent[],
  recentErrors: ConsensusErrorEvent[],
  stats: ConsensusStats
): NetworkHealth {
  // Calculate health score
  let score: number = CONSENSUS.HEALTH_SCORE_INITIAL

  // Deduct for low participation
  if (stats.averageParticipation < CONSENSUS.DEFAULT_PARTICIPATION_RATE) {
    score -= Math.min(
      CONSENSUS.MAX_PARTICIPATION_PENALTY,
      (CONSENSUS.DEFAULT_PARTICIPATION_RATE - stats.averageParticipation) *
        CONSENSUS.PARTICIPATION_PENALTY_MULTIPLIER
    )
  }

  // Deduct for round changes
  const roundChangeRate =
    stats.totalBlocks > 0 ? stats.roundChanges / stats.totalBlocks : 0
  score -= Math.min(
    CONSENSUS.MAX_ROUND_CHANGE_PENALTY,
    roundChangeRate * CONSENSUS.ROUND_CHANGE_MULTIPLIER
  )

  // Deduct for errors
  const errorPenalty =
    stats.errorsBySeverity.critical * CONSENSUS.ERROR_PENALTY_CRITICAL +
    stats.errorsBySeverity.high * CONSENSUS.ERROR_PENALTY_HIGH +
    stats.errorsBySeverity.medium * CONSENSUS.ERROR_PENALTY_MEDIUM +
    stats.errorsBySeverity.low * CONSENSUS.ERROR_PENALTY_LOW
  score -= Math.min(CONSENSUS.MAX_ERROR_PENALTY, errorPenalty)

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(CONSENSUS.HEALTH_SCORE_INITIAL, Math.round(score)))

  // Determine status
  let status: NetworkHealth['status']
  if (score >= CONSENSUS.HEALTH_EXCELLENT_THRESHOLD) {
    status = 'excellent'
  } else if (score >= CONSENSUS.HEALTH_GOOD_THRESHOLD) {
    status = 'good'
  } else if (score >= CONSENSUS.HEALTH_FAIR_THRESHOLD) {
    status = 'fair'
  } else {
    status = 'poor'
  }

  // Calculate time since last error
  const lastError = recentErrors[0]
  const timeSinceLastError = lastError?.receivedAt
    ? Date.now() - lastError.receivedAt.getTime()
    : null

  // Get latest participation rate
  const latestBlock = recentBlocks[0]
  const participationRate =
    latestBlock?.participationRate ?? CONSENSUS.DEFAULT_PARTICIPATION_RATE

  // Build network health object
  const networkHealthUpdate: NetworkHealth = {
    score,
    status,
    isHealthy: score >= CONSENSUS.MINIMUM_HEALTHY_SCORE,
    participationRate,
    roundChangeRate,
  }

  if (timeSinceLastError !== null) {
    networkHealthUpdate.timeSinceLastError = timeSinceLastError
  }

  return networkHealthUpdate
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
  score: CONSENSUS.HEALTH_SCORE_INITIAL,
  status: 'excellent',
  isHealthy: true,
  participationRate: CONSENSUS.DEFAULT_PARTICIPATION_RATE,
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

        // Block event handling - Single batched update to prevent cascading re-renders
        setLatestBlock: (block) => {
          set((state) => {
            // Prevent duplicates
            const existingIndex = state.recentBlocks.findIndex(
              (b) => b.blockNumber === block.blockNumber
            )
            if (existingIndex !== -1) {
              return state // Block already exists, no update needed
            }

            const blockWithTimestamp: ConsensusBlockEvent = {
              ...block,
              receivedAt: new Date(),
            }

            const newBlocks = [blockWithTimestamp, ...state.recentBlocks].slice(
              0,
              CONSENSUS.MAX_RECENT_BLOCKS
            )

            // Compute stats and health in same update to prevent cascading
            const newStats = computeStats(newBlocks, state.recentErrors)
            const newHealth = computeNetworkHealth(newBlocks, state.recentErrors, newStats)

            return {
              latestBlock: blockWithTimestamp,
              recentBlocks: newBlocks,
              stats: newStats,
              networkHealth: newHealth,
            }
          })
        },

        clearBlocks: () => {
          set((state) => {
            const newStats = computeStats([], state.recentErrors)
            const newHealth = computeNetworkHealth([], state.recentErrors, newStats)
            return {
              latestBlock: null,
              recentBlocks: [],
              stats: newStats,
              networkHealth: newHealth,
            }
          })
        },

        // Error event handling - Single batched update
        addError: (error) => {
          set((state) => {
            const errorWithTimestamp: ConsensusErrorEvent = {
              ...error,
              receivedAt: new Date(),
            }
            const newErrors = [errorWithTimestamp, ...state.recentErrors].slice(0, CONSENSUS.MAX_RECENT_ERRORS)

            // Compute stats and health in same update
            const newStats = computeStats(state.recentBlocks, newErrors)
            const newHealth = computeNetworkHealth(state.recentBlocks, newErrors, newStats)

            return {
              recentErrors: newErrors,
              stats: newStats,
              networkHealth: newHealth,
            }
          })
        },

        clearErrors: () => {
          set((state) => {
            const newStats = computeStats(state.recentBlocks, [])
            return {
              recentErrors: [],
              stats: newStats,
            }
          })
        },

        acknowledgeError: (blockNumber) => {
          set((state) => {
            const newErrors = state.recentErrors.filter((e) => e.blockNumber !== blockNumber)
            const newStats = computeStats(state.recentBlocks, newErrors)
            return {
              recentErrors: newErrors,
              stats: newStats,
            }
          })
        },

        // Fork event handling
        addFork: (fork) => {
          const forkWithTimestamp: ConsensusForkEvent = {
            ...fork,
            receivedAt: new Date(),
          }

          set((state) => ({
            recentForks: [forkWithTimestamp, ...state.recentForks].slice(0, CONSENSUS.MAX_RECENT_FORKS),
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
              CONSENSUS.MAX_RECENT_VALIDATOR_CHANGES
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
      }),
      {
        name: 'consensus-store',
        // Only persist minimal data to localStorage
        partialize: (state) => ({
          // Persist only recent data for session recovery
          recentBlocks: state.recentBlocks.slice(0, CONSENSUS.MAX_PERSISTED_RECENT_BLOCKS),
          stats: state.stats,
        }),
        // Skip hydration on server to avoid SSR issues
        skipHydration: true,
      }
    ),
    {
      name: 'ConsensusStore',
      enabled: process.env.NODE_ENV === 'development',
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
