import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBlock } from './useBlock'

// Mock Apollo Client
const mockUseQuery = vi.fn()
vi.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  gql: (strings: TemplateStringsArray) => strings.join(''),
}))

// Mock queries
vi.mock('@/lib/apollo/queries', () => ({
  GET_BLOCK: 'GET_BLOCK',
  GET_BLOCK_BY_HASH: 'GET_BLOCK_BY_HASH',
}))

describe('useBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('query selection', () => {
    it('should use GET_BLOCK for block number', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useBlock(BigInt(12345)))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'GET_BLOCK',
        expect.objectContaining({
          variables: { number: '12345' },
          skip: false,
        })
      )
    })

    it('should use GET_BLOCK_BY_HASH for hash string', () => {
      const hash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useBlock(hash))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'GET_BLOCK_BY_HASH',
        expect.objectContaining({
          variables: { hash },
          skip: false,
        })
      )
    })

    it('should use GET_BLOCK for string number', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useBlock('12345'))

      expect(mockUseQuery).toHaveBeenCalledWith(
        'GET_BLOCK',
        expect.objectContaining({
          variables: { number: '12345' },
        })
      )
    })
  })

  describe('skip behavior', () => {
    it('should skip query when numberOrHash is null', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useBlock(null))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          skip: true,
        })
      )
    })

    it('should not skip query when numberOrHash is provided', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      renderHook(() => useBlock(BigInt(100)))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          skip: false,
        })
      )
    })
  })

  describe('return values', () => {
    it('should return block data from query response', () => {
      const mockBlock = {
        number: '12345',
        hash: '0xabc123',
        timestamp: '1234567890',
        miner: '0x123',
        transactionCount: 10,
      }

      mockUseQuery.mockReturnValue({
        data: { block: mockBlock },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      const { result } = renderHook(() => useBlock(BigInt(12345)))

      expect(result.current.block).toEqual(mockBlock)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeUndefined()
    })

    it('should return blockByHash for hash queries', () => {
      const mockBlock = {
        number: '12345',
        hash: '0xabcdef123',
        timestamp: '1234567890',
      }

      mockUseQuery.mockReturnValue({
        data: { blockByHash: mockBlock },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
        previousData: null,
      })

      const { result } = renderHook(() => useBlock('0xabcdef123'))

      expect(result.current.block).toEqual(mockBlock)
    })

    it('should use previousData while loading', () => {
      const previousBlock = {
        number: '12345',
        hash: '0xprevious',
      }

      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
        previousData: { block: previousBlock },
      })

      const { result } = renderHook(() => useBlock(BigInt(12345)))

      expect(result.current.block).toEqual(previousBlock)
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

      const { result } = renderHook(() => useBlock(BigInt(100)))

      expect(result.current.loading).toBe(true)
      expect(result.current.block).toBeUndefined()
    })

    it('should return error state', () => {
      const mockError = new Error('GraphQL error')

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: vi.fn(),
        previousData: null,
      })

      const { result } = renderHook(() => useBlock(BigInt(100)))

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

      const { result } = renderHook(() => useBlock(BigInt(100)))

      expect(result.current.refetch).toBe(mockRefetch)
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

      renderHook(() => useBlock(BigInt(100)))

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          returnPartialData: true,
        })
      )
    })
  })
})
