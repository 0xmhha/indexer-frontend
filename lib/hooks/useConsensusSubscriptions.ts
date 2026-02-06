'use client'

/**
 * Consensus Subscription Hooks
 * Real-time WebSocket subscriptions for consensus events
 *
 * This file contains all subscription-based hooks for real-time consensus data.
 * For query-based data fetching, see useConsensusQueries.ts
 */

import { useCallback, useMemo } from 'react'
import { useSubscription } from '@apollo/client'
import { REPLAY } from '@/lib/config/constants'
import { errorLogger } from '@/lib/errors/logger'
import {
  SUBSCRIBE_CONSENSUS_BLOCK,
  SUBSCRIBE_CONSENSUS_ERROR,
  SUBSCRIBE_CONSENSUS_FORK,
  SUBSCRIBE_CONSENSUS_VALIDATOR_CHANGE,
} from '@/lib/apollo/queries'
import { useConsensusStore } from '@/stores/consensusStore'
import { useRealtimeStore } from '@/stores/realtimeStore'
import type {
  ConsensusBlockEvent,
  ConsensusErrorEvent,
  ConsensusForkEvent,
  ConsensusValidatorChangeEvent,
} from '@/types/consensus'
import type { ConsensusSubscriptionOptions } from './consensus.types'

// ============================================================================
// Real-time Subscription Hooks (Phase B - Consensus Event System)
// ============================================================================

/**
 * Hook to subscribe to real-time consensus block events
 * Automatically updates the consensus store with new blocks
 *
 * @param options - Configuration options including replayLast
 */
export function useConsensusBlockSubscription(options: ConsensusSubscriptionOptions = {}) {
  const { replayLast = REPLAY.CONSENSUS_BLOCKS_DEFAULT } = options

  // Get only action functions (stable references) to avoid re-renders
  // Zustand store functions are guaranteed to be stable across renders
  const setLatestBlock = useConsensusStore((state) => state.setLatestBlock)
  const setConnectionStatus = useConsensusStore((state) => state.setConnectionStatus)

  // Get reactive state separately
  const latestBlock = useConsensusStore((state) => state.latestBlock)
  const recentBlocks = useConsensusStore((state) => state.recentBlocks)

  // Memoize variables to prevent re-subscription
  const variables = useMemo(() => ({ replayLast }), [replayLast])

  // Stable callback for onData - Zustand actions are stable, so this won't change
  const onData = useCallback(
    ({ data: subscriptionData }: { data: { data?: { consensusBlock?: ConsensusBlockEvent } } }) => {
      if (subscriptionData.data?.consensusBlock) {
        setLatestBlock(subscriptionData.data.consensusBlock)
      }
    },
    [setLatestBlock]
  )

  // Stable callback for onError
  const onError = useCallback(
    (err: Error) => {
      errorLogger.error(err, { component: 'useConsensusSubscriptions', action: 'block-subscription' })
      setConnectionStatus(false, err.message)
    },
    [setConnectionStatus]
  )

  // Memoize subscription options to prevent re-subscription
  const subscriptionOptions = useMemo(
    () => ({
      variables,
      fetchPolicy: 'no-cache' as const,
      onData,
      onError,
    }),
    [variables, onData, onError]
  )

  const { data, loading, error } = useSubscription<{ consensusBlock: ConsensusBlockEvent }>(
    SUBSCRIBE_CONSENSUS_BLOCK,
    subscriptionOptions
  )

  return {
    latestBlock: data?.consensusBlock ?? latestBlock,
    recentBlocks,
    loading,
    error,
  }
}

/**
 * Hook to subscribe to consensus error events
 * Stores errors in the consensus store for alerting
 *
 * @param options - Configuration options including replayLast
 */
export function useConsensusErrorSubscription(options: ConsensusSubscriptionOptions = {}) {
  const { replayLast = REPLAY.CONSENSUS_ERRORS_DEFAULT } = options

  // Get only action functions (stable references) to avoid re-renders
  // Zustand store functions are guaranteed to be stable across renders
  const addError = useConsensusStore((state) => state.addError)

  // Get reactive state separately
  const recentErrors = useConsensusStore((state) => state.recentErrors)
  const stats = useConsensusStore((state) => state.stats)

  // Memoize variables to prevent re-subscription
  const variables = useMemo(() => ({ replayLast }), [replayLast])

  // Stable callback for onData - Zustand actions are stable, so this won't change
  const onData = useCallback(
    ({ data: subscriptionData }: { data: { data?: { consensusError?: ConsensusErrorEvent } } }) => {
      if (subscriptionData.data?.consensusError) {
        addError(subscriptionData.data.consensusError)
      }
    },
    [addError]
  )

  // Stable callback for onError
  const onError = useCallback((err: Error) => {
    errorLogger.error(err, { component: 'useConsensusSubscriptions', action: 'error-subscription' })
  }, [])

  // Memoize subscription options to prevent re-subscription
  const subscriptionOptions = useMemo(
    () => ({
      variables,
      fetchPolicy: 'no-cache' as const,
      onData,
      onError,
    }),
    [variables, onData, onError]
  )

  const { data, loading, error } = useSubscription<{ consensusError: ConsensusErrorEvent }>(
    SUBSCRIBE_CONSENSUS_ERROR,
    subscriptionOptions
  )

  return {
    latestError: data?.consensusError ?? recentErrors[0] ?? null,
    recentErrors,
    errorCount: stats.errorCount,
    errorsBySeverity: stats.errorsBySeverity,
    loading,
    error,
  }
}

/**
 * Hook to subscribe to consensus fork detection events
 * Monitors for chain splits
 *
 * @param options - Configuration options including replayLast
 */
export function useConsensusForkSubscription(options: ConsensusSubscriptionOptions = {}) {
  const { replayLast = REPLAY.CONSENSUS_FORKS_DEFAULT } = options

  // Get only action functions (stable references) to avoid re-renders
  // Zustand store functions are guaranteed to be stable across renders
  const addFork = useConsensusStore((state) => state.addFork)
  const updateForkResolution = useConsensusStore((state) => state.updateForkResolution)

  // Get reactive state separately
  const recentForks = useConsensusStore((state) => state.recentForks)

  // Memoize variables to prevent re-subscription
  const variables = useMemo(() => ({ replayLast }), [replayLast])

  // Stable callback for onData - Zustand actions are stable, so this won't change
  const onData = useCallback(
    ({ data: subscriptionData }: { data: { data?: { consensusFork?: ConsensusForkEvent } } }) => {
      if (subscriptionData.data?.consensusFork) {
        const fork = subscriptionData.data.consensusFork
        if (fork.resolved && fork.winningChain) {
          updateForkResolution(fork.forkBlockNumber, fork.winningChain)
        } else {
          addFork(fork)
        }
      }
    },
    [addFork, updateForkResolution]
  )

  // Stable callback for onError
  const onError = useCallback((err: Error) => {
    errorLogger.error(err, { component: 'useConsensusSubscriptions', action: 'fork-subscription' })
  }, [])

  // Memoize subscription options to prevent re-subscription
  const subscriptionOptions = useMemo(
    () => ({
      variables,
      fetchPolicy: 'no-cache' as const,
      onData,
      onError,
    }),
    [variables, onData, onError]
  )

  const { data, loading, error } = useSubscription<{ consensusFork: ConsensusForkEvent }>(
    SUBSCRIBE_CONSENSUS_FORK,
    subscriptionOptions
  )

  // Memoize filtered forks to prevent unnecessary recalculations
  const unresolvedForks = useMemo(() => recentForks.filter((f) => !f.resolved), [recentForks])

  const hasUnresolvedForks = useMemo(() => unresolvedForks.length > 0, [unresolvedForks])

  return {
    latestFork: data?.consensusFork ?? recentForks[0] ?? null,
    recentForks,
    unresolvedForks,
    hasUnresolvedForks,
    loading,
    error,
  }
}

/**
 * Hook to subscribe to validator set changes at epoch boundaries
 *
 * @param options - Configuration options including replayLast
 */
export function useConsensusValidatorChangeSubscription(options: ConsensusSubscriptionOptions = {}) {
  const { replayLast = REPLAY.VALIDATOR_CHANGES_DEFAULT } = options

  // Get only action functions (stable references) to avoid re-renders
  // Zustand store functions are guaranteed to be stable across renders
  const addValidatorChange = useConsensusStore((state) => state.addValidatorChange)

  // Get reactive state separately
  const recentValidatorChanges = useConsensusStore((state) => state.recentValidatorChanges)

  // Memoize variables to prevent re-subscription
  const variables = useMemo(() => ({ replayLast }), [replayLast])

  // Stable callback for onData - Zustand actions are stable, so this won't change
  const onData = useCallback(
    ({
      data: subscriptionData,
    }: {
      data: { data?: { consensusValidatorChange?: ConsensusValidatorChangeEvent } }
    }) => {
      if (subscriptionData.data?.consensusValidatorChange) {
        addValidatorChange(subscriptionData.data.consensusValidatorChange)
      }
    },
    [addValidatorChange]
  )

  // Stable callback for onError
  const onError = useCallback((err: Error) => {
    errorLogger.error(err, { component: 'useConsensusSubscriptions', action: 'validator-change-subscription' })
  }, [])

  // Memoize subscription options to prevent re-subscription
  const subscriptionOptions = useMemo(
    () => ({
      variables,
      fetchPolicy: 'no-cache' as const,
      onData,
      onError,
    }),
    [variables, onData, onError]
  )

  const { data, loading, error } = useSubscription<{
    consensusValidatorChange: ConsensusValidatorChangeEvent
  }>(SUBSCRIBE_CONSENSUS_VALIDATOR_CHANGE, subscriptionOptions)

  return {
    latestChange: data?.consensusValidatorChange ?? recentValidatorChanges[0] ?? null,
    recentChanges: recentValidatorChanges,
    loading,
    error,
  }
}

/**
 * Combined hook for all consensus subscriptions
 * Use this for the main consensus dashboard
 * Uses Zustand selectors to prevent unnecessary re-renders
 * Connection status comes from centralized realtimeStore (single WebSocket)
 */
export function useConsensusMonitoring() {
  // Use centralized WebSocket connection status from realtimeStore
  // This is managed by RealtimeProvider which handles the single WebSocket connection
  const isConnected = useRealtimeStore((state) => state.isConnected)
  const latestBlock = useConsensusStore((state) => state.latestBlock)
  const recentBlocks = useConsensusStore((state) => state.recentBlocks)
  const recentErrors = useConsensusStore((state) => state.recentErrors)
  const recentForks = useConsensusStore((state) => state.recentForks)
  const recentValidatorChanges = useConsensusStore((state) => state.recentValidatorChanges)
  const stats = useConsensusStore((state) => state.stats)
  const networkHealth = useConsensusStore((state) => state.networkHealth)

  // Get stable action references (these don't change)
  const clearAll = useConsensusStore((state) => state.clearAll)
  const acknowledgeError = useConsensusStore((state) => state.acknowledgeError)

  // Subscribe to all consensus events
  const blockSub = useConsensusBlockSubscription()
  const errorSub = useConsensusErrorSubscription()
  const forkSub = useConsensusForkSubscription()
  const validatorChangeSub = useConsensusValidatorChangeSubscription()

  // Memoize computed values to prevent unnecessary re-renders
  const hasSubscriptionError = useMemo(
    () => !!(blockSub.error || errorSub.error || forkSub.error || validatorChangeSub.error),
    [blockSub.error, errorSub.error, forkSub.error, validatorChangeSub.error]
  )

  const isLoading = useMemo(
    () => blockSub.loading && errorSub.loading && forkSub.loading && validatorChangeSub.loading,
    [blockSub.loading, errorSub.loading, forkSub.loading, validatorChangeSub.loading]
  )

  // Memoize filtered errors to prevent unnecessary recalculations
  const highPriorityErrors = useMemo(
    () => recentErrors.filter((e) => e.severity === 'critical' || e.severity === 'high'),
    [recentErrors]
  )

  return {
    // Connection status (from centralized realtimeStore)
    isConnected,

    // Latest data
    latestBlock,
    latestError: errorSub.latestError,
    latestFork: forkSub.latestFork,
    latestValidatorChange: validatorChangeSub.latestChange,

    // Historical data
    recentBlocks,
    recentErrors,
    recentForks,
    recentValidatorChanges,

    // Computed stats
    stats,
    networkHealth,

    // Status
    hasSubscriptionError,
    isLoading,

    // Alerts
    hasUnresolvedForks: forkSub.hasUnresolvedForks,
    unresolvedForks: forkSub.unresolvedForks,
    highPriorityErrors,

    // Actions (stable references)
    clearAll,
    acknowledgeError,
  }
}
