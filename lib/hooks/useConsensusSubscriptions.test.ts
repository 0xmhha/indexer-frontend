import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import type {
  ConsensusBlockEvent,
  ConsensusErrorEvent,
  ConsensusForkEvent,
  ConsensusValidatorChangeEvent,
  ConsensusStats,
  NetworkHealth,
} from '@/types/consensus'

// ============================================================================
// Mocks
// ============================================================================

const mockUseSubscription = vi.fn()
vi.mock('@apollo/client', () => ({
  useSubscription: (...args: unknown[]) => mockUseSubscription(...args),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}))

vi.mock('@/lib/apollo/queries', () => ({
  SUBSCRIBE_CONSENSUS_BLOCK: 'SUBSCRIBE_CONSENSUS_BLOCK',
  SUBSCRIBE_CONSENSUS_ERROR: 'SUBSCRIBE_CONSENSUS_ERROR',
  SUBSCRIBE_CONSENSUS_FORK: 'SUBSCRIBE_CONSENSUS_FORK',
  SUBSCRIBE_CONSENSUS_VALIDATOR_CHANGE: 'SUBSCRIBE_CONSENSUS_VALIDATOR_CHANGE',
}))

vi.mock('@/lib/config/constants', () => ({
  REPLAY: {
    CONSENSUS_BLOCKS_DEFAULT: 10,
    CONSENSUS_ERRORS_DEFAULT: 5,
    CONSENSUS_FORKS_DEFAULT: 5,
    VALIDATOR_CHANGES_DEFAULT: 10,
  },
}))

// Store action mocks
const mockSetLatestBlock = vi.fn()
const mockSetConnectionStatus = vi.fn()
const mockAddError = vi.fn()
const mockAddFork = vi.fn()
const mockUpdateForkResolution = vi.fn()
const mockAddValidatorChange = vi.fn()
const mockClearAll = vi.fn()
const mockAcknowledgeError = vi.fn()

let mockLatestBlock: ConsensusBlockEvent | null = null
let mockRecentBlocks: ConsensusBlockEvent[] = []
let mockRecentErrors: ConsensusErrorEvent[] = []
let mockRecentForks: ConsensusForkEvent[] = []
let mockRecentValidatorChanges: ConsensusValidatorChangeEvent[] = []
let mockStats: ConsensusStats = {
  totalBlocks: 0,
  roundChanges: 0,
  averageParticipation: 0,
  errorCount: 0,
  errorsBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
  lastUpdated: new Date().toISOString(),
}
let mockNetworkHealth: NetworkHealth = {
  score: 100,
  status: 'excellent',
  isHealthy: true,
  participationRate: 100,
  roundChangeRate: 0,
}

vi.mock('@/stores/consensusStore', () => ({
  useConsensusStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    const state: Record<string, unknown> = {
      latestBlock: mockLatestBlock,
      recentBlocks: mockRecentBlocks,
      recentErrors: mockRecentErrors,
      recentForks: mockRecentForks,
      recentValidatorChanges: mockRecentValidatorChanges,
      stats: mockStats,
      networkHealth: mockNetworkHealth,
      setLatestBlock: mockSetLatestBlock,
      setConnectionStatus: mockSetConnectionStatus,
      addError: mockAddError,
      addFork: mockAddFork,
      updateForkResolution: mockUpdateForkResolution,
      addValidatorChange: mockAddValidatorChange,
      clearAll: mockClearAll,
      acknowledgeError: mockAcknowledgeError,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

let mockIsConnected = true
vi.mock('@/stores/realtimeStore', () => ({
  useRealtimeStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    const state: Record<string, unknown> = {
      isConnected: mockIsConnected,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('@/lib/errors/logger', () => ({
  errorLogger: { error: vi.fn() },
}))

// Import after mocks
import {
  useConsensusBlockSubscription,
  useConsensusErrorSubscription,
  useConsensusForkSubscription,
  useConsensusValidatorChangeSubscription,
  useConsensusMonitoring,
} from './useConsensusSubscriptions'

// ============================================================================
// Test Fixtures
// ============================================================================

function makeBlockEvent(overrides: Partial<ConsensusBlockEvent> = {}): ConsensusBlockEvent {
  return {
    blockNumber: 100,
    blockHash: '0xabc',
    timestamp: 1700000000,
    round: 0,
    prevRound: 0,
    roundChanged: false,
    proposer: '0x1234',
    validatorCount: 4,
    prepareCount: 4,
    commitCount: 4,
    participationRate: 100,
    missedValidatorRate: 0,
    isEpochBoundary: false,
    consensusImpacted: false,
    ...overrides,
  } as ConsensusBlockEvent
}

function makeErrorEvent(overrides: Partial<ConsensusErrorEvent> = {}): ConsensusErrorEvent {
  return {
    blockNumber: 50,
    blockHash: '0xdef',
    timestamp: 1700000000,
    errorType: 'low_participation',
    severity: 'medium',
    errorMessage: 'Participation below threshold',
    round: 1,
    expectedValidators: 4,
    actualSigners: 2,
    participationRate: 50,
    consensusImpacted: false,
    ...overrides,
  }
}

function makeForkEvent(overrides: Partial<ConsensusForkEvent> = {}): ConsensusForkEvent {
  return {
    forkBlockNumber: 200,
    forkBlockHash: '0xfork',
    chain1Hash: '0xchain1',
    chain1Height: 201,
    chain1Weight: '100',
    chain2Hash: '0xchain2',
    chain2Height: 201,
    chain2Weight: '99',
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
    blockNumber: 300,
    blockHash: '0xval',
    timestamp: 1700000000,
    epochNumber: 10,
    isEpochBoundary: true,
    changeType: 'epoch_change',
    previousValidatorCount: 4,
    newValidatorCount: 5,
    ...overrides,
  }
}

// ============================================================================
// useConsensusBlockSubscription
// ============================================================================

describe('useConsensusBlockSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLatestBlock = null
    mockRecentBlocks = []
    mockUseSubscription.mockReturnValue({ data: null, loading: true, error: null })
  })

  it('subscribes with default replayLast variable', () => {
    renderHook(() => useConsensusBlockSubscription())
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SUBSCRIBE_CONSENSUS_BLOCK',
      expect.objectContaining({
        variables: { replayLast: 10 },
        fetchPolicy: 'no-cache',
      })
    )
  })

  it('accepts custom replayLast option', () => {
    renderHook(() => useConsensusBlockSubscription({ replayLast: 25 }))
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SUBSCRIBE_CONSENSUS_BLOCK',
      expect.objectContaining({
        variables: { replayLast: 25 },
      })
    )
  })

  it('returns loading state from subscription', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: true, error: null })
    const { result } = renderHook(() => useConsensusBlockSubscription())
    expect(result.current.loading).toBe(true)
  })

  it('returns subscription error', () => {
    const subscriptionError = new Error('WebSocket disconnected')
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: subscriptionError })
    const { result } = renderHook(() => useConsensusBlockSubscription())
    expect(result.current.error).toBe(subscriptionError)
  })

  it('returns latestBlock from subscription data when available', () => {
    const block = makeBlockEvent({ blockNumber: 999 })
    mockUseSubscription.mockReturnValue({
      data: { consensusBlock: block },
      loading: false,
      error: null,
    })
    const { result } = renderHook(() => useConsensusBlockSubscription())
    expect(result.current.latestBlock).toBe(block)
  })

  it('falls back to store latestBlock when subscription data is null', () => {
    const storeBlock = makeBlockEvent({ blockNumber: 500 })
    mockLatestBlock = storeBlock
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusBlockSubscription())
    expect(result.current.latestBlock).toBe(storeBlock)
  })

  it('returns recentBlocks from store', () => {
    const blocks = [makeBlockEvent({ blockNumber: 1 }), makeBlockEvent({ blockNumber: 2 })]
    mockRecentBlocks = blocks
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusBlockSubscription())
    expect(result.current.recentBlocks).toBe(blocks)
  })

  it('calls setLatestBlock via onData callback', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useConsensusBlockSubscription())

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    const block = makeBlockEvent({ blockNumber: 42 })
    onData({ data: { data: { consensusBlock: block } } })
    expect(mockSetLatestBlock).toHaveBeenCalledWith(block)
  })

  it('does not call setLatestBlock when onData payload has no block', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useConsensusBlockSubscription())

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    onData({ data: { data: {} } })
    expect(mockSetLatestBlock).not.toHaveBeenCalled()
  })

  it('calls setConnectionStatus on subscription error via onError', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useConsensusBlockSubscription())

    const onError = mockUseSubscription.mock.calls[0]![1].onError
    const err = new Error('Connection lost')
    onError(err)
    expect(mockSetConnectionStatus).toHaveBeenCalledWith(false, 'Connection lost')
  })
})

// ============================================================================
// useConsensusErrorSubscription
// ============================================================================

describe('useConsensusErrorSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRecentErrors = []
    mockStats = {
      totalBlocks: 0,
      roundChanges: 0,
      averageParticipation: 0,
      errorCount: 3,
      errorsBySeverity: { critical: 1, high: 0, medium: 1, low: 1 },
      lastUpdated: new Date().toISOString(),
    }
    mockUseSubscription.mockReturnValue({ data: null, loading: true, error: null })
  })

  it('subscribes with default replayLast of 5', () => {
    renderHook(() => useConsensusErrorSubscription())
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SUBSCRIBE_CONSENSUS_ERROR',
      expect.objectContaining({
        variables: { replayLast: 5 },
        fetchPolicy: 'no-cache',
      })
    )
  })

  it('returns latestError from subscription data', () => {
    const errorEvt = makeErrorEvent({ blockNumber: 77 })
    mockUseSubscription.mockReturnValue({
      data: { consensusError: errorEvt },
      loading: false,
      error: null,
    })
    const { result } = renderHook(() => useConsensusErrorSubscription())
    expect(result.current.latestError).toBe(errorEvt)
  })

  it('falls back to first recentError from store', () => {
    const storedError = makeErrorEvent({ blockNumber: 33 })
    mockRecentErrors = [storedError]
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusErrorSubscription())
    expect(result.current.latestError).toBe(storedError)
  })

  it('returns null latestError when no data and no stored errors', () => {
    mockRecentErrors = []
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusErrorSubscription())
    expect(result.current.latestError).toBeNull()
  })

  it('returns errorCount and errorsBySeverity from stats', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusErrorSubscription())
    expect(result.current.errorCount).toBe(3)
    expect(result.current.errorsBySeverity).toEqual({ critical: 1, high: 0, medium: 1, low: 1 })
  })

  it('calls addError via onData callback', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useConsensusErrorSubscription())

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    const errorEvt = makeErrorEvent({ blockNumber: 88 })
    onData({ data: { data: { consensusError: errorEvt } } })
    expect(mockAddError).toHaveBeenCalledWith(errorEvt)
  })

  it('does not call addError when onData payload has no error event', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useConsensusErrorSubscription())

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    onData({ data: { data: {} } })
    expect(mockAddError).not.toHaveBeenCalled()
  })
})

// ============================================================================
// useConsensusForkSubscription
// ============================================================================

describe('useConsensusForkSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRecentForks = []
    mockUseSubscription.mockReturnValue({ data: null, loading: true, error: null })
  })

  it('subscribes with default replayLast of 5', () => {
    renderHook(() => useConsensusForkSubscription())
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SUBSCRIBE_CONSENSUS_FORK',
      expect.objectContaining({
        variables: { replayLast: 5 },
      })
    )
  })

  it('returns latestFork from subscription data', () => {
    const fork = makeForkEvent({ forkBlockNumber: 500 })
    mockUseSubscription.mockReturnValue({
      data: { consensusFork: fork },
      loading: false,
      error: null,
    })
    const { result } = renderHook(() => useConsensusForkSubscription())
    expect(result.current.latestFork).toBe(fork)
  })

  it('falls back to first recentFork from store', () => {
    const storedFork = makeForkEvent({ forkBlockNumber: 400 })
    mockRecentForks = [storedFork]
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusForkSubscription())
    expect(result.current.latestFork).toBe(storedFork)
  })

  it('returns null latestFork when no data and no stored forks', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusForkSubscription())
    expect(result.current.latestFork).toBeNull()
  })

  it('calls addFork for unresolved fork via onData', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useConsensusForkSubscription())

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    const fork = makeForkEvent({ resolved: false })
    onData({ data: { data: { consensusFork: fork } } })
    expect(mockAddFork).toHaveBeenCalledWith(fork)
    expect(mockUpdateForkResolution).not.toHaveBeenCalled()
  })

  it('calls updateForkResolution for resolved fork via onData', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useConsensusForkSubscription())

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    const fork = makeForkEvent({ resolved: true, winningChain: 1, forkBlockNumber: 200 })
    onData({ data: { data: { consensusFork: fork } } })
    expect(mockUpdateForkResolution).toHaveBeenCalledWith(200, 1)
    expect(mockAddFork).not.toHaveBeenCalled()
  })

  it('does not call any store action when onData payload has no fork', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useConsensusForkSubscription())

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    onData({ data: { data: {} } })
    expect(mockAddFork).not.toHaveBeenCalled()
    expect(mockUpdateForkResolution).not.toHaveBeenCalled()
  })

  it('computes unresolvedForks from store', () => {
    mockRecentForks = [
      makeForkEvent({ forkBlockNumber: 1, resolved: false }),
      makeForkEvent({ forkBlockNumber: 2, resolved: true }),
      makeForkEvent({ forkBlockNumber: 3, resolved: false }),
    ]
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusForkSubscription())
    expect(result.current.unresolvedForks).toHaveLength(2)
    expect(result.current.hasUnresolvedForks).toBe(true)
  })

  it('returns hasUnresolvedForks false when all forks resolved', () => {
    mockRecentForks = [makeForkEvent({ resolved: true })]
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusForkSubscription())
    expect(result.current.unresolvedForks).toHaveLength(0)
    expect(result.current.hasUnresolvedForks).toBe(false)
  })
})

// ============================================================================
// useConsensusValidatorChangeSubscription
// ============================================================================

describe('useConsensusValidatorChangeSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRecentValidatorChanges = []
    mockUseSubscription.mockReturnValue({ data: null, loading: true, error: null })
  })

  it('subscribes with default replayLast of 10', () => {
    renderHook(() => useConsensusValidatorChangeSubscription())
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SUBSCRIBE_CONSENSUS_VALIDATOR_CHANGE',
      expect.objectContaining({
        variables: { replayLast: 10 },
      })
    )
  })

  it('returns latestChange from subscription data', () => {
    const change = makeValidatorChangeEvent({ epochNumber: 15 })
    mockUseSubscription.mockReturnValue({
      data: { consensusValidatorChange: change },
      loading: false,
      error: null,
    })
    const { result } = renderHook(() => useConsensusValidatorChangeSubscription())
    expect(result.current.latestChange).toBe(change)
  })

  it('falls back to first recentChange from store', () => {
    const storedChange = makeValidatorChangeEvent({ epochNumber: 8 })
    mockRecentValidatorChanges = [storedChange]
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusValidatorChangeSubscription())
    expect(result.current.latestChange).toBe(storedChange)
  })

  it('returns null latestChange when no data and no stored changes', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusValidatorChangeSubscription())
    expect(result.current.latestChange).toBeNull()
  })

  it('calls addValidatorChange via onData callback', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useConsensusValidatorChangeSubscription())

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    const change = makeValidatorChangeEvent({ epochNumber: 20 })
    onData({ data: { data: { consensusValidatorChange: change } } })
    expect(mockAddValidatorChange).toHaveBeenCalledWith(change)
  })

  it('does not call addValidatorChange when onData payload is empty', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useConsensusValidatorChangeSubscription())

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    onData({ data: { data: {} } })
    expect(mockAddValidatorChange).not.toHaveBeenCalled()
  })

  it('returns recentChanges from store', () => {
    const changes = [makeValidatorChangeEvent(), makeValidatorChangeEvent({ epochNumber: 11 })]
    mockRecentValidatorChanges = changes
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusValidatorChangeSubscription())
    expect(result.current.recentChanges).toBe(changes)
  })
})

// ============================================================================
// useConsensusMonitoring
// ============================================================================

describe('useConsensusMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsConnected = true
    mockLatestBlock = null
    mockRecentBlocks = []
    mockRecentErrors = []
    mockRecentForks = []
    mockRecentValidatorChanges = []
    mockStats = {
      totalBlocks: 0,
      roundChanges: 0,
      averageParticipation: 0,
      errorCount: 0,
      errorsBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
      lastUpdated: new Date().toISOString(),
    }
    mockNetworkHealth = {
      score: 100,
      status: 'excellent',
      isHealthy: true,
      participationRate: 100,
      roundChangeRate: 0,
    }
    // useConsensusMonitoring calls all 4 subscription hooks internally
    mockUseSubscription.mockReturnValue({ data: null, loading: true, error: null })
  })

  it('returns isConnected from realtimeStore', () => {
    const { result } = renderHook(() => useConsensusMonitoring())
    expect(result.current.isConnected).toBe(true)
  })

  it('returns isConnected as false when disconnected', () => {
    mockIsConnected = false
    const { result } = renderHook(() => useConsensusMonitoring())
    expect(result.current.isConnected).toBe(false)
  })

  it('returns store data for blocks, errors, forks, validatorChanges', () => {
    mockLatestBlock = makeBlockEvent({ blockNumber: 1 })
    mockRecentBlocks = [mockLatestBlock]
    mockRecentErrors = [makeErrorEvent()]
    mockRecentForks = [makeForkEvent()]
    mockRecentValidatorChanges = [makeValidatorChangeEvent()]

    const { result } = renderHook(() => useConsensusMonitoring())
    expect(result.current.latestBlock).toBe(mockLatestBlock)
    expect(result.current.recentBlocks).toBe(mockRecentBlocks)
    expect(result.current.recentErrors).toBe(mockRecentErrors)
    expect(result.current.recentForks).toBe(mockRecentForks)
    expect(result.current.recentValidatorChanges).toBe(mockRecentValidatorChanges)
  })

  it('returns stats and networkHealth from store', () => {
    const { result } = renderHook(() => useConsensusMonitoring())
    expect(result.current.stats).toBe(mockStats)
    expect(result.current.networkHealth).toBe(mockNetworkHealth)
  })

  it('returns isLoading true when all subscriptions are loading', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: true, error: null })
    const { result } = renderHook(() => useConsensusMonitoring())
    expect(result.current.isLoading).toBe(true)
  })

  it('returns isLoading false when at least one subscription is not loading', () => {
    // The hook calls useSubscription 4 times; make the first return loading=false
    mockUseSubscription
      .mockReturnValueOnce({ data: null, loading: false, error: null })
      .mockReturnValue({ data: null, loading: true, error: null })
    const { result } = renderHook(() => useConsensusMonitoring())
    expect(result.current.isLoading).toBe(false)
  })

  it('returns hasSubscriptionError true when any subscription has error', () => {
    mockUseSubscription
      .mockReturnValueOnce({ data: null, loading: false, error: new Error('fail') })
      .mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusMonitoring())
    expect(result.current.hasSubscriptionError).toBe(true)
  })

  it('returns hasSubscriptionError false when no subscriptions have errors', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusMonitoring())
    expect(result.current.hasSubscriptionError).toBe(false)
  })

  it('filters highPriorityErrors from recentErrors', () => {
    mockRecentErrors = [
      makeErrorEvent({ severity: 'critical', blockNumber: 1 }),
      makeErrorEvent({ severity: 'low', blockNumber: 2 }),
      makeErrorEvent({ severity: 'high', blockNumber: 3 }),
      makeErrorEvent({ severity: 'medium', blockNumber: 4 }),
    ]
    const { result } = renderHook(() => useConsensusMonitoring())
    expect(result.current.highPriorityErrors).toHaveLength(2)
    expect(result.current.highPriorityErrors[0]!.severity).toBe('critical')
    expect(result.current.highPriorityErrors[1]!.severity).toBe('high')
  })

  it('returns clearAll and acknowledgeError action references', () => {
    const { result } = renderHook(() => useConsensusMonitoring())
    expect(result.current.clearAll).toBe(mockClearAll)
    expect(result.current.acknowledgeError).toBe(mockAcknowledgeError)
  })

  it('computes hasUnresolvedForks from fork subscription', () => {
    mockRecentForks = [makeForkEvent({ resolved: false })]
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useConsensusMonitoring())
    expect(result.current.hasUnresolvedForks).toBe(true)
    expect(result.current.unresolvedForks).toHaveLength(1)
  })
})
