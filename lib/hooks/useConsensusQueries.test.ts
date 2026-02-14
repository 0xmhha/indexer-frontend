import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useConsensusData,
  useValidatorStats,
  useValidatorParticipation,
  useAllValidatorStats,
  useEpochData,
  useLatestEpochData,
  useEpochs,
  useBlockSigners,
} from './useConsensusQueries'

// Mock Apollo Client
const mockUseQuery = vi.fn()
vi.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}))

// Mock GraphQL queries
vi.mock('@/lib/graphql/queries/consensus', () => ({
  GET_WBFT_BLOCK_EXTRA: 'GET_WBFT_BLOCK_EXTRA',
  GET_VALIDATOR_SIGNING_STATS: 'GET_VALIDATOR_SIGNING_STATS',
  GET_VALIDATOR_SIGNING_ACTIVITY: 'GET_VALIDATOR_SIGNING_ACTIVITY',
  GET_ALL_VALIDATORS_SIGNING_STATS: 'GET_ALL_VALIDATORS_SIGNING_STATS',
  GET_EPOCH_INFO: 'GET_EPOCH_INFO',
  GET_LATEST_EPOCH_INFO: 'GET_LATEST_EPOCH_INFO',
  GET_EPOCHS: 'GET_EPOCHS',
  GET_BLOCK_SIGNERS: 'GET_BLOCK_SIGNERS',
}))

vi.mock('@/lib/apollo/queries/block', () => ({
  GET_LATEST_HEIGHT: 'GET_LATEST_HEIGHT',
}))

// Mock constants
vi.mock('@/lib/config/constants', () => ({
  PAGINATION: { DEFAULT_PAGE_SIZE: 20 },
  POLLING_INTERVALS: { FAST: 10_000 },
  CONSENSUS: { PARTICIPATION_CRITICAL_THRESHOLD: 66.7 },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a default mock return value for useQuery in loading state. */
function loadingQueryResult() {
  return {
    data: null,
    loading: true,
    error: undefined,
    refetch: vi.fn(),
    fetchMore: vi.fn(),
    previousData: null,
  }
}

/** Returns a default mock return value for useQuery in idle/skipped state. */
function idleQueryResult() {
  return {
    data: null,
    loading: false,
    error: undefined,
    refetch: vi.fn(),
    fetchMore: vi.fn(),
    previousData: null,
  }
}

/** Builds an ApolloError-like object with the given message. */
function makeError(message: string) {
  return new Error(message)
}

/** Consensus-unsupported error message used by the backend. */
const UNSUPPORTED_MSG = 'storage does not support consensus operations'

// ---------------------------------------------------------------------------
// useConsensusData
// ---------------------------------------------------------------------------

describe('useConsensusData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state while both queries are in flight', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    const { result } = renderHook(() => useConsensusData('100'))

    expect(result.current.loading).toBe(true)
    expect(result.current.consensusData).toBeNull()
  })

  it('should skip queries when blockNumber is empty', () => {
    mockUseQuery.mockReturnValue(idleQueryResult())

    renderHook(() => useConsensusData(''))

    // Called twice: once for WBFT, once for signers
    expect(mockUseQuery).toHaveBeenCalledTimes(2)
    for (const call of mockUseQuery.mock.calls) {
      const options = call[1] as Record<string, unknown>
      expect(options.skip).toBe(true)
    }
  })

  it('should pass correct variables to both queries', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    renderHook(() => useConsensusData('42'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_WBFT_BLOCK_EXTRA',
      expect.objectContaining({ variables: { blockNumber: '42' }, skip: false }),
    )
    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_BLOCK_SIGNERS',
      expect.objectContaining({ variables: { blockNumber: '42' }, skip: false }),
    )
  })

  it('should transform wbft + signers data into ConsensusData', () => {
    const wbftExtra = {
      blockNumber: '100',
      blockHash: '0xabc',
      randaoReveal: '0x',
      prevRound: 0,
      round: 1,
      gasTip: '1000',
      timestamp: '1700000000',
    }

    const signers = {
      blockNumber: '100',
      preparers: ['0xA', '0xB', '0xC'],
      committers: ['0xA', '0xB'],
    }

    // First call returns wbft data, second call returns signers data
    mockUseQuery
      .mockReturnValueOnce({
        data: { wbftBlockExtra: wbftExtra },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })
      .mockReturnValueOnce({
        data: { blockSigners: signers },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

    const { result } = renderHook(() => useConsensusData('100'))

    expect(result.current.loading).toBe(false)
    expect(result.current.consensusData).not.toBeNull()
    expect(result.current.consensusData!.round).toBe(1)
    expect(result.current.consensusData!.prevRound).toBe(0)
    expect(result.current.consensusData!.prepareCount).toBe(3)
    expect(result.current.consensusData!.commitCount).toBe(2)
    expect(result.current.consensusData!.gasTip).toBe('1000')
    expect(result.current.consensusData!.proposer).toBe('0xA')
    // 0xC missed commit
    expect(result.current.consensusData!.missedCommit).toContain('0xC')
    expect(result.current.consensusData!.isEpochBoundary).toBe(false)
  })

  it('should calculate participation rate correctly', () => {
    const wbftExtra = {
      blockNumber: '100',
      blockHash: '0x',
      randaoReveal: '0x',
      prevRound: 0,
      round: 1,
      timestamp: '0',
    }

    // 2 preparers, 2 committers out of 2 validators -> (2+2)/(2*2)*100 = 100%
    const signers = {
      blockNumber: '100',
      preparers: ['0xA', '0xB'],
      committers: ['0xA', '0xB'],
    }

    mockUseQuery
      .mockReturnValueOnce({
        data: { wbftBlockExtra: wbftExtra },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })
      .mockReturnValueOnce({
        data: { blockSigners: signers },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

    const { result } = renderHook(() => useConsensusData('100'))

    expect(result.current.consensusData!.participationRate).toBe(100)
    expect(result.current.consensusData!.isHealthy).toBe(true)
  })

  it('should mark unhealthy when participation is below critical threshold', () => {
    const wbftExtra = {
      blockNumber: '100',
      blockHash: '0x',
      randaoReveal: '0x',
      prevRound: 0,
      round: 1,
      timestamp: '0',
    }

    // 1 preparer, 0 committers out of 4 validators -> (1+0)/(4*2)*100 = 12.5%
    const signers = {
      blockNumber: '100',
      preparers: ['0xA'],
      committers: ['0xB', '0xC', '0xD'],
    }

    mockUseQuery
      .mockReturnValueOnce({
        data: { wbftBlockExtra: wbftExtra },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })
      .mockReturnValueOnce({
        data: { blockSigners: signers },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

    const { result } = renderHook(() => useConsensusData('100'))

    // 4 unique validators, (1+3)/(4*2)*100 = 50%
    expect(result.current.consensusData!.participationRate).toBe(50)
    expect(result.current.consensusData!.isHealthy).toBe(false)
  })

  it('should detect epoch boundary when epochInfo is present', () => {
    const wbftExtra = {
      blockNumber: '100',
      blockHash: '0x',
      randaoReveal: '0x',
      prevRound: 0,
      round: 1,
      timestamp: '0',
      epochInfo: {
        epochNumber: '5',
        blockNumber: '100',
        candidates: [],
        validators: [0, 1],
        blsPublicKeys: ['0xpk1', '0xpk2'],
      },
    }

    mockUseQuery
      .mockReturnValueOnce({
        data: { wbftBlockExtra: wbftExtra },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })
      .mockReturnValueOnce({
        data: { blockSigners: { blockNumber: '100', preparers: ['0xA'], committers: ['0xA'] } },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

    const { result } = renderHook(() => useConsensusData('100'))

    expect(result.current.consensusData!.isEpochBoundary).toBe(true)
  })

  it('should suppress error and mark unsupported for consensus storage error', () => {
    const unsupportedError = makeError(UNSUPPORTED_MSG)

    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: unsupportedError,
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useConsensusData('100'))

    expect(result.current.error).toBeUndefined()
    expect(result.current.isSupported).toBe(false)
  })

  it('should return error for non-consensus errors', () => {
    const genericError = makeError('Network error')

    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: genericError,
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useConsensusData('100'))

    expect(result.current.error).toBe(genericError)
    expect(result.current.isSupported).toBe(true)
  })

  it('should use previousData as fallback while loading new data', () => {
    const wbftExtra = {
      blockNumber: '99',
      blockHash: '0x',
      randaoReveal: '0x',
      prevRound: 0,
      round: 1,
      timestamp: '0',
    }

    mockUseQuery
      .mockReturnValueOnce({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: { wbftBlockExtra: wbftExtra },
      })
      .mockReturnValueOnce({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: { blockSigners: { blockNumber: '99', preparers: ['0xA'], committers: ['0xA'] } },
      })

    const { result } = renderHook(() => useConsensusData('100'))

    expect(result.current.loading).toBe(true)
    expect(result.current.wbftBlockExtra).not.toBeNull()
    expect(result.current.blockSigners).not.toBeNull()
  })

  it('should expose raw wbftBlockExtra and blockSigners', () => {
    const wbftExtra = {
      blockNumber: '100',
      blockHash: '0xabc',
      randaoReveal: '0x',
      prevRound: 0,
      round: 1,
      timestamp: '0',
    }
    const signers = {
      blockNumber: '100',
      preparers: ['0xA'],
      committers: ['0xA'],
    }

    mockUseQuery
      .mockReturnValueOnce({
        data: { wbftBlockExtra: wbftExtra },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })
      .mockReturnValueOnce({
        data: { blockSigners: signers },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

    const { result } = renderHook(() => useConsensusData('100'))

    expect(result.current.wbftBlockExtra).toEqual(wbftExtra)
    expect(result.current.blockSigners).toEqual(signers)
  })
})

// ---------------------------------------------------------------------------
// useValidatorStats
// ---------------------------------------------------------------------------

describe('useValidatorStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    const { result } = renderHook(() =>
      useValidatorStats({ address: '0xA', fromBlock: '0', toBlock: '100' }),
    )

    expect(result.current.loading).toBe(true)
    expect(result.current.validatorStats).toBeNull()
  })

  it('should skip when address is empty', () => {
    mockUseQuery.mockReturnValue(idleQueryResult())

    renderHook(() => useValidatorStats({ address: '', fromBlock: '0', toBlock: '100' }))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_VALIDATOR_SIGNING_STATS',
      expect.objectContaining({ skip: true }),
    )
  })

  it('should skip when fromBlock is empty', () => {
    mockUseQuery.mockReturnValue(idleQueryResult())

    renderHook(() => useValidatorStats({ address: '0xA', fromBlock: '', toBlock: '100' }))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_VALIDATOR_SIGNING_STATS',
      expect.objectContaining({ skip: true }),
    )
  })

  it('should skip when toBlock is empty', () => {
    mockUseQuery.mockReturnValue(idleQueryResult())

    renderHook(() => useValidatorStats({ address: '0xA', fromBlock: '0', toBlock: '' }))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_VALIDATOR_SIGNING_STATS',
      expect.objectContaining({ skip: true }),
    )
  })

  it('should pass correct variables', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    renderHook(() =>
      useValidatorStats({ address: '0xA', fromBlock: '10', toBlock: '200' }),
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_VALIDATOR_SIGNING_STATS',
      expect.objectContaining({
        variables: { validatorAddress: '0xA', fromBlock: '10', toBlock: '200' },
        skip: false,
      }),
    )
  })

  it('should transform signing stats to legacy ValidatorStats format', () => {
    const signingStats = {
      validatorAddress: '0xA',
      validatorIndex: 0,
      prepareSignCount: '80',
      prepareMissCount: '20',
      commitSignCount: '90',
      commitMissCount: '10',
      fromBlock: '0',
      toBlock: '100',
      signingRate: 85,
      blocksProposed: '5',
      totalBlocks: '100',
      proposalRate: 5,
    }

    mockUseQuery.mockReturnValue({
      data: { validatorSigningStats: signingStats },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() =>
      useValidatorStats({ address: '0xA', fromBlock: '0', toBlock: '100' }),
    )

    expect(result.current.validatorStats).toEqual({
      address: '0xA',
      totalBlocks: '100',
      blocksProposed: '5',
      preparesSigned: '80',
      commitsSigned: '90',
      preparesMissed: '20',
      commitsMissed: '10',
      participationRate: 85,
    })
    expect(result.current.signingStats).toEqual(signingStats)
  })

  it('should suppress unsupported consensus error', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: makeError(UNSUPPORTED_MSG),
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() =>
      useValidatorStats({ address: '0xA', fromBlock: '0', toBlock: '100' }),
    )

    expect(result.current.error).toBeUndefined()
    expect(result.current.isSupported).toBe(false)
  })

  it('should expose non-consensus errors', () => {
    const err = makeError('Timeout')

    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: err,
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() =>
      useValidatorStats({ address: '0xA', fromBlock: '0', toBlock: '100' }),
    )

    expect(result.current.error).toBe(err)
    expect(result.current.isSupported).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// useValidatorParticipation
// ---------------------------------------------------------------------------

describe('useValidatorParticipation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    const { result } = renderHook(() =>
      useValidatorParticipation({ address: '0xA', fromBlock: '0', toBlock: '100' }),
    )

    expect(result.current.loading).toBe(true)
    expect(result.current.participation).toBeNull()
  })

  it('should skip when address is empty', () => {
    mockUseQuery.mockReturnValue(idleQueryResult())

    renderHook(() =>
      useValidatorParticipation({ address: '', fromBlock: '0', toBlock: '100' }),
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_VALIDATOR_SIGNING_ACTIVITY',
      expect.objectContaining({ skip: true }),
    )
  })

  it('should pass default limit and offset when not provided', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    renderHook(() =>
      useValidatorParticipation({ address: '0xA', fromBlock: '0', toBlock: '100' }),
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_VALIDATOR_SIGNING_ACTIVITY',
      expect.objectContaining({
        variables: {
          validatorAddress: '0xA',
          fromBlock: '0',
          toBlock: '100',
          limit: 20,
          offset: 0,
        },
      }),
    )
  })

  it('should pass custom limit and offset', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    renderHook(() =>
      useValidatorParticipation({
        address: '0xA',
        fromBlock: '0',
        toBlock: '100',
        limit: 50,
        offset: 10,
      }),
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_VALIDATOR_SIGNING_ACTIVITY',
      expect.objectContaining({
        variables: {
          validatorAddress: '0xA',
          fromBlock: '0',
          toBlock: '100',
          limit: 50,
          offset: 10,
        },
      }),
    )
  })

  it('should transform activities into ValidatorParticipation format', () => {
    const activities = [
      {
        blockNumber: '10',
        blockHash: '0x1',
        validatorAddress: '0xA',
        validatorIndex: 0,
        signedPrepare: true,
        signedCommit: true,
        round: 1,
        timestamp: '100',
      },
      {
        blockNumber: '11',
        blockHash: '0x2',
        validatorAddress: '0xA',
        validatorIndex: 0,
        signedPrepare: true,
        signedCommit: false,
        round: 1,
        timestamp: '101',
      },
    ]

    mockUseQuery.mockReturnValue({
      data: {
        validatorSigningActivity: {
          nodes: activities,
          totalCount: 2,
          pageInfo: { hasNextPage: false },
        },
      },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() =>
      useValidatorParticipation({ address: '0xA', fromBlock: '0', toBlock: '100' }),
    )

    expect(result.current.participation).not.toBeNull()
    expect(result.current.participation!.address).toBe('0xA')
    expect(result.current.participation!.startBlock).toBe('0')
    expect(result.current.participation!.endBlock).toBe('100')
    expect(result.current.participation!.totalBlocks).toBe('2')
    // 1 committed out of 2
    expect(result.current.participation!.blocksCommitted).toBe('1')
    expect(result.current.participation!.blocksMissed).toBe('1')
    expect(result.current.participation!.participationRate).toBe(50)
    expect(result.current.participation!.blocks).toHaveLength(2)
    expect(result.current.totalCount).toBe(2)
  })

  it('should return null participation when no activities', () => {
    mockUseQuery.mockReturnValue({
      data: {
        validatorSigningActivity: {
          nodes: [],
          totalCount: 0,
          pageInfo: { hasNextPage: false },
        },
      },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() =>
      useValidatorParticipation({ address: '0xA', fromBlock: '0', toBlock: '100' }),
    )

    expect(result.current.participation).toBeNull()
    expect(result.current.activities).toEqual([])
  })

  it('should suppress unsupported consensus error', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: makeError(UNSUPPORTED_MSG),
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() =>
      useValidatorParticipation({ address: '0xA', fromBlock: '0', toBlock: '100' }),
    )

    expect(result.current.error).toBeUndefined()
    expect(result.current.isSupported).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// useAllValidatorStats
// ---------------------------------------------------------------------------

describe('useAllValidatorStats', () => {
  /** Helper: configure mock to return latestHeight for GET_LATEST_HEIGHT
   *  and the given result for GET_ALL_VALIDATORS_SIGNING_STATS */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function setupAllValidatorMock(
    statsResult: Record<string, any>,
    latestHeight: number = 1000,
  ) {
    mockUseQuery.mockImplementation((query: string) => {
      if (query === 'GET_LATEST_HEIGHT') {
        return {
          data: { latestHeight },
          loading: false,
          error: undefined,
          refetch: vi.fn(),
          previousData: null,
        }
      }
      return statsResult
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state', () => {
    setupAllValidatorMock(loadingQueryResult())

    const { result } = renderHook(() => useAllValidatorStats())

    expect(result.current.loading).toBe(true)
    expect(result.current.stats).toEqual([])
  })

  it('should use last 1000 blocks as default range from latestHeight', () => {
    setupAllValidatorMock(loadingQueryResult(), 5000)

    renderHook(() => useAllValidatorStats())

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_ALL_VALIDATORS_SIGNING_STATS',
      expect.objectContaining({
        variables: { fromBlock: '4000', toBlock: '5000', limit: 20, offset: 0 },
      }),
    )
  })

  it('should pass custom params', () => {
    setupAllValidatorMock(loadingQueryResult())

    renderHook(() =>
      useAllValidatorStats({ fromBlock: '10', toBlock: '500', limit: 50, offset: 5 }),
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_ALL_VALIDATORS_SIGNING_STATS',
      expect.objectContaining({
        variables: { fromBlock: '10', toBlock: '500', limit: 50, offset: 5 },
      }),
    )
  })

  it('should transform signing stats array to legacy format', () => {
    const nodes = [
      {
        validatorAddress: '0xA',
        validatorIndex: 0,
        prepareSignCount: '80',
        prepareMissCount: '20',
        commitSignCount: '90',
        commitMissCount: '10',
        fromBlock: '0',
        toBlock: '100',
        signingRate: 85,
        blocksProposed: '5',
        totalBlocks: '100',
        proposalRate: 5,
      },
      {
        validatorAddress: '0xB',
        validatorIndex: 1,
        prepareSignCount: '70',
        prepareMissCount: '30',
        commitSignCount: '60',
        commitMissCount: '40',
        fromBlock: '0',
        toBlock: '100',
        signingRate: 65,
        blocksProposed: '3',
        totalBlocks: '100',
        proposalRate: 3,
      },
    ]

    setupAllValidatorMock({
      data: {
        allValidatorsSigningStats: {
          nodes,
          totalCount: 2,
          pageInfo: { hasNextPage: false },
        },
      },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      fetchMore: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useAllValidatorStats())

    expect(result.current.stats).toHaveLength(2)
    expect(result.current.stats[0]).toEqual({
      address: '0xA',
      totalBlocks: '100',
      blocksProposed: '5',
      preparesSigned: '80',
      commitsSigned: '90',
      preparesMissed: '20',
      commitsMissed: '10',
      participationRate: 85,
    })
    expect(result.current.totalCount).toBe(2)
    expect(result.current.signingStats).toEqual(nodes)
  })

  it('should suppress unsupported consensus error', () => {
    setupAllValidatorMock({
      data: null,
      loading: false,
      error: makeError(UNSUPPORTED_MSG),
      refetch: vi.fn(),
      fetchMore: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useAllValidatorStats())

    expect(result.current.error).toBeUndefined()
    expect(result.current.isSupported).toBe(false)
  })

  it('should expose fetchMore function', () => {
    const mockFetchMore = vi.fn()

    setupAllValidatorMock({
      data: null,
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      fetchMore: mockFetchMore,
      previousData: null,
    })

    const { result } = renderHook(() => useAllValidatorStats())

    expect(result.current.fetchMore).toBe(mockFetchMore)
  })
})

// ---------------------------------------------------------------------------
// useEpochData
// ---------------------------------------------------------------------------

describe('useEpochData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    const { result } = renderHook(() => useEpochData('5'))

    expect(result.current.loading).toBe(true)
    expect(result.current.epochData).toBeNull()
  })

  it('should skip when epochNumber is empty', () => {
    mockUseQuery.mockReturnValue(idleQueryResult())

    renderHook(() => useEpochData(''))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_EPOCH_INFO',
      expect.objectContaining({ skip: true }),
    )
  })

  it('should pass epochNumber as variable', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    renderHook(() => useEpochData('42'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_EPOCH_INFO',
      expect.objectContaining({
        variables: { epochNumber: '42' },
        skip: false,
      }),
    )
  })

  it('should transform epochInfo to EpochData format', () => {
    const epochInfo = {
      epochNumber: '5',
      blockNumber: '500',
      candidates: [{ address: '0xC1', diligence: '100' }],
      validators: [0, 1, 2],
      blsPublicKeys: ['0xpk1', '0xpk2', '0xpk3'],
      validatorCount: 3,
      candidateCount: 1,
      previousEpochValidatorCount: 2,
      timestamp: '1700000000',
    }

    mockUseQuery.mockReturnValue({
      data: { epochInfo },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useEpochData('5'))

    expect(result.current.epochData).toEqual({
      epochNumber: '5',
      blockNumber: '500',
      validatorCount: 3,
      candidateCount: 1,
      validators: [0, 1, 2],
      blsPublicKeys: ['0xpk1', '0xpk2', '0xpk3'],
      candidates: [{ address: '0xC1', diligence: '100' }],
      previousEpochValidatorCount: 2,
      timestamp: '1700000000',
    })
    expect(result.current.epochInfo).toEqual(epochInfo)
  })

  it('should fall back to validators array length when validatorCount is missing', () => {
    const epochInfo = {
      epochNumber: '5',
      blockNumber: '500',
      candidates: [],
      validators: [0, 1],
      blsPublicKeys: ['0xpk1', '0xpk2'],
      timestamp: '0',
    }

    mockUseQuery.mockReturnValue({
      data: { epochInfo },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useEpochData('5'))

    expect(result.current.epochData!.validatorCount).toBe(2)
    expect(result.current.epochData!.candidateCount).toBe(0)
  })

  it('should suppress unsupported consensus error', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: makeError(UNSUPPORTED_MSG),
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useEpochData('5'))

    expect(result.current.error).toBeUndefined()
    expect(result.current.isSupported).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// useLatestEpochData
// ---------------------------------------------------------------------------

describe('useLatestEpochData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    const { result } = renderHook(() => useLatestEpochData())

    expect(result.current.loading).toBe(true)
    expect(result.current.latestEpochData).toBeNull()
  })

  it('should configure polling and network-only fetch policy', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    renderHook(() => useLatestEpochData())

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_LATEST_EPOCH_INFO',
      expect.objectContaining({
        pollInterval: 10_000,
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'network-only',
        errorPolicy: 'all',
      }),
    )
  })

  it('should transform latestEpochInfo to EpochData', () => {
    const latestEpochInfo = {
      epochNumber: '10',
      blockNumber: '1000',
      candidates: [{ address: '0xC1', diligence: '100' }],
      validators: [0, 1, 2, 3],
      blsPublicKeys: ['0xpk1', '0xpk2', '0xpk3', '0xpk4'],
      validatorCount: 4,
      candidateCount: 1,
      previousEpochValidatorCount: 3,
      timestamp: '1700050000',
    }

    mockUseQuery.mockReturnValue({
      data: { latestEpochInfo },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useLatestEpochData())

    expect(result.current.latestEpochData).not.toBeNull()
    expect(result.current.latestEpochData!.epochNumber).toBe('10')
    expect(result.current.latestEpochData!.validatorCount).toBe(4)
    expect(result.current.epochInfo).toEqual(latestEpochInfo)
  })

  it('should suppress unsupported consensus error', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: makeError(UNSUPPORTED_MSG),
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useLatestEpochData())

    expect(result.current.error).toBeUndefined()
    expect(result.current.isSupported).toBe(false)
  })

  it('should use previousData while loading', () => {
    const latestEpochInfo = {
      epochNumber: '9',
      blockNumber: '900',
      candidates: [],
      validators: [0, 1],
      blsPublicKeys: ['0xpk1', '0xpk2'],
      timestamp: '0',
    }

    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      refetch: vi.fn(),
      previousData: { latestEpochInfo },
    })

    const { result } = renderHook(() => useLatestEpochData())

    expect(result.current.loading).toBe(true)
    expect(result.current.latestEpochData).not.toBeNull()
    expect(result.current.latestEpochData!.epochNumber).toBe('9')
  })
})

// ---------------------------------------------------------------------------
// useEpochs
// ---------------------------------------------------------------------------

describe('useEpochs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    const { result } = renderHook(() => useEpochs())

    expect(result.current.loading).toBe(true)
    expect(result.current.epochs).toEqual([])
  })

  it('should pass default limit and offset', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    renderHook(() => useEpochs())

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_EPOCHS',
      expect.objectContaining({
        variables: { limit: 20, offset: 0 },
      }),
    )
  })

  it('should pass custom limit and offset', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    renderHook(() => useEpochs({ limit: 10, offset: 5 }))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_EPOCHS',
      expect.objectContaining({
        variables: { limit: 10, offset: 5 },
      }),
    )
  })

  it('should return epochs data correctly', () => {
    const nodes = [
      { epochNumber: '5', blockNumber: '500', validatorCount: 3, candidateCount: 1, timestamp: '100' },
      { epochNumber: '4', blockNumber: '400', validatorCount: 3, candidateCount: 2, timestamp: '90' },
    ]

    mockUseQuery.mockReturnValue({
      data: {
        epochs: {
          nodes,
          totalCount: 10,
          pageInfo: { hasNextPage: true },
        },
      },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      fetchMore: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useEpochs())

    expect(result.current.epochs).toEqual(nodes)
    expect(result.current.totalCount).toBe(10)
    expect(result.current.pageInfo).toEqual({ hasNextPage: true })
  })

  it('should suppress unsupported consensus error', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: makeError(UNSUPPORTED_MSG),
      refetch: vi.fn(),
      fetchMore: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useEpochs())

    expect(result.current.error).toBeUndefined()
    expect(result.current.isSupported).toBe(false)
  })

  it('should expose fetchMore function', () => {
    const mockFetchMore = vi.fn()

    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      fetchMore: mockFetchMore,
      previousData: null,
    })

    const { result } = renderHook(() => useEpochs())

    expect(result.current.fetchMore).toBe(mockFetchMore)
  })

  it('should return non-consensus errors', () => {
    const err = makeError('Server error')

    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: err,
      refetch: vi.fn(),
      fetchMore: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useEpochs())

    expect(result.current.error).toBe(err)
    expect(result.current.isSupported).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// useBlockSigners
// ---------------------------------------------------------------------------

describe('useBlockSigners', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    const { result } = renderHook(() => useBlockSigners('100'))

    expect(result.current.loading).toBe(true)
    expect(result.current.blockSigners).toBeNull()
  })

  it('should skip when blockNumber is empty', () => {
    mockUseQuery.mockReturnValue(idleQueryResult())

    renderHook(() => useBlockSigners(''))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_BLOCK_SIGNERS',
      expect.objectContaining({ skip: true }),
    )
  })

  it('should pass blockNumber as variable', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    renderHook(() => useBlockSigners('555'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_BLOCK_SIGNERS',
      expect.objectContaining({
        variables: { blockNumber: '555' },
        skip: false,
      }),
    )
  })

  it('should return blockSigners data', () => {
    const signers = {
      blockNumber: '100',
      preparers: ['0xA', '0xB', '0xC'],
      committers: ['0xA', '0xB'],
    }

    mockUseQuery.mockReturnValue({
      data: { blockSigners: signers },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useBlockSigners('100'))

    expect(result.current.blockSigners).toEqual(signers)
    expect(result.current.loading).toBe(false)
  })

  it('should use previousData as fallback', () => {
    const previousSigners = {
      blockNumber: '99',
      preparers: ['0xX'],
      committers: ['0xX'],
    }

    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      refetch: vi.fn(),
      previousData: { blockSigners: previousSigners },
    })

    const { result } = renderHook(() => useBlockSigners('100'))

    expect(result.current.blockSigners).toEqual(previousSigners)
    expect(result.current.loading).toBe(true)
  })

  it('should suppress unsupported consensus error', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: makeError(UNSUPPORTED_MSG),
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useBlockSigners('100'))

    expect(result.current.error).toBeUndefined()
    expect(result.current.isSupported).toBe(false)
  })

  it('should return non-consensus errors', () => {
    const err = makeError('Forbidden')

    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: err,
      refetch: vi.fn(),
      previousData: null,
    })

    const { result } = renderHook(() => useBlockSigners('100'))

    expect(result.current.error).toBe(err)
    expect(result.current.isSupported).toBe(true)
  })

  it('should provide refetch function', () => {
    const mockRefetch = vi.fn()

    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: undefined,
      refetch: mockRefetch,
      previousData: null,
    })

    const { result } = renderHook(() => useBlockSigners('100'))

    expect(result.current.refetch).toBe(mockRefetch)
  })

  it('should enable returnPartialData and errorPolicy all', () => {
    mockUseQuery.mockReturnValue(loadingQueryResult())

    renderHook(() => useBlockSigners('100'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_BLOCK_SIGNERS',
      expect.objectContaining({
        returnPartialData: true,
        errorPolicy: 'all',
      }),
    )
  })
})
