import { describe, it, expect, beforeEach } from 'vitest'
import {
  useConsensusStore,
  selectHighPriorityErrors,
  selectUnresolvedForks,
  selectRecentEpochBoundaries,
  selectRoundChangedBlocks,
} from './consensusStore'
import type {
  ConsensusBlockEvent,
  ConsensusErrorEvent,
  ConsensusForkEvent,
  ConsensusValidatorChangeEvent,
} from '@/types/consensus'
import { CONSENSUS } from '@/lib/config/constants'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBlockEvent(
  overrides: Partial<ConsensusBlockEvent> = {}
): ConsensusBlockEvent {
  return {
    blockNumber: 100,
    blockHash: '0xblockhash',
    timestamp: 1700000000,
    round: 0,
    prevRound: 0,
    roundChanged: false,
    proposer: '0xproposer',
    validatorCount: 21,
    prepareCount: 21,
    commitCount: 21,
    participationRate: 100,
    missedValidatorRate: 0,
    isEpochBoundary: false,
    ...overrides,
  }
}

function makeErrorEvent(
  overrides: Partial<ConsensusErrorEvent> = {}
): ConsensusErrorEvent {
  return {
    blockNumber: 100,
    blockHash: '0xblockhash',
    timestamp: 1700000000,
    errorType: 'round_change',
    severity: 'medium',
    errorMessage: 'test error',
    round: 1,
    expectedValidators: 21,
    actualSigners: 18,
    participationRate: 85,
    consensusImpacted: false,
    ...overrides,
  }
}

function makeForkEvent(
  overrides: Partial<ConsensusForkEvent> = {}
): ConsensusForkEvent {
  return {
    forkBlockNumber: 100,
    forkBlockHash: '0xforkhash',
    chain1Hash: '0xchain1',
    chain1Height: 101,
    chain1Weight: '1000',
    chain2Hash: '0xchain2',
    chain2Height: 101,
    chain2Weight: '999',
    resolved: false,
    detectedAt: 1700000000,
    detectionLag: 1,
    ...overrides,
  }
}

function makeValidatorChangeEvent(
  overrides: Partial<ConsensusValidatorChangeEvent> = {}
): ConsensusValidatorChangeEvent {
  return {
    blockNumber: 100,
    blockHash: '0xblockhash',
    timestamp: 1700000000,
    epochNumber: 5,
    isEpochBoundary: true,
    changeType: 'epoch_change',
    previousValidatorCount: 21,
    newValidatorCount: 22,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useConsensusStore', () => {
  beforeEach(() => {
    useConsensusStore.getState().clearAll()
  })

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useConsensusStore.getState()

      expect(state.isConnected).toBe(false)
      expect(state.lastConnectedAt).toBeNull()
      expect(state.connectionError).toBeNull()
      expect(state.latestBlock).toBeNull()
      expect(state.recentBlocks).toEqual([])
      expect(state.recentErrors).toEqual([])
      expect(state.recentForks).toEqual([])
      expect(state.recentValidatorChanges).toEqual([])
    })

    it('should have zeroed initial stats', () => {
      const { stats } = useConsensusStore.getState()

      expect(stats.totalBlocks).toBe(0)
      expect(stats.roundChanges).toBe(0)
      expect(stats.averageParticipation).toBe(0)
      expect(stats.errorCount).toBe(0)
      expect(stats.errorsBySeverity).toEqual({
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      })
    })

    it('should have healthy initial network health', () => {
      const { networkHealth } = useConsensusStore.getState()

      expect(networkHealth.score).toBe(CONSENSUS.HEALTH_SCORE_INITIAL)
      expect(networkHealth.status).toBe('excellent')
      expect(networkHealth.isHealthy).toBe(true)
      expect(networkHealth.participationRate).toBe(
        CONSENSUS.DEFAULT_PARTICIPATION_RATE
      )
      expect(networkHealth.roundChangeRate).toBe(0)
    })
  })

  // -----------------------------------------------------------------------
  // setConnectionStatus
  // -----------------------------------------------------------------------

  describe('setConnectionStatus', () => {
    it('should set connected status and record timestamp', () => {
      useConsensusStore.getState().setConnectionStatus(true)
      const state = useConsensusStore.getState()

      expect(state.isConnected).toBe(true)
      expect(state.lastConnectedAt).toBeInstanceOf(Date)
      expect(state.connectionError).toBeNull()
    })

    it('should set disconnected status with error message', () => {
      useConsensusStore.getState().setConnectionStatus(true)
      useConsensusStore.getState().setConnectionStatus(false, 'Connection lost')
      const state = useConsensusStore.getState()

      expect(state.isConnected).toBe(false)
      expect(state.connectionError).toBe('Connection lost')
      // lastConnectedAt should be preserved from the previous connection
      expect(state.lastConnectedAt).toBeInstanceOf(Date)
    })

    it('should clear error when no error string is provided', () => {
      useConsensusStore
        .getState()
        .setConnectionStatus(false, 'some error')
      useConsensusStore.getState().setConnectionStatus(true)
      expect(useConsensusStore.getState().connectionError).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // setLatestBlock
  // -----------------------------------------------------------------------

  describe('setLatestBlock', () => {
    it('should set the latest block and add to recentBlocks', () => {
      const block = makeBlockEvent({ blockNumber: 1 })
      useConsensusStore.getState().setLatestBlock(block)
      const state = useConsensusStore.getState()

      expect(state.latestBlock).not.toBeNull()
      expect(state.latestBlock!.blockNumber).toBe(1)
      expect(state.recentBlocks).toHaveLength(1)
    })

    it('should add receivedAt timestamp to the block', () => {
      useConsensusStore
        .getState()
        .setLatestBlock(makeBlockEvent({ blockNumber: 1 }))
      const { latestBlock } = useConsensusStore.getState()

      expect(latestBlock!.receivedAt).toBeInstanceOf(Date)
    })

    it('should prevent duplicate blocks by blockNumber', () => {
      const block = makeBlockEvent({ blockNumber: 42 })
      useConsensusStore.getState().setLatestBlock(block)
      useConsensusStore.getState().setLatestBlock(block)

      expect(useConsensusStore.getState().recentBlocks).toHaveLength(1)
    })

    it('should compute stats when blocks are added', () => {
      useConsensusStore
        .getState()
        .setLatestBlock(
          makeBlockEvent({
            blockNumber: 1,
            participationRate: 90,
            roundChanged: true,
          })
        )
      useConsensusStore
        .getState()
        .setLatestBlock(
          makeBlockEvent({
            blockNumber: 2,
            participationRate: 80,
            roundChanged: false,
          })
        )

      const { stats } = useConsensusStore.getState()
      expect(stats.totalBlocks).toBe(2)
      expect(stats.roundChanges).toBe(1)
      expect(stats.averageParticipation).toBe(85)
    })

    it('should recompute networkHealth when blocks are added', () => {
      useConsensusStore
        .getState()
        .setLatestBlock(
          makeBlockEvent({
            blockNumber: 1,
            participationRate: 100,
            roundChanged: false,
          })
        )

      const { networkHealth } = useConsensusStore.getState()
      expect(networkHealth.participationRate).toBe(100)
      expect(networkHealth.isHealthy).toBe(true)
    })

    it('should limit recentBlocks to MAX_RECENT_BLOCKS', () => {
      for (let i = 0; i < CONSENSUS.MAX_RECENT_BLOCKS + 10; i++) {
        useConsensusStore
          .getState()
          .setLatestBlock(makeBlockEvent({ blockNumber: i }))
      }

      expect(useConsensusStore.getState().recentBlocks).toHaveLength(
        CONSENSUS.MAX_RECENT_BLOCKS
      )
    })
  })

  // -----------------------------------------------------------------------
  // addError
  // -----------------------------------------------------------------------

  describe('addError', () => {
    it('should add an error with receivedAt timestamp', () => {
      const error = makeErrorEvent({ severity: 'high' })
      useConsensusStore.getState().addError(error)
      const state = useConsensusStore.getState()

      expect(state.recentErrors).toHaveLength(1)
      expect(state.recentErrors[0]!.receivedAt).toBeInstanceOf(Date)
    })

    it('should update stats.errorsBySeverity correctly', () => {
      useConsensusStore
        .getState()
        .addError(makeErrorEvent({ blockNumber: 1, severity: 'critical' }))
      useConsensusStore
        .getState()
        .addError(makeErrorEvent({ blockNumber: 2, severity: 'high' }))
      useConsensusStore
        .getState()
        .addError(makeErrorEvent({ blockNumber: 3, severity: 'medium' }))
      useConsensusStore
        .getState()
        .addError(makeErrorEvent({ blockNumber: 4, severity: 'low' }))

      const { stats } = useConsensusStore.getState()
      expect(stats.errorCount).toBe(4)
      expect(stats.errorsBySeverity.critical).toBe(1)
      expect(stats.errorsBySeverity.high).toBe(1)
      expect(stats.errorsBySeverity.medium).toBe(1)
      expect(stats.errorsBySeverity.low).toBe(1)
    })

    it('should recompute networkHealth when errors are added', () => {
      // Add a critical error which should reduce health score
      useConsensusStore
        .getState()
        .addError(makeErrorEvent({ severity: 'critical' }))

      const { networkHealth } = useConsensusStore.getState()
      expect(networkHealth.score).toBeLessThan(CONSENSUS.HEALTH_SCORE_INITIAL)
    })

    it('should limit recentErrors to MAX_RECENT_ERRORS', () => {
      for (let i = 0; i < CONSENSUS.MAX_RECENT_ERRORS + 10; i++) {
        useConsensusStore
          .getState()
          .addError(makeErrorEvent({ blockNumber: i }))
      }

      expect(useConsensusStore.getState().recentErrors).toHaveLength(
        CONSENSUS.MAX_RECENT_ERRORS
      )
    })

    it('should prepend new errors at the front', () => {
      useConsensusStore
        .getState()
        .addError(makeErrorEvent({ blockNumber: 1, errorMessage: 'first' }))
      useConsensusStore
        .getState()
        .addError(makeErrorEvent({ blockNumber: 2, errorMessage: 'second' }))

      const errors = useConsensusStore.getState().recentErrors
      expect(errors[0]!.errorMessage).toBe('second')
      expect(errors[1]!.errorMessage).toBe('first')
    })
  })

  // -----------------------------------------------------------------------
  // addFork / updateForkResolution
  // -----------------------------------------------------------------------

  describe('addFork', () => {
    it('should add a fork event with receivedAt timestamp', () => {
      const fork = makeForkEvent({ forkBlockNumber: 50 })
      useConsensusStore.getState().addFork(fork)
      const state = useConsensusStore.getState()

      expect(state.recentForks).toHaveLength(1)
      expect(state.recentForks[0]!.receivedAt).toBeInstanceOf(Date)
      expect(state.recentForks[0]!.forkBlockNumber).toBe(50)
    })

    it('should limit recentForks to MAX_RECENT_FORKS', () => {
      for (let i = 0; i < CONSENSUS.MAX_RECENT_FORKS + 5; i++) {
        useConsensusStore
          .getState()
          .addFork(makeForkEvent({ forkBlockNumber: i }))
      }

      expect(useConsensusStore.getState().recentForks).toHaveLength(
        CONSENSUS.MAX_RECENT_FORKS
      )
    })
  })

  describe('updateForkResolution', () => {
    it('should mark a fork as resolved with the winning chain', () => {
      useConsensusStore
        .getState()
        .addFork(makeForkEvent({ forkBlockNumber: 100 }))

      useConsensusStore.getState().updateForkResolution(100, 1)

      const fork = useConsensusStore.getState().recentForks[0]!
      expect(fork.resolved).toBe(true)
      expect(fork.winningChain).toBe(1)
    })

    it('should not modify other forks', () => {
      useConsensusStore
        .getState()
        .addFork(makeForkEvent({ forkBlockNumber: 100 }))
      useConsensusStore
        .getState()
        .addFork(makeForkEvent({ forkBlockNumber: 200 }))

      useConsensusStore.getState().updateForkResolution(100, 2)

      const forks = useConsensusStore.getState().recentForks
      // forkBlockNumber=200 is at index 0 (prepended), 100 at index 1
      const fork200 = forks.find((f) => f.forkBlockNumber === 200)!
      const fork100 = forks.find((f) => f.forkBlockNumber === 100)!

      expect(fork200.resolved).toBe(false)
      expect(fork100.resolved).toBe(true)
      expect(fork100.winningChain).toBe(2)
    })
  })

  // -----------------------------------------------------------------------
  // addValidatorChange
  // -----------------------------------------------------------------------

  describe('addValidatorChange', () => {
    it('should add a validator change with receivedAt timestamp', () => {
      const change = makeValidatorChangeEvent()
      useConsensusStore.getState().addValidatorChange(change)
      const state = useConsensusStore.getState()

      expect(state.recentValidatorChanges).toHaveLength(1)
      expect(state.recentValidatorChanges[0]!.receivedAt).toBeInstanceOf(Date)
    })
  })

  // -----------------------------------------------------------------------
  // clearAll
  // -----------------------------------------------------------------------

  describe('clearAll', () => {
    it('should reset all data collections and computed state', () => {
      // Populate store
      useConsensusStore
        .getState()
        .setLatestBlock(makeBlockEvent({ blockNumber: 1 }))
      useConsensusStore
        .getState()
        .addError(makeErrorEvent({ severity: 'critical' }))
      useConsensusStore
        .getState()
        .addFork(makeForkEvent({ forkBlockNumber: 1 }))
      useConsensusStore
        .getState()
        .addValidatorChange(makeValidatorChangeEvent())

      // Clear
      useConsensusStore.getState().clearAll()

      const state = useConsensusStore.getState()
      expect(state.latestBlock).toBeNull()
      expect(state.recentBlocks).toEqual([])
      expect(state.recentErrors).toEqual([])
      expect(state.recentForks).toEqual([])
      expect(state.recentValidatorChanges).toEqual([])
      expect(state.stats.totalBlocks).toBe(0)
      expect(state.networkHealth.score).toBe(CONSENSUS.HEALTH_SCORE_INITIAL)
    })

    it('should not reset connection status', () => {
      useConsensusStore.getState().setConnectionStatus(true)
      useConsensusStore.getState().clearAll()

      // clearAll does not touch isConnected
      expect(useConsensusStore.getState().isConnected).toBe(true)
    })
  })

  // -----------------------------------------------------------------------
  // Selectors
  // -----------------------------------------------------------------------

  describe('selectors', () => {
    describe('selectHighPriorityErrors', () => {
      it('should return only critical and high severity errors', () => {
        useConsensusStore
          .getState()
          .addError(makeErrorEvent({ blockNumber: 1, severity: 'critical' }))
        useConsensusStore
          .getState()
          .addError(makeErrorEvent({ blockNumber: 2, severity: 'high' }))
        useConsensusStore
          .getState()
          .addError(makeErrorEvent({ blockNumber: 3, severity: 'medium' }))
        useConsensusStore
          .getState()
          .addError(makeErrorEvent({ blockNumber: 4, severity: 'low' }))

        const highPriority = selectHighPriorityErrors(
          useConsensusStore.getState()
        )
        expect(highPriority).toHaveLength(2)
        expect(highPriority.every((e) => e.severity === 'critical' || e.severity === 'high')).toBe(
          true
        )
      })

      it('should return empty array when no high priority errors exist', () => {
        useConsensusStore
          .getState()
          .addError(makeErrorEvent({ severity: 'low' }))
        expect(
          selectHighPriorityErrors(useConsensusStore.getState())
        ).toEqual([])
      })
    })

    describe('selectUnresolvedForks', () => {
      it('should return only unresolved forks', () => {
        useConsensusStore
          .getState()
          .addFork(makeForkEvent({ forkBlockNumber: 1 }))
        useConsensusStore
          .getState()
          .addFork(makeForkEvent({ forkBlockNumber: 2 }))

        useConsensusStore.getState().updateForkResolution(1, 1)

        const unresolved = selectUnresolvedForks(useConsensusStore.getState())
        expect(unresolved).toHaveLength(1)
        expect(unresolved[0]!.forkBlockNumber).toBe(2)
      })

      it('should return empty array when all forks are resolved', () => {
        useConsensusStore
          .getState()
          .addFork(makeForkEvent({ forkBlockNumber: 1 }))
        useConsensusStore.getState().updateForkResolution(1, 1)

        expect(
          selectUnresolvedForks(useConsensusStore.getState())
        ).toEqual([])
      })
    })

    describe('selectRecentEpochBoundaries', () => {
      it('should return only blocks that are epoch boundaries', () => {
        useConsensusStore
          .getState()
          .setLatestBlock(
            makeBlockEvent({ blockNumber: 1, isEpochBoundary: true })
          )
        useConsensusStore
          .getState()
          .setLatestBlock(
            makeBlockEvent({ blockNumber: 2, isEpochBoundary: false })
          )
        useConsensusStore
          .getState()
          .setLatestBlock(
            makeBlockEvent({ blockNumber: 3, isEpochBoundary: true })
          )

        const boundaries = selectRecentEpochBoundaries(
          useConsensusStore.getState()
        )
        expect(boundaries).toHaveLength(2)
        expect(boundaries.every((b) => b.isEpochBoundary)).toBe(true)
      })
    })

    describe('selectRoundChangedBlocks', () => {
      it('should return only blocks with round changes', () => {
        useConsensusStore
          .getState()
          .setLatestBlock(
            makeBlockEvent({ blockNumber: 1, roundChanged: true })
          )
        useConsensusStore
          .getState()
          .setLatestBlock(
            makeBlockEvent({ blockNumber: 2, roundChanged: false })
          )

        const roundChanged = selectRoundChangedBlocks(
          useConsensusStore.getState()
        )
        expect(roundChanged).toHaveLength(1)
        expect(roundChanged[0]!.roundChanged).toBe(true)
      })
    })
  })
})
