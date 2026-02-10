/**
 * ERC20 Token Transfer Hooks
 * Hooks for ERC20 token transfer tracking
 */

import { useQuery, type ApolloError } from '@apollo/client'
import {
  GET_ERC20_TRANSFER,
  GET_ERC20_TRANSFERS_BY_TOKEN,
  GET_ERC20_TRANSFERS_BY_ADDRESS,
} from '@/lib/graphql/queries/address-indexing'
import type {
  ERC20Transfer,
  ERC20TransferFilter,
  PaginationInput,
  RawERC20Transfer,
} from '@/types/address-indexing'
import { PAGINATION } from '@/lib/config/constants'

// ============================================================================
// Helper Functions
// ============================================================================

function isAddressIndexingNotSupportedError(error: ApolloError | undefined): boolean {
  if (!error) {return false}
  return error.message.includes('does not support address indexing')
}

function filterAddressIndexingError(error: ApolloError | undefined): ApolloError | undefined {
  if (isAddressIndexingNotSupportedError(error)) {
    return undefined
  }
  return error
}

// ============================================================================
// Transform Functions
// ============================================================================

function transformERC20Transfer(raw: RawERC20Transfer): ERC20Transfer {
  return {
    transactionHash: raw.transactionHash,
    logIndex: raw.logIndex,
    contractAddress: raw.contractAddress,
    from: raw.from,
    to: raw.to,
    value: BigInt(raw.value),
    blockNumber: BigInt(raw.blockNumber),
    timestamp: BigInt(raw.timestamp),
  }
}

// ============================================================================
// Hooks
// ============================================================================

export function useERC20Transfer(transactionHash: string, logIndex: number) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_ERC20_TRANSFER, {
    variables: { transactionHash, logIndex },
    skip: !transactionHash || logIndex === undefined,
    returnPartialData: true,
  })

  const rawData = data?.erc20Transfer || previousData?.erc20Transfer
  const erc20Transfer = rawData ? transformERC20Transfer(rawData) : null

  return {
    erc20Transfer,
    loading,
    error,
    refetch,
  }
}

export function useERC20TransfersByToken(
  tokenAddress: string,
  filter?: ERC20TransferFilter,
  pagination?: PaginationInput
) {
  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(
    GET_ERC20_TRANSFERS_BY_TOKEN,
    {
      variables: {
        tokenAddress,
        filter,
        pagination,
      },
      skip: !tokenAddress,
      returnPartialData: true,
    }
  )

  const rawData = data?.erc20TransfersByToken || previousData?.erc20TransfersByToken
  const erc20Transfers = rawData?.nodes?.map(transformERC20Transfer) || []
  const totalCount = rawData?.totalCount || 0
  const pageInfo = rawData?.pageInfo || { hasNextPage: false, hasPreviousPage: false }

  const loadMore = () => {
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

  return {
    erc20Transfers,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    loadMore,
  }
}

export function useERC20TransfersByAddress(
  address: string,
  isFrom: boolean = true,
  pagination?: PaginationInput
) {
  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(
    GET_ERC20_TRANSFERS_BY_ADDRESS,
    {
      variables: {
        address,
        isFrom,
        pagination,
      },
      skip: !address,
      returnPartialData: true,
      errorPolicy: 'all',
    }
  )

  const rawData = data?.erc20TransfersByAddress || previousData?.erc20TransfersByAddress
  const erc20Transfers = rawData?.nodes?.map(transformERC20Transfer) || []
  const totalCount = rawData?.totalCount || 0
  const pageInfo = rawData?.pageInfo || { hasNextPage: false, hasPreviousPage: false }

  const loadMore = () => {
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

  return {
    erc20Transfers,
    totalCount,
    pageInfo,
    loading,
    error: filterAddressIndexingError(error),
    refetch,
    loadMore,
    isFeatureAvailable: !isAddressIndexingNotSupportedError(error),
  }
}
