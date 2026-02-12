/**
 * Shared utilities for address indexing hooks (ERC20/ERC721)
 */

import type { ApolloError } from '@apollo/client'
import type { PaginationInput } from '@/types/address-indexing'
import { PAGINATION } from '@/lib/config/constants'

/**
 * Check if error indicates address indexing is not supported by the backend
 */
export function isAddressIndexingNotSupportedError(error: ApolloError | undefined): boolean {
  if (!error) {return false}
  return error.message.includes('does not support address indexing')
}

/**
 * Filter out address indexing "not supported" errors (expected when feature is disabled)
 */
export function filterAddressIndexingError(error: ApolloError | undefined): ApolloError | undefined {
  if (isAddressIndexingNotSupportedError(error)) {
    return undefined
  }
  return error
}

/**
 * Create a loadMore function for paginated token transfer queries
 */
export function createLoadMore(
  fetchMore: (options: { variables: { pagination: PaginationInput } }) => Promise<unknown>,
  pageInfo: { hasNextPage: boolean },
  pagination?: PaginationInput
) {
  return () => {
    if (!pageInfo.hasNextPage) {return}

    return fetchMore({
      variables: {
        pagination: {
          limit: pagination?.limit || PAGINATION.DEFAULT_PAGE_SIZE,
          offset: (pagination?.offset || 0) + (pagination?.limit || PAGINATION.DEFAULT_PAGE_SIZE),
        },
      },
    })
  }
}
