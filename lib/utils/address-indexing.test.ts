import { describe, it, expect, vi } from 'vitest'
import {
  isAddressIndexingNotSupportedError,
  filterAddressIndexingError,
  createLoadMore,
} from '@/lib/utils/address-indexing'
import type { ApolloError } from '@apollo/client'

/**
 * Helper to create a minimal ApolloError-like object for testing
 */
function makeApolloError(message: string): ApolloError {
  return {
    message,
    graphQLErrors: [],
    protocolErrors: [],
    clientErrors: [],
    networkError: null,
    extraInfo: undefined,
    name: 'ApolloError',
    cause: undefined,
  } as unknown as ApolloError
}

describe('isAddressIndexingNotSupportedError', () => {
  it('returns true when error message contains the not-supported string', () => {
    const error = makeApolloError('This backend does not support address indexing at this time')
    expect(isAddressIndexingNotSupportedError(error)).toBe(true)
  })

  it('returns false for a generic error message', () => {
    const error = makeApolloError('Network error occurred')
    expect(isAddressIndexingNotSupportedError(error)).toBe(false)
  })

  it('returns false for undefined error', () => {
    expect(isAddressIndexingNotSupportedError(undefined)).toBe(false)
  })
})

describe('filterAddressIndexingError', () => {
  it('returns undefined when error is the address-indexing-not-supported type', () => {
    const error = makeApolloError('does not support address indexing')
    expect(filterAddressIndexingError(error)).toBeUndefined()
  })

  it('passes through other errors unchanged', () => {
    const error = makeApolloError('Some other failure')
    expect(filterAddressIndexingError(error)).toBe(error)
  })

  it('returns undefined when error is undefined', () => {
    expect(filterAddressIndexingError(undefined)).toBeUndefined()
  })
})

describe('createLoadMore', () => {
  it('returns a function', () => {
    const fetchMore = vi.fn().mockResolvedValue({})
    const loadMore = createLoadMore(fetchMore, { hasNextPage: true })
    expect(typeof loadMore).toBe('function')
  })

  it('does not call fetchMore when hasNextPage is false', () => {
    const fetchMore = vi.fn().mockResolvedValue({})
    const loadMore = createLoadMore(fetchMore, { hasNextPage: false })
    loadMore()
    expect(fetchMore).not.toHaveBeenCalled()
  })

  it('calls fetchMore with default pagination when no pagination provided', () => {
    const fetchMore = vi.fn().mockResolvedValue({})
    const loadMore = createLoadMore(fetchMore, { hasNextPage: true })
    loadMore()

    expect(fetchMore).toHaveBeenCalledWith({
      variables: {
        pagination: {
          limit: 20, // PAGINATION.DEFAULT_PAGE_SIZE
          offset: 20, // 0 + 20
        },
      },
    })
  })

  it('calculates next offset from current pagination', () => {
    const fetchMore = vi.fn().mockResolvedValue({})
    const loadMore = createLoadMore(fetchMore, { hasNextPage: true }, { limit: 10, offset: 30 })
    loadMore()

    expect(fetchMore).toHaveBeenCalledWith({
      variables: {
        pagination: {
          limit: 10,
          offset: 40, // 30 + 10
        },
      },
    })
  })

  it('returns the promise from fetchMore when called', () => {
    const mockResult = { data: { items: [] } }
    const fetchMore = vi.fn().mockResolvedValue(mockResult)
    const loadMore = createLoadMore(fetchMore, { hasNextPage: true })
    const result = loadMore()
    expect(result).toBeInstanceOf(Promise)
  })

  it('returns undefined when hasNextPage is false', () => {
    const fetchMore = vi.fn().mockResolvedValue({})
    const loadMore = createLoadMore(fetchMore, { hasNextPage: false })
    const result = loadMore()
    expect(result).toBeUndefined()
  })
})
