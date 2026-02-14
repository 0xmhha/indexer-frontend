import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useActiveValidators,
  useGasTipHistory,
  useValidatorHistory,
  useDepositMintProposals,
  useBurnHistory,
  useEmergencyPauseHistory,
} from './useValidatorGovernance'

// Mock Apollo Client
const mockUseQuery = vi.fn()
vi.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}))

// Mock imported queries
vi.mock('@/lib/graphql/queries/system-contracts', () => ({
  GET_ACTIVE_VALIDATORS: 'GET_ACTIVE_VALIDATORS',
  GET_DEPOSIT_MINT_PROPOSALS: 'GET_DEPOSIT_MINT_PROPOSALS',
  GET_MAX_PROPOSALS_UPDATE_HISTORY: 'GET_MAX_PROPOSALS_UPDATE_HISTORY',
  GET_PROPOSAL_EXECUTION_SKIPPED: 'GET_PROPOSAL_EXECUTION_SKIPPED',
}))

// Mock constants
vi.mock('@/lib/config/constants', () => ({
  PAGINATION: { DEFAULT_PAGE_SIZE: 20 },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockQueryReturn(overrides: Record<string, unknown> = {}) {
  return {
    data: null,
    loading: false,
    error: undefined,
    refetch: vi.fn(),
    previousData: null,
    ...overrides,
  }
}

function makeUnsupportedFieldError(field: string): Error {
  return new Error(`Cannot query field "${field}" on type "Query"`)
}

function makeUnknownFieldError(field: string): Error {
  return new Error(`Unknown field "${field}"`)
}

// ---------------------------------------------------------------------------
// useActiveValidators
// ---------------------------------------------------------------------------

describe('useActiveValidators', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('should return loading true when query is in progress', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn({ loading: true }))

      const { result } = renderHook(() => useActiveValidators())

      expect(result.current.loading).toBe(true)
      expect(result.current.validators).toEqual([])
      expect(result.current.totalCount).toBe(0)
    })
  })

  describe('data transformation', () => {
    it('should return validators from activeValidators data', () => {
      const mockValidators = [
        { address: '0xaaa', isActive: true },
        { address: '0xbbb', isActive: true },
      ]

      mockUseQuery.mockReturnValue(
        mockQueryReturn({ data: { activeValidators: mockValidators } })
      )

      const { result } = renderHook(() => useActiveValidators())

      expect(result.current.validators).toEqual(mockValidators)
      expect(result.current.validatorInfos).toEqual(mockValidators)
      expect(result.current.totalCount).toBe(2)
    })

    it('should use previousData when data is null', () => {
      const mockValidators = [{ address: '0xccc', isActive: false }]

      mockUseQuery.mockReturnValue(
        mockQueryReturn({
          data: null,
          loading: true,
          previousData: { activeValidators: mockValidators },
        })
      )

      const { result } = renderHook(() => useActiveValidators())

      expect(result.current.validators).toEqual(mockValidators)
      expect(result.current.totalCount).toBe(1)
    })

    it('should return empty array when no data or previousData', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      const { result } = renderHook(() => useActiveValidators())

      expect(result.current.validators).toEqual([])
      expect(result.current.totalCount).toBe(0)
    })
  })

  describe('error handling', () => {
    it('should pass through non-unsupported errors', () => {
      const graphqlError = new Error('Network error')
      mockUseQuery.mockReturnValue(mockQueryReturn({ error: graphqlError }))

      const { result } = renderHook(() => useActiveValidators())

      expect(result.current.error).toBe(graphqlError)
    })

    it('should suppress "Cannot query field" errors', () => {
      mockUseQuery.mockReturnValue(
        mockQueryReturn({ error: makeUnsupportedFieldError('activeValidators') })
      )

      const { result } = renderHook(() => useActiveValidators())

      expect(result.current.error).toBeUndefined()
    })

    it('should suppress "Unknown field" errors', () => {
      mockUseQuery.mockReturnValue(
        mockQueryReturn({ error: makeUnknownFieldError('activeValidators') })
      )

      const { result } = renderHook(() => useActiveValidators())

      expect(result.current.error).toBeUndefined()
    })
  })

  describe('query options', () => {
    it('should call useQuery with returnPartialData and errorPolicy all', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useActiveValidators())

      expect(mockUseQuery).toHaveBeenCalledWith(
        'GET_ACTIVE_VALIDATORS',
        expect.objectContaining({
          returnPartialData: true,
          errorPolicy: 'all',
        })
      )
    })

    it('should provide a refetch function', () => {
      const mockRefetch = vi.fn()
      mockUseQuery.mockReturnValue(mockQueryReturn({ refetch: mockRefetch }))

      const { result } = renderHook(() => useActiveValidators())

      expect(result.current.refetch).toBe(mockRefetch)
    })
  })
})

// ---------------------------------------------------------------------------
// useGasTipHistory
// ---------------------------------------------------------------------------

describe('useGasTipHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('query variables', () => {
    it('should use default fromBlock and toBlock when no params provided', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useGasTipHistory())

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          variables: { fromBlock: '0', toBlock: '999999999' },
        })
      )
    })

    it('should pass custom fromBlock and toBlock', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useGasTipHistory({ fromBlock: '100', toBlock: '500' }))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          variables: { fromBlock: '100', toBlock: '500' },
        })
      )
    })
  })

  describe('data transformation', () => {
    it('should add txHash field from transactionHash', () => {
      const rawEvents = [
        {
          blockNumber: '10',
          transactionHash: '0xtx1',
          oldTip: '100',
          newTip: '200',
          updater: '0xaddr1',
          timestamp: '1700000000',
        },
      ]

      mockUseQuery.mockReturnValue(
        mockQueryReturn({ data: { gasTipHistory: rawEvents } })
      )

      const { result } = renderHook(() => useGasTipHistory())

      expect(result.current.history).toHaveLength(1)
      expect(result.current.history[0]!.txHash).toBe('0xtx1')
      expect(result.current.history[0]!.transactionHash).toBe('0xtx1')
      expect(result.current.history[0]!.oldTip).toBe('100')
      expect(result.current.history[0]!.newTip).toBe('200')
    })

    it('should use previousData when data is null', () => {
      const previousEvents = [
        {
          blockNumber: '5',
          transactionHash: '0xold',
          oldTip: '50',
          newTip: '75',
          updater: '0xprev',
          timestamp: '1600000000',
        },
      ]

      mockUseQuery.mockReturnValue(
        mockQueryReturn({
          data: null,
          loading: true,
          previousData: { gasTipHistory: previousEvents },
        })
      )

      const { result } = renderHook(() => useGasTipHistory())

      expect(result.current.history).toHaveLength(1)
      expect(result.current.history[0]!.txHash).toBe('0xold')
    })

    it('should return empty array when no data', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      const { result } = renderHook(() => useGasTipHistory())

      expect(result.current.history).toEqual([])
    })
  })

  describe('error handling', () => {
    it('should suppress unsupported query errors', () => {
      mockUseQuery.mockReturnValue(
        mockQueryReturn({ error: makeUnsupportedFieldError('gasTipHistory') })
      )

      const { result } = renderHook(() => useGasTipHistory())

      expect(result.current.error).toBeUndefined()
    })

    it('should pass through other errors', () => {
      const err = new Error('Server unreachable')
      mockUseQuery.mockReturnValue(mockQueryReturn({ error: err }))

      const { result } = renderHook(() => useGasTipHistory())

      expect(result.current.error).toBe(err)
    })
  })

  describe('loading state', () => {
    it('should return loading true when query is in progress', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn({ loading: true }))

      const { result } = renderHook(() => useGasTipHistory())

      expect(result.current.loading).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// useValidatorHistory
// ---------------------------------------------------------------------------

describe('useValidatorHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('skip behavior', () => {
    it('should skip query when validator is an empty string', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useValidatorHistory(''))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ skip: true })
      )
    })

    it('should not skip query when validator is provided', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useValidatorHistory('0xvalidator'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          skip: false,
          variables: { validator: '0xvalidator' },
        })
      )
    })
  })

  describe('data transformation', () => {
    it('should return validator history events', () => {
      const mockEvents = [
        {
          blockNumber: '20',
          transactionHash: '0xhash',
          validator: '0xval1',
          action: 'ADDED',
          oldValidator: '0x0000',
          timestamp: '1700000001',
        },
      ]

      mockUseQuery.mockReturnValue(
        mockQueryReturn({ data: { validatorHistory: mockEvents } })
      )

      const { result } = renderHook(() => useValidatorHistory('0xval1'))

      expect(result.current.history).toEqual(mockEvents)
    })

    it('should use previousData as fallback', () => {
      const previousEvents = [
        {
          blockNumber: '15',
          transactionHash: '0xprev',
          validator: '0xval2',
          action: 'REMOVED',
          timestamp: '1600000001',
        },
      ]

      mockUseQuery.mockReturnValue(
        mockQueryReturn({
          data: null,
          loading: true,
          previousData: { validatorHistory: previousEvents },
        })
      )

      const { result } = renderHook(() => useValidatorHistory('0xval2'))

      expect(result.current.history).toEqual(previousEvents)
    })

    it('should return empty array when no data', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      const { result } = renderHook(() => useValidatorHistory('0xval'))

      expect(result.current.history).toEqual([])
    })
  })

  describe('error handling', () => {
    it('should pass through errors directly (no unsupported check)', () => {
      const err = new Error('Cannot query field "validatorHistory"')
      mockUseQuery.mockReturnValue(mockQueryReturn({ error: err }))

      const { result } = renderHook(() => useValidatorHistory('0xval'))

      // useValidatorHistory does NOT use isUnsupportedQueryError suppression
      expect(result.current.error).toBe(err)
    })
  })

  describe('query options', () => {
    it('should enable returnPartialData', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useValidatorHistory('0xval'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ returnPartialData: true })
      )
    })
  })
})

// ---------------------------------------------------------------------------
// useDepositMintProposals
// ---------------------------------------------------------------------------

describe('useDepositMintProposals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('query variables', () => {
    it('should use default block range when no params provided', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useDepositMintProposals())

      expect(mockUseQuery).toHaveBeenCalledWith(
        'GET_DEPOSIT_MINT_PROPOSALS',
        expect.objectContaining({
          variables: { fromBlock: '0', toBlock: '999999999', status: undefined },
        })
      )
    })

    it('should pass custom params including status', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() =>
        useDepositMintProposals({
          fromBlock: '50',
          toBlock: '200',
          status: 'APPROVED' as const,
        })
      )

      expect(mockUseQuery).toHaveBeenCalledWith(
        'GET_DEPOSIT_MINT_PROPOSALS',
        expect.objectContaining({
          variables: { fromBlock: '50', toBlock: '200', status: 'APPROVED' },
        })
      )
    })
  })

  describe('data transformation', () => {
    it('should return proposals from depositMintProposals data', () => {
      const mockProposals = [
        {
          proposalId: '1',
          requester: '0xreq',
          beneficiary: '0xben',
          amount: '1000',
          depositId: 'dep-1',
          bankReference: 'REF001',
          status: 'PENDING',
          blockNumber: '100',
          transactionHash: '0xtx',
          timestamp: '1700000000',
        },
      ]

      mockUseQuery.mockReturnValue(
        mockQueryReturn({ data: { depositMintProposals: mockProposals } })
      )

      const { result } = renderHook(() => useDepositMintProposals())

      expect(result.current.proposals).toEqual(mockProposals)
    })

    it('should use previousData when data is null', () => {
      const previousProposals = [
        {
          proposalId: '2',
          requester: '0xold',
          beneficiary: '0xben2',
          amount: '500',
          depositId: 'dep-2',
          bankReference: 'REF002',
          status: 'EXECUTED',
          blockNumber: '50',
          transactionHash: '0xoldtx',
          timestamp: '1600000000',
        },
      ]

      mockUseQuery.mockReturnValue(
        mockQueryReturn({
          data: null,
          loading: true,
          previousData: { depositMintProposals: previousProposals },
        })
      )

      const { result } = renderHook(() => useDepositMintProposals())

      expect(result.current.proposals).toEqual(previousProposals)
    })

    it('should return empty array when no data', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      const { result } = renderHook(() => useDepositMintProposals())

      expect(result.current.proposals).toEqual([])
    })
  })

  describe('error handling and query options', () => {
    it('should pass through errors directly', () => {
      const err = new Error('Timeout')
      mockUseQuery.mockReturnValue(mockQueryReturn({ error: err }))

      const { result } = renderHook(() => useDepositMintProposals())

      expect(result.current.error).toBe(err)
    })

    it('should set returnPartialData and errorPolicy all', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useDepositMintProposals())

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          returnPartialData: true,
          errorPolicy: 'all',
        })
      )
    })
  })

  describe('loading state', () => {
    it('should return loading true when query is in progress', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn({ loading: true }))

      const { result } = renderHook(() => useDepositMintProposals())

      expect(result.current.loading).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// useBurnHistory
// ---------------------------------------------------------------------------

describe('useBurnHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('query variables', () => {
    it('should use defaults and include pagination', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useBurnHistory())

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          variables: {
            filter: { fromBlock: '0', toBlock: '999999999', address: undefined },
            pagination: { limit: 20, offset: 0 },
          },
        })
      )
    })

    it('should pass custom params and user address', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() =>
        useBurnHistory({ fromBlock: '10', toBlock: '100', user: '0xburner' })
      )

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          variables: {
            filter: { fromBlock: '10', toBlock: '100', address: '0xburner' },
            pagination: { limit: 20, offset: 0 },
          },
        })
      )
    })
  })

  describe('data transformation', () => {
    it('should map nodes and add txHash and burnTxId fields', () => {
      const rawNodes = [
        {
          blockNumber: '30',
          transactionHash: '0xburn1',
          burner: '0xburner',
          amount: '5000',
          withdrawalId: 'wd-1',
          timestamp: '1700000002',
        },
        {
          blockNumber: '31',
          transactionHash: '0xburn2',
          burner: '0xburner2',
          amount: '3000',
          timestamp: '1700000003',
        },
      ]

      mockUseQuery.mockReturnValue(
        mockQueryReturn({
          data: { burnEvents: { nodes: rawNodes, totalCount: 42 } },
        })
      )

      const { result } = renderHook(() => useBurnHistory())

      expect(result.current.history).toHaveLength(2)

      expect(result.current.history[0]!.txHash).toBe('0xburn1')
      expect(result.current.history[0]!.burnTxId).toBe('wd-1')
      expect(result.current.history[0]!.burner).toBe('0xburner')
      expect(result.current.history[0]!.amount).toBe('5000')

      expect(result.current.history[1]!.txHash).toBe('0xburn2')
      expect(result.current.history[1]!.burnTxId).toBeUndefined()

      expect(result.current.totalCount).toBe(42)
    })

    it('should use previousData as fallback', () => {
      const previousNodes = [
        {
          blockNumber: '25',
          transactionHash: '0xprev',
          burner: '0xold',
          amount: '100',
          timestamp: '1600000002',
        },
      ]

      mockUseQuery.mockReturnValue(
        mockQueryReturn({
          data: null,
          loading: true,
          previousData: { burnEvents: { nodes: previousNodes, totalCount: 5 } },
        })
      )

      const { result } = renderHook(() => useBurnHistory())

      expect(result.current.history).toHaveLength(1)
      expect(result.current.totalCount).toBe(5)
    })

    it('should return empty history and zero totalCount when no data', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      const { result } = renderHook(() => useBurnHistory())

      expect(result.current.history).toEqual([])
      expect(result.current.totalCount).toBe(0)
    })
  })

  describe('error handling', () => {
    it('should suppress unsupported query errors', () => {
      mockUseQuery.mockReturnValue(
        mockQueryReturn({ error: makeUnsupportedFieldError('burnEvents') })
      )

      const { result } = renderHook(() => useBurnHistory())

      expect(result.current.error).toBeUndefined()
    })

    it('should suppress Unknown field errors', () => {
      mockUseQuery.mockReturnValue(
        mockQueryReturn({ error: makeUnknownFieldError('burnEvents') })
      )

      const { result } = renderHook(() => useBurnHistory())

      expect(result.current.error).toBeUndefined()
    })

    it('should pass through other errors', () => {
      const err = new Error('Forbidden')
      mockUseQuery.mockReturnValue(mockQueryReturn({ error: err }))

      const { result } = renderHook(() => useBurnHistory())

      expect(result.current.error).toBe(err)
    })
  })

  describe('loading state', () => {
    it('should return loading true when query is in progress', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn({ loading: true }))

      const { result } = renderHook(() => useBurnHistory())

      expect(result.current.loading).toBe(true)
    })
  })

  describe('query options', () => {
    it('should set returnPartialData and errorPolicy all', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useBurnHistory())

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          returnPartialData: true,
          errorPolicy: 'all',
        })
      )
    })
  })
})

// ---------------------------------------------------------------------------
// useEmergencyPauseHistory
// ---------------------------------------------------------------------------

describe('useEmergencyPauseHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('skip behavior', () => {
    it('should skip query when contract is an empty string', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useEmergencyPauseHistory(''))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ skip: true })
      )
    })

    it('should not skip query when contract is provided', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useEmergencyPauseHistory('0x1001'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          skip: false,
          variables: { contract: '0x1001' },
        })
      )
    })
  })

  describe('data transformation', () => {
    it('should return emergency pause events from data', () => {
      const mockEvents = [
        {
          contract: '0x1001',
          blockNumber: '40',
          transactionHash: '0xpause1',
          proposalId: 'prop-1',
          action: 'PAUSED',
          timestamp: '1700000005',
        },
      ]

      mockUseQuery.mockReturnValue(
        mockQueryReturn({ data: { emergencyPauseHistory: mockEvents } })
      )

      const { result } = renderHook(() => useEmergencyPauseHistory('0x1001'))

      expect(result.current.history).toEqual(mockEvents)
    })

    it('should use previousData as fallback', () => {
      const previousEvents = [
        {
          contract: '0x1001',
          blockNumber: '35',
          transactionHash: '0xold',
          action: 'UNPAUSED',
          timestamp: '1600000005',
        },
      ]

      mockUseQuery.mockReturnValue(
        mockQueryReturn({
          data: null,
          loading: true,
          previousData: { emergencyPauseHistory: previousEvents },
        })
      )

      const { result } = renderHook(() => useEmergencyPauseHistory('0x1001'))

      expect(result.current.history).toEqual(previousEvents)
    })

    it('should return empty array when no data', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      const { result } = renderHook(() => useEmergencyPauseHistory('0x1001'))

      expect(result.current.history).toEqual([])
    })
  })

  describe('error handling', () => {
    it('should pass through errors directly (no unsupported check)', () => {
      const err = new Error('Internal server error')
      mockUseQuery.mockReturnValue(mockQueryReturn({ error: err }))

      const { result } = renderHook(() => useEmergencyPauseHistory('0x1001'))

      // useEmergencyPauseHistory does NOT use isUnsupportedQueryError suppression
      expect(result.current.error).toBe(err)
    })
  })

  describe('query options', () => {
    it('should enable returnPartialData', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn())

      renderHook(() => useEmergencyPauseHistory('0x1001'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ returnPartialData: true })
      )
    })

    it('should provide a refetch function', () => {
      const mockRefetch = vi.fn()
      mockUseQuery.mockReturnValue(mockQueryReturn({ refetch: mockRefetch }))

      const { result } = renderHook(() => useEmergencyPauseHistory('0x1001'))

      expect(result.current.refetch).toBe(mockRefetch)
    })
  })

  describe('loading state', () => {
    it('should return loading true when query is in progress', () => {
      mockUseQuery.mockReturnValue(mockQueryReturn({ loading: true }))

      const { result } = renderHook(() => useEmergencyPauseHistory('0x1001'))

      expect(result.current.loading).toBe(true)
    })
  })
})
