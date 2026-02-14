import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useContractCall,
  useContractCallLazy,
  useTransactionStatus,
  useInternalTransactionsRPC,
  useRPCProxyMetrics,
  useTokenBalance,
  useNativeBalance,
} from './useRpcProxy'

// Mock Apollo Client
const mockUseQuery = vi.fn()
const mockUseLazyQuery = vi.fn()
vi.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useLazyQuery: (...args: unknown[]) => mockUseLazyQuery(...args),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}))

// Mock GraphQL queries
vi.mock('@/lib/graphql/queries/rpcProxy', () => ({
  CONTRACT_CALL: 'CONTRACT_CALL',
  TRANSACTION_STATUS: 'TRANSACTION_STATUS',
  INTERNAL_TRANSACTIONS_RPC: 'INTERNAL_TRANSACTIONS_RPC',
  RPC_PROXY_METRICS: 'RPC_PROXY_METRICS',
}))

vi.mock('@/lib/apollo/queries', () => ({
  GET_LIVE_BALANCE: 'GET_LIVE_BALANCE',
}))

// ---------------------------------------------------------------------------
// useContractCall
// ---------------------------------------------------------------------------

describe('useContractCall', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('query configuration', () => {
    it('should call useQuery with correct variables', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
      })

      renderHook(() => useContractCall('0xAddr', 'balanceOf', ['0xWallet'], 'erc20'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'CONTRACT_CALL',
        expect.objectContaining({
          variables: {
            address: '0xAddr',
            method: 'balanceOf',
            params: JSON.stringify(['0xWallet']),
            abi: 'erc20',
          },
          skip: false,
          errorPolicy: 'all',
        })
      )
    })

    it('should omit params and abi when not provided', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
      })

      renderHook(() => useContractCall('0xAddr', 'name'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'CONTRACT_CALL',
        expect.objectContaining({
          variables: {
            address: '0xAddr',
            method: 'name',
            params: undefined,
            abi: undefined,
          },
        })
      )
    })
  })

  describe('skip behavior', () => {
    it('should skip when address is empty', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      renderHook(() => useContractCall('', 'name'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ skip: true })
      )
    })

    it('should skip when method is empty', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      renderHook(() => useContractCall('0xAddr', ''))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ skip: true })
      )
    })
  })

  describe('data parsing', () => {
    it('should parse decoded JSON result', () => {
      mockUseQuery.mockReturnValue({
        data: {
          contractCall: {
            result: '"TokenName"',
            rawResult: '0x000000',
            decoded: true,
          },
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useContractCall('0xAddr', 'name'))

      expect(result.current.parsedResult).toBe('TokenName')
    })

    it('should return raw string when JSON.parse fails', () => {
      mockUseQuery.mockReturnValue({
        data: {
          contractCall: {
            result: 'not-valid-json',
            rawResult: '0x000000',
            decoded: true,
          },
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useContractCall('0xAddr', 'name'))

      expect(result.current.parsedResult).toBe('not-valid-json')
    })

    it('should return null when decoded is false', () => {
      mockUseQuery.mockReturnValue({
        data: {
          contractCall: {
            result: '"TokenName"',
            rawResult: '0x000000',
            decoded: false,
          },
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useContractCall('0xAddr', 'name'))

      expect(result.current.parsedResult).toBeNull()
    })

    it('should return null when result is null', () => {
      mockUseQuery.mockReturnValue({
        data: {
          contractCall: {
            result: null,
            rawResult: '0x',
            decoded: true,
          },
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useContractCall('0xAddr', 'name'))

      expect(result.current.parsedResult).toBeNull()
    })
  })

  describe('return values', () => {
    it('should return loading state', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useContractCall('0xAddr', 'name'))

      expect(result.current.loading).toBe(true)
      expect(result.current.result).toBeUndefined()
    })

    it('should return error state', () => {
      const mockError = new Error('Contract call failed')

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useContractCall('0xAddr', 'name'))

      expect(result.current.error).toEqual(mockError)
    })

    it('should expose refetch function', () => {
      const mockRefetch = vi.fn()

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: mockRefetch,
      })

      const { result } = renderHook(() => useContractCall('0xAddr', 'name'))

      expect(result.current.refetch).toBe(mockRefetch)
    })
  })
})

// ---------------------------------------------------------------------------
// useContractCallLazy
// ---------------------------------------------------------------------------

describe('useContractCallLazy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with useLazyQuery', () => {
      mockUseLazyQuery.mockReturnValue([
        vi.fn(),
        { data: null, loading: false, error: undefined },
      ])

      renderHook(() => useContractCallLazy())

      expect(mockUseLazyQuery).toHaveBeenCalledWith('CONTRACT_CALL', {
        errorPolicy: 'all',
      })
    })

    it('should return call function and initial state', () => {
      mockUseLazyQuery.mockReturnValue([
        vi.fn(),
        { data: null, loading: false, error: undefined },
      ])

      const { result } = renderHook(() => useContractCallLazy())

      expect(typeof result.current.call).toBe('function')
      expect(result.current.data).toBeUndefined()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeUndefined()
    })
  })

  describe('call execution', () => {
    it('should execute with correct variables', async () => {
      const mockExecute = vi.fn().mockResolvedValue({
        data: {
          contractCall: {
            result: '"hello"',
            rawResult: '0x00',
            decoded: true,
          },
        },
      })

      mockUseLazyQuery.mockReturnValue([
        mockExecute,
        { data: null, loading: false, error: undefined },
      ])

      const { result } = renderHook(() => useContractCallLazy())
      const callResult = await result.current.call('0xAddr', 'greet', ['world'], 'abi')

      expect(mockExecute).toHaveBeenCalledWith({
        variables: {
          address: '0xAddr',
          method: 'greet',
          params: JSON.stringify(['world']),
          abi: 'abi',
        },
      })
      expect(callResult).toEqual({
        result: '"hello"',
        rawResult: '0x00',
        decoded: true,
      })
    })

    it('should return null when result data is missing', async () => {
      const mockExecute = vi.fn().mockResolvedValue({ data: null })

      mockUseLazyQuery.mockReturnValue([
        mockExecute,
        { data: null, loading: false, error: undefined },
      ])

      const { result } = renderHook(() => useContractCallLazy())
      const callResult = await result.current.call('0xAddr', 'name')

      expect(callResult).toBeNull()
    })

    it('should omit params when not provided', async () => {
      const mockExecute = vi.fn().mockResolvedValue({ data: null })

      mockUseLazyQuery.mockReturnValue([
        mockExecute,
        { data: null, loading: false, error: undefined },
      ])

      const { result } = renderHook(() => useContractCallLazy())
      await result.current.call('0xAddr', 'name')

      expect(mockExecute).toHaveBeenCalledWith({
        variables: {
          address: '0xAddr',
          method: 'name',
          params: undefined,
          abi: undefined,
        },
      })
    })
  })
})

// ---------------------------------------------------------------------------
// useTransactionStatus
// ---------------------------------------------------------------------------

describe('useTransactionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('query configuration', () => {
    it('should call useQuery with txHash', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      })

      renderHook(() => useTransactionStatus('0xTxHash'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'TRANSACTION_STATUS',
        expect.objectContaining({
          variables: { txHash: '0xTxHash' },
          skip: false,
          errorPolicy: 'all',
        })
      )
    })

    it('should skip when txHash is empty', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      })

      renderHook(() => useTransactionStatus(''))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ skip: true })
      )
    })

    it('should include pollInterval when provided', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      })

      renderHook(() => useTransactionStatus('0xTxHash', 3000))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'TRANSACTION_STATUS',
        expect.objectContaining({ pollInterval: 3000 })
      )
    })

    it('should not include pollInterval when omitted', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      })

      renderHook(() => useTransactionStatus('0xTxHash'))

      const callArgs = mockUseQuery.mock.calls[0]![1] as Record<string, unknown>
      expect(callArgs).not.toHaveProperty('pollInterval')
    })
  })

  describe('status helpers', () => {
    it('should set isPending when status is pending', () => {
      mockUseQuery.mockReturnValue({
        data: {
          transactionStatus: {
            txHash: '0x1',
            status: 'pending',
            confirmations: '0',
          },
        },
        loading: false,
        error: undefined,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      })

      const { result } = renderHook(() => useTransactionStatus('0x1'))

      expect(result.current.isPending).toBe(true)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.isFailed).toBe(false)
      expect(result.current.isConfirmed).toBe(false)
      expect(result.current.isNotFound).toBe(false)
    })

    it('should set isSuccess when status is success', () => {
      mockUseQuery.mockReturnValue({
        data: {
          transactionStatus: {
            txHash: '0x1',
            status: 'success',
            confirmations: '5',
            blockNumber: '100',
          },
        },
        loading: false,
        error: undefined,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      })

      const { result } = renderHook(() => useTransactionStatus('0x1'))

      expect(result.current.isSuccess).toBe(true)
      expect(result.current.isPending).toBe(false)
    })

    it('should set isFailed when status is failed', () => {
      mockUseQuery.mockReturnValue({
        data: {
          transactionStatus: {
            txHash: '0x1',
            status: 'failed',
            confirmations: '0',
          },
        },
        loading: false,
        error: undefined,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      })

      const { result } = renderHook(() => useTransactionStatus('0x1'))

      expect(result.current.isFailed).toBe(true)
    })

    it('should set isConfirmed when status is confirmed', () => {
      mockUseQuery.mockReturnValue({
        data: {
          transactionStatus: {
            txHash: '0x1',
            status: 'confirmed',
            confirmations: '12',
            blockNumber: '100',
          },
        },
        loading: false,
        error: undefined,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      })

      const { result } = renderHook(() => useTransactionStatus('0x1'))

      expect(result.current.isConfirmed).toBe(true)
    })

    it('should set isNotFound when status is not_found', () => {
      mockUseQuery.mockReturnValue({
        data: {
          transactionStatus: {
            txHash: '0x1',
            status: 'not_found',
            confirmations: '0',
          },
        },
        loading: false,
        error: undefined,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      })

      const { result } = renderHook(() => useTransactionStatus('0x1'))

      expect(result.current.isNotFound).toBe(true)
    })

    it('should have all helpers false when no data', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      })

      const { result } = renderHook(() => useTransactionStatus('0x1'))

      expect(result.current.isPending).toBe(false)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.isFailed).toBe(false)
      expect(result.current.isConfirmed).toBe(false)
      expect(result.current.isNotFound).toBe(false)
    })
  })

  describe('polling controls', () => {
    it('should expose startPolling and stopPolling', () => {
      const mockStartPolling = vi.fn()
      const mockStopPolling = vi.fn()

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        startPolling: mockStartPolling,
        stopPolling: mockStopPolling,
      })

      const { result } = renderHook(() => useTransactionStatus('0xTx'))

      expect(result.current.startPolling).toBe(mockStartPolling)
      expect(result.current.stopPolling).toBe(mockStopPolling)
    })
  })
})

// ---------------------------------------------------------------------------
// useInternalTransactionsRPC
// ---------------------------------------------------------------------------

describe('useInternalTransactionsRPC', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('query configuration', () => {
    it('should call useQuery with txHash', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
      })

      renderHook(() => useInternalTransactionsRPC('0xTxHash'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'INTERNAL_TRANSACTIONS_RPC',
        expect.objectContaining({
          variables: { txHash: '0xTxHash' },
          skip: false,
          errorPolicy: 'all',
        })
      )
    })

    it('should skip when txHash is empty', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      renderHook(() => useInternalTransactionsRPC(''))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ skip: true })
      )
    })
  })

  describe('return values', () => {
    it('should return internal transactions from response', () => {
      const mockInternalTxs = [
        {
          type: 'CALL' as const,
          from: '0xA',
          to: '0xB',
          value: '1000',
          gas: '21000',
          gasUsed: '21000',
          depth: 0,
          traceAddress: [0],
        },
        {
          type: 'DELEGATECALL' as const,
          from: '0xB',
          to: '0xC',
          value: '0',
          gas: '10000',
          gasUsed: '5000',
          depth: 1,
          traceAddress: [0, 0],
        },
      ]

      mockUseQuery.mockReturnValue({
        data: {
          internalTransactionsRPC: {
            txHash: '0xTx',
            internalTransactions: mockInternalTxs,
            totalCount: 2,
          },
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useInternalTransactionsRPC('0xTx'))

      expect(result.current.internalTransactions).toEqual(mockInternalTxs)
      expect(result.current.totalCount).toBe(2)
      expect(result.current.result).toEqual({
        txHash: '0xTx',
        internalTransactions: mockInternalTxs,
        totalCount: 2,
      })
    })

    it('should default to empty array and zero count when no data', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useInternalTransactionsRPC('0xTx'))

      expect(result.current.internalTransactions).toEqual([])
      expect(result.current.totalCount).toBe(0)
      expect(result.current.result).toBeUndefined()
    })

    it('should return loading state', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useInternalTransactionsRPC('0xTx'))

      expect(result.current.loading).toBe(true)
    })

    it('should return error state', () => {
      const mockError = new Error('Trace failed')

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useInternalTransactionsRPC('0xTx'))

      expect(result.current.error).toEqual(mockError)
    })

    it('should expose refetch function', () => {
      const mockRefetch = vi.fn()

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: mockRefetch,
      })

      const { result } = renderHook(() => useInternalTransactionsRPC('0xTx'))

      expect(result.current.refetch).toBe(mockRefetch)
    })
  })
})

// ---------------------------------------------------------------------------
// useRPCProxyMetrics
// ---------------------------------------------------------------------------

describe('useRPCProxyMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('query configuration', () => {
    it('should poll every 5 seconds', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
      })

      renderHook(() => useRPCProxyMetrics())

      expect(mockUseQuery).toHaveBeenCalledWith(
        'RPC_PROXY_METRICS',
        expect.objectContaining({
          pollInterval: 5000,
          errorPolicy: 'all',
        })
      )
    })
  })

  describe('return values', () => {
    it('should return metrics data', () => {
      const mockMetrics = {
        totalRequests: '10000',
        successfulRequests: '9500',
        failedRequests: '500',
        cacheHits: '3000',
        cacheMisses: '7000',
        averageLatencyMs: '45.2',
        queueDepth: 5,
        activeWorkers: 3,
        circuitState: 'closed' as const,
      }

      mockUseQuery.mockReturnValue({
        data: { rpcProxyMetrics: mockMetrics },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useRPCProxyMetrics())

      expect(result.current.metrics).toEqual(mockMetrics)
      expect(result.current.loading).toBe(false)
    })

    it('should return undefined metrics when no data', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useRPCProxyMetrics())

      expect(result.current.metrics).toBeUndefined()
    })

    it('should return error state', () => {
      const mockError = new Error('Metrics unavailable')

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useRPCProxyMetrics())

      expect(result.current.error).toEqual(mockError)
    })

    it('should expose refetch function', () => {
      const mockRefetch = vi.fn()

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: mockRefetch,
      })

      const { result } = renderHook(() => useRPCProxyMetrics())

      expect(result.current.refetch).toBe(mockRefetch)
    })
  })
})

// ---------------------------------------------------------------------------
// useTokenBalance
// ---------------------------------------------------------------------------

describe('useTokenBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('query configuration', () => {
    it('should call useContractCall with balanceOf and wallet param', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
      })

      renderHook(() => useTokenBalance('0xToken', '0xWallet'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'CONTRACT_CALL',
        expect.objectContaining({
          variables: {
            address: '0xToken',
            method: 'balanceOf',
            params: JSON.stringify(['0xWallet']),
            abi: undefined,
          },
        })
      )
    })
  })

  describe('BigInt conversion', () => {
    it('should convert decoded result to BigInt', () => {
      mockUseQuery.mockReturnValue({
        data: {
          contractCall: {
            result: '"1000000000000000000"',
            rawResult: '0x0de0b6b3a7640000',
            decoded: true,
          },
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useTokenBalance('0xToken', '0xWallet'))

      expect(result.current.balance).toBe(BigInt('1000000000000000000'))
      expect(result.current.rawResult).toBe('0x0de0b6b3a7640000')
    })

    it('should return null balance when not decoded', () => {
      mockUseQuery.mockReturnValue({
        data: {
          contractCall: {
            result: '"1000"',
            rawResult: '0x03e8',
            decoded: false,
          },
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useTokenBalance('0xToken', '0xWallet'))

      expect(result.current.balance).toBeNull()
    })

    it('should return null balance when result is null', () => {
      mockUseQuery.mockReturnValue({
        data: {
          contractCall: {
            result: null,
            rawResult: '0x',
            decoded: true,
          },
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useTokenBalance('0xToken', '0xWallet'))

      expect(result.current.balance).toBeNull()
    })

    it('should return null balance when no data', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useTokenBalance('0xToken', '0xWallet'))

      expect(result.current.balance).toBeNull()
    })
  })

  describe('return values', () => {
    it('should return loading and error states', () => {
      const mockError = new Error('Balance fetch failed')

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: vi.fn(),
      })

      const { result } = renderHook(() => useTokenBalance('0xToken', '0xWallet'))

      expect(result.current.error).toEqual(mockError)
      expect(result.current.loading).toBe(false)
    })

    it('should expose refetch function', () => {
      const mockRefetch = vi.fn()

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: mockRefetch,
      })

      const { result } = renderHook(() => useTokenBalance('0xToken', '0xWallet'))

      expect(result.current.refetch).toBe(mockRefetch)
    })
  })
})

// ---------------------------------------------------------------------------
// useNativeBalance
// ---------------------------------------------------------------------------

describe('useNativeBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('query configuration', () => {
    it('should call useQuery with GET_LIVE_BALANCE and address', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useNativeBalance('0xAddr'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'GET_LIVE_BALANCE',
        expect.objectContaining({
          variables: { address: '0xAddr', blockNumber: null },
          skip: false,
          errorPolicy: 'all',
          notifyOnNetworkStatusChange: false,
        })
      )
    })

    it('should pass blockNumber variable when provided', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useNativeBalance('0xAddr', '12345'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'GET_LIVE_BALANCE',
        expect.objectContaining({
          variables: { address: '0xAddr', blockNumber: '12345' },
        })
      )
    })

    it('should include pollInterval when provided', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useNativeBalance('0xAddr', undefined, 2000))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'GET_LIVE_BALANCE',
        expect.objectContaining({ pollInterval: 2000 })
      )
    })

    it('should not include pollInterval when omitted', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useNativeBalance('0xAddr'))

      const callArgs = mockUseQuery.mock.calls[0]![1] as Record<string, unknown>
      expect(callArgs).not.toHaveProperty('pollInterval')
    })
  })

  describe('skip behavior', () => {
    it('should skip when address is null', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useNativeBalance(null))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          variables: { address: '', blockNumber: null },
          skip: true,
        })
      )
    })
  })

  describe('BigInt conversion', () => {
    it('should convert balance string to BigInt', () => {
      mockUseQuery.mockReturnValue({
        data: {
          liveBalance: {
            address: '0xAddr',
            balance: '5000000000000000000',
            blockNumber: '100',
          },
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      const { result } = renderHook(() => useNativeBalance('0xAddr'))

      expect(result.current.balance).toBe(BigInt('5000000000000000000'))
      expect(result.current.rawBalance).toBe('5000000000000000000')
    })

    it('should return null balance when no data', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      const { result } = renderHook(() => useNativeBalance('0xAddr'))

      expect(result.current.balance).toBeNull()
      expect(result.current.rawBalance).toBeNull()
    })
  })

  describe('previousData fallback', () => {
    it('should use previousData while loading new data', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: {
          liveBalance: {
            address: '0xAddr',
            balance: '2000000000000000000',
            blockNumber: '99',
          },
        },
      })

      const { result } = renderHook(() => useNativeBalance('0xAddr'))

      expect(result.current.balance).toBe(BigInt('2000000000000000000'))
      expect(result.current.rawBalance).toBe('2000000000000000000')
      expect(result.current.loading).toBe(true)
    })

    it('should prefer fresh data over previousData', () => {
      mockUseQuery.mockReturnValue({
        data: {
          liveBalance: {
            address: '0xAddr',
            balance: '3000000000000000000',
            blockNumber: '101',
          },
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: {
          liveBalance: {
            address: '0xAddr',
            balance: '2000000000000000000',
            blockNumber: '99',
          },
        },
      })

      const { result } = renderHook(() => useNativeBalance('0xAddr'))

      expect(result.current.balance).toBe(BigInt('3000000000000000000'))
      expect(result.current.rawBalance).toBe('3000000000000000000')
    })
  })

  describe('return values', () => {
    it('should return error state', () => {
      const mockError = new Error('RPC error')

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: vi.fn(),
        previousData: null,
      })

      const { result } = renderHook(() => useNativeBalance('0xAddr'))

      expect(result.current.error).toEqual(mockError)
    })

    it('should expose refetch function', () => {
      const mockRefetch = vi.fn()

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: mockRefetch,
        previousData: null,
      })

      const { result } = renderHook(() => useNativeBalance('0xAddr'))

      expect(result.current.refetch).toBe(mockRefetch)
    })
  })
})
