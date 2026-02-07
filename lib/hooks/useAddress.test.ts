import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useAddressBalance,
  useAddressOverview,
  useTokenBalances,
  useSetCodeDelegation,
} from './useAddress'

// Mock Apollo Client
const mockUseQuery = vi.fn()
vi.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}))

// Mock queries
vi.mock('@/lib/apollo/queries', () => ({
  GET_ADDRESS_BALANCE: 'GET_ADDRESS_BALANCE',
  GET_ADDRESS_OVERVIEW: 'GET_ADDRESS_OVERVIEW',
  GET_TRANSACTIONS_BY_ADDRESS: 'GET_TRANSACTIONS_BY_ADDRESS',
  GET_BALANCE_HISTORY: 'GET_BALANCE_HISTORY',
  GET_TOKEN_BALANCES: 'GET_TOKEN_BALANCES',
  GET_SETCODE_TRANSACTIONS: 'GET_SETCODE_TRANSACTIONS',
}))

// Mock constants
vi.mock('@/lib/config/constants', () => ({
  PAGINATION: {
    ADDRESS_TX_LIMIT: 20,
    BALANCE_HISTORY_LIMIT: 100,
  },
  POLLING_INTERVALS: {
    FAST: 10000,
    SLOW: 30000,
  },
}))

describe('useAddressBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should query with provided address', () => {
    const address = '0x1234567890123456789012345678901234567890'
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      previousData: null,
    })

    renderHook(() => useAddressBalance(address))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_ADDRESS_BALANCE',
      expect.objectContaining({
        variables: { address, blockNumber: null },
        skip: false,
      })
    )
  })

  it('should skip query when address is null', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: undefined,
      previousData: null,
    })

    renderHook(() => useAddressBalance(null))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        skip: true,
      })
    )
  })

  it('should return balance as BigInt', () => {
    mockUseQuery.mockReturnValue({
      data: { addressBalance: '1000000000000000000' },
      loading: false,
      error: undefined,
      previousData: null,
    })

    const { result } = renderHook(() =>
      useAddressBalance('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.balance).toBe(BigInt('1000000000000000000'))
  })

  it('should return null balance when addressBalance is null', () => {
    mockUseQuery.mockReturnValue({
      data: { addressBalance: null },
      loading: false,
      error: undefined,
      previousData: null,
    })

    const { result } = renderHook(() =>
      useAddressBalance('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.balance).toBeNull()
  })

  it('should return null balance when addressBalance is undefined', () => {
    mockUseQuery.mockReturnValue({
      data: {},
      loading: false,
      error: undefined,
      previousData: null,
    })

    const { result } = renderHook(() =>
      useAddressBalance('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.balance).toBeNull()
  })

  it('should use previousData while loading', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      previousData: { addressBalance: '5000000000000000000' },
    })

    const { result } = renderHook(() =>
      useAddressBalance('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.balance).toBe(BigInt('5000000000000000000'))
    expect(result.current.loading).toBe(true)
  })

  it('should pass blockNumber when provided', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      previousData: null,
    })

    renderHook(() =>
      useAddressBalance('0x1234567890123456789012345678901234567890', '12345')
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: {
          address: '0x1234567890123456789012345678901234567890',
          blockNumber: '12345',
        },
      })
    )
  })

  it('should enable polling', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      previousData: null,
    })

    renderHook(() =>
      useAddressBalance('0x1234567890123456789012345678901234567890')
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        pollInterval: 10000,
      })
    )
  })
})

describe('useAddressOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should query with provided address', () => {
    const address = '0x1234567890123456789012345678901234567890'
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      previousData: null,
    })

    renderHook(() => useAddressOverview(address))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_ADDRESS_OVERVIEW',
      expect.objectContaining({
        variables: { address },
        skip: false,
      })
    )
  })

  it('should skip query when address is null', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: undefined,
      previousData: null,
    })

    renderHook(() => useAddressOverview(null))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        skip: true,
      })
    )
  })

  it('should transform raw overview data correctly', () => {
    const rawOverview = {
      address: '0x1234567890123456789012345678901234567890',
      isContract: true,
      balance: '1000000000000000000',
      transactionCount: 100,
      sentCount: 50,
      receivedCount: 50,
      internalTxCount: 10,
      erc20TokenCount: 5,
      erc721TokenCount: 2,
      firstSeen: '1000000',
      lastSeen: '2000000',
    }

    mockUseQuery.mockReturnValue({
      data: { addressOverview: rawOverview },
      loading: false,
      error: undefined,
      previousData: null,
    })

    const { result } = renderHook(() =>
      useAddressOverview('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.overview).toEqual({
      address: '0x1234567890123456789012345678901234567890',
      isContract: true,
      balance: BigInt('1000000000000000000'),
      transactionCount: 100,
      sentCount: 50,
      receivedCount: 50,
      internalTxCount: 10,
      erc20TokenCount: 5,
      erc721TokenCount: 2,
      firstSeen: BigInt('1000000'),
      lastSeen: BigInt('2000000'),
    })
    expect(result.current.isContract).toBe(true)
  })

  it('should handle null firstSeen/lastSeen', () => {
    const rawOverview = {
      address: '0x1234567890123456789012345678901234567890',
      isContract: false,
      balance: '0',
      transactionCount: 0,
      sentCount: 0,
      receivedCount: 0,
      internalTxCount: 0,
      erc20TokenCount: 0,
      erc721TokenCount: 0,
      firstSeen: null,
      lastSeen: null,
    }

    mockUseQuery.mockReturnValue({
      data: { addressOverview: rawOverview },
      loading: false,
      error: undefined,
      previousData: null,
    })

    const { result } = renderHook(() =>
      useAddressOverview('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.overview?.firstSeen).toBeNull()
    expect(result.current.overview?.lastSeen).toBeNull()
  })

  it('should return isContract false when overview is null', () => {
    mockUseQuery.mockReturnValue({
      data: { addressOverview: null },
      loading: false,
      error: undefined,
      previousData: null,
    })

    const { result } = renderHook(() =>
      useAddressOverview('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.isContract).toBe(false)
  })

  it('should use slower polling for overview data', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      previousData: null,
    })

    renderHook(() =>
      useAddressOverview('0x1234567890123456789012345678901234567890')
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        pollInterval: 30000,
      })
    )
  })
})

describe('useTokenBalances', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should query with provided address', () => {
    const address = '0x1234567890123456789012345678901234567890'
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      previousData: null,
    })

    renderHook(() => useTokenBalances(address))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_TOKEN_BALANCES',
      expect.objectContaining({
        variables: { address },
        skip: false,
      })
    )
  })

  it('should skip query when address is null', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: undefined,
      previousData: null,
    })

    renderHook(() => useTokenBalances(null))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        skip: true,
      })
    )
  })

  it('should include tokenType filter when provided', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      previousData: null,
    })

    renderHook(() =>
      useTokenBalances('0x1234567890123456789012345678901234567890', 'ERC-20')
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: {
          address: '0x1234567890123456789012345678901234567890',
          tokenType: 'ERC-20',
        },
      })
    )
  })

  it('should transform balance strings to BigInt', () => {
    const rawBalances = [
      {
        address: '0xtoken1',
        tokenType: 'ERC-20',
        balance: '1000000000000000000',
        tokenId: null,
        name: 'Token 1',
        symbol: 'TK1',
        decimals: 18,
        metadata: null,
      },
      {
        address: '0xtoken2',
        tokenType: 'ERC-721',
        balance: '1',
        tokenId: '123',
        name: 'NFT',
        symbol: 'NFT',
        decimals: null,
        metadata: '{"image": "..."}',
      },
    ]

    mockUseQuery.mockReturnValue({
      data: { tokenBalances: rawBalances },
      loading: false,
      error: undefined,
      previousData: null,
    })

    const { result } = renderHook(() =>
      useTokenBalances('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.balances[0]?.balance).toBe(
      BigInt('1000000000000000000')
    )
    expect(result.current.balances[1]?.balance).toBe(BigInt('1'))
  })

  it('should return empty array when no balances', () => {
    mockUseQuery.mockReturnValue({
      data: { tokenBalances: [] },
      loading: false,
      error: undefined,
      previousData: null,
    })

    const { result } = renderHook(() =>
      useTokenBalances('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.balances).toEqual([])
  })

  it('should use previousData while loading', () => {
    const previousBalances = [
      {
        address: '0xtoken',
        tokenType: 'ERC-20',
        balance: '500',
        tokenId: null,
        name: 'Prev Token',
        symbol: 'PREV',
        decimals: 18,
        metadata: null,
      },
    ]

    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      previousData: { tokenBalances: previousBalances },
    })

    const { result } = renderHook(() =>
      useTokenBalances('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.balances.length).toBe(1)
    expect(result.current.loading).toBe(true)
  })
})

describe('useSetCodeDelegation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should query with provided address', () => {
    const address = '0x1234567890123456789012345678901234567890'
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      previousData: null,
    })

    renderHook(() => useSetCodeDelegation(address))

    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_SETCODE_TRANSACTIONS',
      expect.objectContaining({
        variables: { address, limit: 50, offset: 0 },
        skip: false,
      })
    )
  })

  it('should skip query when address is null', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: undefined,
      previousData: null,
    })

    renderHook(() => useSetCodeDelegation(null))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        skip: true,
      })
    )
  })

  it('should identify SetCode transactions (type 4)', () => {
    const transactions = [
      { hash: '0xabc', blockNumber: '100', from: '0x1', to: '0x2', type: 2 },
      { hash: '0xdef', blockNumber: '101', from: '0x1', to: '0x2', type: 4 },
      { hash: '0xghi', blockNumber: '102', from: '0x1', to: '0x2', type: 4 },
    ]

    mockUseQuery.mockReturnValue({
      data: { transactionsByAddress: { nodes: transactions } },
      loading: false,
      error: undefined,
      previousData: null,
    })

    const { result } = renderHook(() =>
      useSetCodeDelegation('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.hasDelegation).toBe(true)
    expect(result.current.setCodeTransactions.length).toBe(2)
    expect(result.current.delegationTxHash).toBe('0xdef')
    expect(result.current.delegationBlockNumber).toBe('101')
  })

  it('should return hasDelegation false when no SetCode transactions', () => {
    const transactions = [
      { hash: '0xabc', blockNumber: '100', from: '0x1', to: '0x2', type: 2 },
      { hash: '0xdef', blockNumber: '101', from: '0x1', to: '0x2', type: 0 },
    ]

    mockUseQuery.mockReturnValue({
      data: { transactionsByAddress: { nodes: transactions } },
      loading: false,
      error: undefined,
      previousData: null,
    })

    const { result } = renderHook(() =>
      useSetCodeDelegation('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.hasDelegation).toBe(false)
    expect(result.current.delegationTxHash).toBeNull()
    expect(result.current.delegationBlockNumber).toBeNull()
  })

  it('should return null delegation (requires separate fetch)', () => {
    mockUseQuery.mockReturnValue({
      data: {
        transactionsByAddress: {
          nodes: [
            { hash: '0xabc', blockNumber: '100', from: '0x1', to: '0x2', type: 4 },
          ],
        },
      },
      loading: false,
      error: undefined,
      previousData: null,
    })

    const { result } = renderHook(() =>
      useSetCodeDelegation('0x1234567890123456789012345678901234567890')
    )

    // Delegation details require fetching individual tx
    expect(result.current.delegation).toBeNull()
  })

  it('should handle empty transaction list', () => {
    mockUseQuery.mockReturnValue({
      data: { transactionsByAddress: { nodes: [] } },
      loading: false,
      error: undefined,
      previousData: null,
    })

    const { result } = renderHook(() =>
      useSetCodeDelegation('0x1234567890123456789012345678901234567890')
    )

    expect(result.current.hasDelegation).toBe(false)
    expect(result.current.setCodeTransactions).toEqual([])
  })

  it('should use slower polling', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
      previousData: null,
    })

    renderHook(() =>
      useSetCodeDelegation('0x1234567890123456789012345678901234567890')
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        pollInterval: 30000,
      })
    )
  })
})
