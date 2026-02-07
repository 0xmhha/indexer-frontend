import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTransaction } from './useTransaction'

// Mock Apollo Client
const mockUseQuery = vi.fn()
vi.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}))

// Mock queries
vi.mock('@/lib/apollo/queries', () => ({
  GET_TRANSACTION: 'GET_TRANSACTION',
}))

describe('useTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('query behavior', () => {
    it('should query with provided hash', () => {
      const hash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useTransaction(hash))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'GET_TRANSACTION',
        expect.objectContaining({
          variables: { hash },
          skip: false,
        })
      )
    })

    it('should use empty string when hash is null', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useTransaction(null))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'GET_TRANSACTION',
        expect.objectContaining({
          variables: { hash: '' },
        })
      )
    })
  })

  describe('skip behavior', () => {
    it('should skip query when hash is null', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useTransaction(null))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          skip: true,
        })
      )
    })

    it('should not skip query when hash is provided', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useTransaction('0xabc123'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          skip: false,
        })
      )
    })
  })

  describe('return values', () => {
    it('should return transaction data from query response', () => {
      const mockTransaction = {
        hash: '0xabc123',
        blockNumber: '12345',
        from: '0xsender',
        to: '0xreceiver',
        value: '1000000000000000000',
        gas: '21000',
        type: 2,
        receipt: {
          status: '0x1',
          gasUsed: '21000',
        },
      }

      mockUseQuery.mockReturnValue({
        data: { transaction: mockTransaction },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      const { result } = renderHook(() => useTransaction('0xabc123'))

      expect(result.current.transaction).toEqual(mockTransaction)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeUndefined()
    })

    it('should use previousData while loading', () => {
      const previousTransaction = {
        hash: '0xprevious',
        blockNumber: '12344',
      }

      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: { transaction: previousTransaction },
      })

      const { result } = renderHook(() => useTransaction('0xabc123'))

      expect(result.current.transaction).toEqual(previousTransaction)
      expect(result.current.loading).toBe(true)
    })

    it('should return loading state', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      const { result } = renderHook(() => useTransaction('0xabc123'))

      expect(result.current.loading).toBe(true)
      expect(result.current.transaction).toBeUndefined()
    })

    it('should return error state', () => {
      const mockError = new Error('Transaction not found')

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: vi.fn(),
        previousData: null,
      })

      const { result } = renderHook(() => useTransaction('0xabc123'))

      expect(result.current.error).toEqual(mockError)
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

      const { result } = renderHook(() => useTransaction('0xabc123'))

      expect(result.current.refetch).toBe(mockRefetch)
    })

    it('should return undefined transaction when data is not available', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      const { result } = renderHook(() => useTransaction('0xabc123'))

      expect(result.current.transaction).toBeUndefined()
    })
  })

  describe('query options', () => {
    it('should enable returnPartialData', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useTransaction('0xabc123'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          returnPartialData: true,
        })
      )
    })
  })
})
