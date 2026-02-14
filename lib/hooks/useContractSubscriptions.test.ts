import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import type {
  SystemContractEventMessage,
  DynamicContractEventMessage,
  ParsedSystemContractEvent,
  RegisteredContract,
} from './useContractSubscriptions'

// ============================================================================
// Mocks
// ============================================================================

const mockUseQuery = vi.fn()
const mockUseSubscription = vi.fn()
const mockUseMutation = vi.fn()
vi.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useSubscription: (...args: unknown[]) => mockUseSubscription(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}))

vi.mock('@/lib/graphql/queries/system-contracts', () => ({
  SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION: 'SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION',
  REGISTER_CONTRACT: 'REGISTER_CONTRACT',
  UNREGISTER_CONTRACT: 'UNREGISTER_CONTRACT',
  GET_REGISTERED_CONTRACTS: 'GET_REGISTERED_CONTRACTS',
  GET_REGISTERED_CONTRACT: 'GET_REGISTERED_CONTRACT',
  DYNAMIC_CONTRACT_EVENTS_SUBSCRIPTION: 'DYNAMIC_CONTRACT_EVENTS_SUBSCRIPTION',
}))

// Import after mocks
import {
  parseSystemContractEvent,
  parseDynamicContractEvent,
  useSystemContractEvents,
  useContractRegistration,
  useRegisteredContracts,
  useRegisteredContract,
  useDynamicContractEvents,
  useMintBurnEvents,
  useGovernanceEvents,
  useBlacklistEvents,
  SYSTEM_CONTRACTS,
} from './useContractSubscriptions'

// ============================================================================
// Test Fixtures
// ============================================================================

function makeSystemEventMessage(
  overrides: Partial<SystemContractEventMessage> = {}
): SystemContractEventMessage {
  return {
    contract: '0x0000000000000000000000000000000000001000',
    eventName: 'Mint',
    blockNumber: '100',
    transactionHash: '0xabc123',
    logIndex: 0,
    data: '{"amount":"1000","to":"0xrecipient"}',
    timestamp: '1700000000',
    ...overrides,
  }
}

function makeDynamicEventMessage(
  overrides: Partial<DynamicContractEventMessage> = {}
): DynamicContractEventMessage {
  return {
    contract: '0xcustom',
    contractName: 'MyToken',
    eventName: 'Transfer',
    blockNumber: '200',
    txHash: '0xdef456',
    logIndex: 1,
    data: '{"from":"0xa","to":"0xb","value":"500"}',
    timestamp: '1700001000',
    ...overrides,
  }
}

function makeRegisteredContract(
  overrides: Partial<RegisteredContract> = {}
): RegisteredContract {
  return {
    address: '0xcustom',
    name: 'MyToken',
    isVerified: true,
    registeredAt: '2024-01-01T00:00:00Z',
    events: ['Transfer', 'Approval'],
    ...overrides,
  }
}

// ============================================================================
// parseSystemContractEvent
// ============================================================================

describe('parseSystemContractEvent', () => {
  it('parses valid JSON data from message', () => {
    const msg = makeSystemEventMessage({
      data: '{"amount":"500","recipient":"0xabc"}',
    })
    const result = parseSystemContractEvent(msg)
    expect(result.data).toEqual({ amount: '500', recipient: '0xabc' })
    expect(result.contract).toBe(msg.contract)
    expect(result.eventName).toBe(msg.eventName)
    expect(result.blockNumber).toBe(msg.blockNumber)
    expect(result.transactionHash).toBe(msg.transactionHash)
    expect(result.logIndex).toBe(msg.logIndex)
    expect(result.timestamp).toBe(msg.timestamp)
  })

  it('returns empty object when JSON data is invalid', () => {
    const msg = makeSystemEventMessage({ data: 'not-valid-json{{{' })
    const result = parseSystemContractEvent(msg)
    expect(result.data).toEqual({})
  })

  it('handles empty string data', () => {
    const msg = makeSystemEventMessage({ data: '' })
    const result = parseSystemContractEvent(msg)
    expect(result.data).toEqual({})
  })

  it('preserves all non-data fields verbatim', () => {
    const msg = makeSystemEventMessage({
      contract: '0xspecific',
      eventName: 'Burn',
      blockNumber: '999',
      transactionHash: '0xtx',
      logIndex: 5,
      timestamp: '1700099999',
    })
    const result = parseSystemContractEvent(msg)
    expect(result.contract).toBe('0xspecific')
    expect(result.eventName).toBe('Burn')
    expect(result.blockNumber).toBe('999')
    expect(result.transactionHash).toBe('0xtx')
    expect(result.logIndex).toBe(5)
    expect(result.timestamp).toBe('1700099999')
  })

  it('parses with generic type parameter', () => {
    interface MintData {
      amount: string
      to: string
    }
    const msg = makeSystemEventMessage({
      data: '{"amount":"1000","to":"0xrecipient"}',
    })
    const result = parseSystemContractEvent<MintData>(msg)
    expect(result.data.amount).toBe('1000')
    expect(result.data.to).toBe('0xrecipient')
  })
})

// ============================================================================
// parseDynamicContractEvent
// ============================================================================

describe('parseDynamicContractEvent', () => {
  it('parses valid JSON data from message', () => {
    const msg = makeDynamicEventMessage({
      data: '{"from":"0xa","to":"0xb","value":"100"}',
    })
    const result = parseDynamicContractEvent(msg)
    expect(result.data).toEqual({ from: '0xa', to: '0xb', value: '100' })
    expect(result.contract).toBe(msg.contract)
    expect(result.contractName).toBe(msg.contractName)
    expect(result.eventName).toBe(msg.eventName)
    expect(result.txHash).toBe(msg.txHash)
  })

  it('returns empty object when JSON data is invalid', () => {
    const msg = makeDynamicEventMessage({ data: '<<<invalid>>>' })
    const result = parseDynamicContractEvent(msg)
    expect(result.data).toEqual({})
  })

  it('preserves all non-data fields verbatim', () => {
    const msg = makeDynamicEventMessage({
      contract: '0xdynamic',
      contractName: 'DEX',
      eventName: 'Swap',
      blockNumber: '555',
      txHash: '0xtx555',
      logIndex: 3,
      timestamp: '1700055555',
    })
    const result = parseDynamicContractEvent(msg)
    expect(result.contract).toBe('0xdynamic')
    expect(result.contractName).toBe('DEX')
    expect(result.eventName).toBe('Swap')
    expect(result.blockNumber).toBe('555')
    expect(result.txHash).toBe('0xtx555')
    expect(result.logIndex).toBe(3)
    expect(result.timestamp).toBe('1700055555')
  })

  it('parses with generic type parameter', () => {
    interface TransferData {
      from: string
      to: string
      value: string
    }
    const msg = makeDynamicEventMessage({
      data: '{"from":"0xa","to":"0xb","value":"500"}',
    })
    const result = parseDynamicContractEvent<TransferData>(msg)
    expect(result.data.from).toBe('0xa')
    expect(result.data.to).toBe('0xb')
    expect(result.data.value).toBe('500')
  })
})

// ============================================================================
// SYSTEM_CONTRACTS constant
// ============================================================================

describe('SYSTEM_CONTRACTS', () => {
  it('contains correct NativeCoinAdapter address', () => {
    expect(SYSTEM_CONTRACTS.NativeCoinAdapter).toBe(
      '0x0000000000000000000000000000000000001000'
    )
  })

  it('contains correct GovValidator address', () => {
    expect(SYSTEM_CONTRACTS.GovValidator).toBe(
      '0x0000000000000000000000000000000000001001'
    )
  })

  it('contains all five system contract addresses', () => {
    expect(Object.keys(SYSTEM_CONTRACTS)).toHaveLength(5)
    expect(SYSTEM_CONTRACTS).toHaveProperty('NativeCoinAdapter')
    expect(SYSTEM_CONTRACTS).toHaveProperty('GovValidator')
    expect(SYSTEM_CONTRACTS).toHaveProperty('GovMasterMinter')
    expect(SYSTEM_CONTRACTS).toHaveProperty('GovMinter')
    expect(SYSTEM_CONTRACTS).toHaveProperty('GovCouncil')
  })
})

// ============================================================================
// useSystemContractEvents
// ============================================================================

describe('useSystemContractEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSubscription.mockReturnValue({ data: null, loading: true, error: null })
  })

  it('subscribes with empty filter when no params provided', () => {
    renderHook(() => useSystemContractEvents())
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({
        variables: { filter: {} },
        skip: false,
      })
    )
  })

  it('includes contract in filter when provided', () => {
    renderHook(() => useSystemContractEvents({ contract: '0x1000' }))
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({
        variables: { filter: { contract: '0x1000' } },
      })
    )
  })

  it('includes eventTypes in filter when provided and non-empty', () => {
    renderHook(() => useSystemContractEvents({ eventTypes: ['Mint', 'Burn'] }))
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({
        variables: { filter: { eventTypes: ['Mint', 'Burn'] } },
      })
    )
  })

  it('does not include eventTypes in filter when array is empty', () => {
    renderHook(() => useSystemContractEvents({ eventTypes: [] }))
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({
        variables: { filter: {} },
      })
    )
  })

  it('passes skip option to subscription', () => {
    renderHook(() => useSystemContractEvents({ skip: true }))
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({ skip: true })
    )
  })

  it('returns parsed event from subscription data', () => {
    const rawEvent = makeSystemEventMessage()
    mockUseSubscription.mockReturnValue({
      data: { systemContractEvents: rawEvent },
      loading: false,
      error: null,
    })
    const { result } = renderHook(() => useSystemContractEvents())
    expect(result.current.event).not.toBeNull()
    expect(result.current.event?.contract).toBe(rawEvent.contract)
    expect(result.current.rawEvent).toBe(rawEvent)
  })

  it('returns null event when no subscription data', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useSystemContractEvents())
    expect(result.current.event).toBeNull()
    expect(result.current.rawEvent).toBeUndefined()
  })

  it('calls onEvent callback via onData when event arrives', () => {
    const onEvent = vi.fn()
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useSystemContractEvents({ onEvent }))

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    const rawEvent = makeSystemEventMessage({ eventName: 'Burn' })
    onData({ data: { data: { systemContractEvents: rawEvent } } })

    expect(onEvent).toHaveBeenCalledTimes(1)
    const calledArg = onEvent.mock.calls[0]![0] as ParsedSystemContractEvent
    expect(calledArg.eventName).toBe('Burn')
  })

  it('does not call onEvent when subscription data is null in onData', () => {
    const onEvent = vi.fn()
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useSystemContractEvents({ onEvent }))

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    onData({ data: { data: null } })
    expect(onEvent).not.toHaveBeenCalled()
  })

  it('returns loading and error from subscription', () => {
    const subError = new Error('sub failed')
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: subError })
    const { result } = renderHook(() => useSystemContractEvents())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(subError)
  })
})

// ============================================================================
// useMintBurnEvents / useGovernanceEvents / useBlacklistEvents
// ============================================================================

describe('convenience subscription hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSubscription.mockReturnValue({ data: null, loading: true, error: null })
  })

  it('useMintBurnEvents filters by NativeCoinAdapter and Mint/Burn events', () => {
    renderHook(() => useMintBurnEvents())
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({
        variables: {
          filter: {
            contract: SYSTEM_CONTRACTS.NativeCoinAdapter,
            eventTypes: ['Mint', 'Burn'],
          },
        },
      })
    )
  })

  it('useGovernanceEvents filters by governance event types', () => {
    renderHook(() => useGovernanceEvents())
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({
        variables: {
          filter: {
            eventTypes: expect.arrayContaining([
              'ProposalCreated',
              'ProposalVoted',
              'ProposalApproved',
            ]),
          },
        },
      })
    )
  })

  it('useGovernanceEvents passes contract filter when provided', () => {
    renderHook(() => useGovernanceEvents({ contract: '0x1001' }))
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({
        variables: {
          filter: expect.objectContaining({ contract: '0x1001' }),
        },
      })
    )
  })

  it('useBlacklistEvents filters by GovCouncil and blacklist events', () => {
    renderHook(() => useBlacklistEvents())
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'SYSTEM_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({
        variables: {
          filter: {
            contract: SYSTEM_CONTRACTS.GovCouncil,
            eventTypes: ['AddressBlacklisted', 'AddressUnblacklisted'],
          },
        },
      })
    )
  })
})

// ============================================================================
// useContractRegistration
// ============================================================================

describe('useContractRegistration', () => {
  const mockRegisterFn = vi.fn()
  const mockUnregisterFn = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockRegisterFn.mockResolvedValue({
      data: { registerContract: makeRegisteredContract() },
    })
    mockUnregisterFn.mockResolvedValue({
      data: { unregisterContract: true },
    })
    mockUseMutation
      .mockReturnValueOnce([mockRegisterFn, { loading: false, error: null }])
      .mockReturnValueOnce([mockUnregisterFn, { loading: false, error: null }])
  })

  it('provides registerContract and unregisterContract functions', () => {
    const { result } = renderHook(() => useContractRegistration())
    expect(typeof result.current.registerContract).toBe('function')
    expect(typeof result.current.unregisterContract).toBe('function')
  })

  it('registerContract calls mutation with input and refetchQueries', async () => {
    const { result } = renderHook(() => useContractRegistration())
    const input = { address: '0xnew', name: 'NewToken', abi: '[]' }
    await result.current.registerContract(input)

    expect(mockRegisterFn).toHaveBeenCalledWith({
      variables: { input },
      refetchQueries: [{ query: 'GET_REGISTERED_CONTRACTS' }],
    })
  })

  it('registerContract returns the registered contract from result', async () => {
    const expected = makeRegisteredContract({ address: '0xresult' })
    mockRegisterFn.mockResolvedValue({
      data: { registerContract: expected },
    })
    // Re-setup mutation mock for this test
    mockUseMutation
      .mockReset()
      .mockReturnValueOnce([mockRegisterFn, { loading: false, error: null }])
      .mockReturnValueOnce([mockUnregisterFn, { loading: false, error: null }])

    const { result } = renderHook(() => useContractRegistration())
    const returned = await result.current.registerContract({
      address: '0xresult',
      name: 'Test',
      abi: '[]',
    })
    expect(returned).toBe(expected)
  })

  it('unregisterContract calls mutation with address', async () => {
    const { result } = renderHook(() => useContractRegistration())
    await result.current.unregisterContract('0xremove')

    expect(mockUnregisterFn).toHaveBeenCalledWith({
      variables: { address: '0xremove' },
      refetchQueries: [{ query: 'GET_REGISTERED_CONTRACTS' }],
    })
  })

  it('unregisterContract returns boolean result', async () => {
    const { result } = renderHook(() => useContractRegistration())
    const returned = await result.current.unregisterContract('0xaddr')
    expect(returned).toBe(true)
  })

  it('returns combined loading state', () => {
    mockUseMutation
      .mockReset()
      .mockReturnValueOnce([mockRegisterFn, { loading: true, error: null }])
      .mockReturnValueOnce([mockUnregisterFn, { loading: false, error: null }])
    const { result } = renderHook(() => useContractRegistration())
    expect(result.current.loading).toBe(true)
  })

  it('returns error from register mutation', () => {
    const regError = new Error('register failed')
    mockUseMutation
      .mockReset()
      .mockReturnValueOnce([mockRegisterFn, { loading: false, error: regError }])
      .mockReturnValueOnce([mockUnregisterFn, { loading: false, error: null }])
    const { result } = renderHook(() => useContractRegistration())
    expect(result.current.error).toBe(regError)
  })

  it('returns error from unregister mutation', () => {
    const unregError = new Error('unregister failed')
    mockUseMutation
      .mockReset()
      .mockReturnValueOnce([mockRegisterFn, { loading: false, error: null }])
      .mockReturnValueOnce([mockUnregisterFn, { loading: false, error: unregError }])
    const { result } = renderHook(() => useContractRegistration())
    expect(result.current.error).toBe(unregError)
  })
})

// ============================================================================
// useRegisteredContracts
// ============================================================================

describe('useRegisteredContracts', () => {
  const mockRefetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
      previousData: null,
    })
  })

  it('queries with returnPartialData and errorPolicy all', () => {
    renderHook(() => useRegisteredContracts())
    expect(mockUseQuery).toHaveBeenCalledWith('GET_REGISTERED_CONTRACTS', {
      returnPartialData: true,
      errorPolicy: 'all',
    })
  })

  it('returns contracts from query data', () => {
    const contracts = [makeRegisteredContract(), makeRegisteredContract({ address: '0x2' })]
    mockUseQuery.mockReturnValue({
      data: { registeredContracts: contracts },
      loading: false,
      error: null,
      refetch: mockRefetch,
      previousData: null,
    })
    const { result } = renderHook(() => useRegisteredContracts())
    expect(result.current.contracts).toBe(contracts)
  })

  it('returns empty array when no data', () => {
    const { result } = renderHook(() => useRegisteredContracts())
    expect(result.current.contracts).toEqual([])
  })

  it('falls back to previousData when data is null', () => {
    const previousContracts = [makeRegisteredContract({ address: '0xprev' })]
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: mockRefetch,
      previousData: { registeredContracts: previousContracts },
    })
    const { result } = renderHook(() => useRegisteredContracts())
    expect(result.current.contracts).toBe(previousContracts)
  })

  it('suppresses unsupported query errors (Cannot query field)', () => {
    const unsupportedError = new Error('Cannot query field "registeredContracts"')
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: unsupportedError,
      refetch: mockRefetch,
      previousData: null,
    })
    const { result } = renderHook(() => useRegisteredContracts())
    expect(result.current.error).toBeUndefined()
  })

  it('suppresses unsupported query errors (Unknown field)', () => {
    const unknownFieldError = new Error('Unknown field "registeredContracts"')
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: unknownFieldError,
      refetch: mockRefetch,
      previousData: null,
    })
    const { result } = renderHook(() => useRegisteredContracts())
    expect(result.current.error).toBeUndefined()
  })

  it('passes through non-unsupported errors', () => {
    const networkError = new Error('Network error')
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: networkError,
      refetch: mockRefetch,
      previousData: null,
    })
    const { result } = renderHook(() => useRegisteredContracts())
    expect(result.current.error).toBe(networkError)
  })

  it('returns refetch function', () => {
    const { result } = renderHook(() => useRegisteredContracts())
    expect(result.current.refetch).toBe(mockRefetch)
  })
})

// ============================================================================
// useRegisteredContract
// ============================================================================

describe('useRegisteredContract', () => {
  const mockRefetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
      previousData: null,
    })
  })

  it('queries with address variable and skips when address is empty', () => {
    renderHook(() => useRegisteredContract(''))
    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_REGISTERED_CONTRACT',
      expect.objectContaining({
        variables: { address: '' },
        skip: true,
      })
    )
  })

  it('does not skip when address is provided', () => {
    renderHook(() => useRegisteredContract('0xvalid'))
    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_REGISTERED_CONTRACT',
      expect.objectContaining({
        variables: { address: '0xvalid' },
        skip: false,
      })
    )
  })

  it('returns contract from query data', () => {
    const contract = makeRegisteredContract({ address: '0xfound' })
    mockUseQuery.mockReturnValue({
      data: { registeredContract: contract },
      loading: false,
      error: null,
      refetch: mockRefetch,
      previousData: null,
    })
    const { result } = renderHook(() => useRegisteredContract('0xfound'))
    expect(result.current.contract).toBe(contract)
  })

  it('returns null contract when data has null registeredContract', () => {
    mockUseQuery.mockReturnValue({
      data: { registeredContract: null },
      loading: false,
      error: null,
      refetch: mockRefetch,
      previousData: null,
    })
    const { result } = renderHook(() => useRegisteredContract('0xnotfound'))
    expect(result.current.contract).toBeNull()
  })

  it('falls back to previousData when data is null', () => {
    const prevContract = makeRegisteredContract({ address: '0xprev' })
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: mockRefetch,
      previousData: { registeredContract: prevContract },
    })
    const { result } = renderHook(() => useRegisteredContract('0xprev'))
    expect(result.current.contract).toBe(prevContract)
  })

  it('suppresses unsupported query errors', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Cannot query field "registeredContract"'),
      refetch: mockRefetch,
      previousData: null,
    })
    const { result } = renderHook(() => useRegisteredContract('0x1'))
    expect(result.current.error).toBeUndefined()
  })
})

// ============================================================================
// useDynamicContractEvents
// ============================================================================

describe('useDynamicContractEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSubscription.mockReturnValue({ data: null, loading: true, error: null })
  })

  it('subscribes with empty filter when no params provided', () => {
    renderHook(() => useDynamicContractEvents())
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'DYNAMIC_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({
        variables: { filter: {} },
        skip: false,
      })
    )
  })

  it('includes contract in filter when provided', () => {
    renderHook(() => useDynamicContractEvents({ contract: '0xdyn' }))
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'DYNAMIC_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({
        variables: { filter: { contract: '0xdyn' } },
      })
    )
  })

  it('includes eventNames in filter when provided and non-empty', () => {
    renderHook(() => useDynamicContractEvents({ eventNames: ['Transfer'] }))
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'DYNAMIC_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({
        variables: { filter: { eventNames: ['Transfer'] } },
      })
    )
  })

  it('does not include eventNames when array is empty', () => {
    renderHook(() => useDynamicContractEvents({ eventNames: [] }))
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'DYNAMIC_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({
        variables: { filter: {} },
      })
    )
  })

  it('returns parsed event from subscription data', () => {
    const rawEvent = makeDynamicEventMessage()
    mockUseSubscription.mockReturnValue({
      data: { dynamicContractEvents: rawEvent },
      loading: false,
      error: null,
    })
    const { result } = renderHook(() => useDynamicContractEvents())
    expect(result.current.event).not.toBeNull()
    expect(result.current.event?.contractName).toBe('MyToken')
    expect(result.current.rawEvent).toBe(rawEvent)
  })

  it('returns null event when no subscription data', () => {
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    const { result } = renderHook(() => useDynamicContractEvents())
    expect(result.current.event).toBeNull()
  })

  it('calls onEvent callback via onData when event arrives', () => {
    const onEvent = vi.fn()
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useDynamicContractEvents({ onEvent }))

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    const rawEvent = makeDynamicEventMessage({ eventName: 'Approval' })
    onData({ data: { data: { dynamicContractEvents: rawEvent } } })

    expect(onEvent).toHaveBeenCalledTimes(1)
    expect(onEvent.mock.calls[0]![0].eventName).toBe('Approval')
  })

  it('does not call onEvent when onData payload is empty', () => {
    const onEvent = vi.fn()
    mockUseSubscription.mockReturnValue({ data: null, loading: false, error: null })
    renderHook(() => useDynamicContractEvents({ onEvent }))

    const onData = mockUseSubscription.mock.calls[0]![1].onData
    onData({ data: { data: null } })
    expect(onEvent).not.toHaveBeenCalled()
  })

  it('passes skip option to subscription', () => {
    renderHook(() => useDynamicContractEvents({ skip: true }))
    expect(mockUseSubscription).toHaveBeenCalledWith(
      'DYNAMIC_CONTRACT_EVENTS_SUBSCRIPTION',
      expect.objectContaining({ skip: true })
    )
  })
})
