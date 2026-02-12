/**
 * ERC721 NFT Transfer Hooks
 * Hooks for ERC721 token transfer and ownership tracking
 */

import { useQuery } from '@apollo/client'
import {
  GET_ERC721_TRANSFER,
  GET_ERC721_TRANSFERS_BY_TOKEN,
  GET_ERC721_TRANSFERS_BY_ADDRESS,
  GET_ERC721_OWNER,
} from '@/lib/graphql/queries/address-indexing'
import type {
  ERC721Transfer,
  ERC721TransferFilter,
  ERC721Owner,
  PaginationInput,
  RawERC721Transfer,
  RawERC721Owner,
} from '@/types/address-indexing'
import {
  isAddressIndexingNotSupportedError,
  filterAddressIndexingError,
  createLoadMore,
} from '@/lib/utils/address-indexing'

// ============================================================================
// Transform Functions
// ============================================================================

function transformERC721Transfer(raw: RawERC721Transfer): ERC721Transfer {
  return {
    transactionHash: raw.transactionHash,
    logIndex: raw.logIndex,
    contractAddress: raw.contractAddress,
    from: raw.from,
    to: raw.to,
    tokenId: BigInt(raw.tokenId),
    blockNumber: BigInt(raw.blockNumber),
    timestamp: BigInt(raw.timestamp),
  }
}

function transformERC721Owner(raw: RawERC721Owner): ERC721Owner {
  return {
    tokenAddress: raw.tokenAddress,
    tokenId: BigInt(raw.tokenId),
    owner: raw.owner,
  }
}

// ============================================================================
// Hooks
// ============================================================================

export function useERC721Transfer(transactionHash: string, logIndex: number) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_ERC721_TRANSFER, {
    variables: { transactionHash, logIndex },
    skip: !transactionHash || logIndex === undefined,
    returnPartialData: true,
  })

  const rawData = data?.erc721Transfer || previousData?.erc721Transfer
  const erc721Transfer = rawData ? transformERC721Transfer(rawData) : null

  return {
    erc721Transfer,
    loading,
    error,
    refetch,
  }
}

export function useERC721TransfersByToken(
  tokenAddress: string,
  filter?: ERC721TransferFilter,
  pagination?: PaginationInput
) {
  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(
    GET_ERC721_TRANSFERS_BY_TOKEN,
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

  const rawData = data?.erc721TransfersByToken || previousData?.erc721TransfersByToken
  const erc721Transfers = rawData?.nodes?.map(transformERC721Transfer) || []
  const totalCount = rawData?.totalCount || 0
  const pageInfo = rawData?.pageInfo || { hasNextPage: false, hasPreviousPage: false }

  return {
    erc721Transfers,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    loadMore: createLoadMore(fetchMore, pageInfo, pagination),
  }
}

export function useERC721TransfersByAddress(
  address: string,
  isFrom: boolean = true,
  pagination?: PaginationInput
) {
  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(
    GET_ERC721_TRANSFERS_BY_ADDRESS,
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

  const rawData = data?.erc721TransfersByAddress || previousData?.erc721TransfersByAddress
  const erc721Transfers = rawData?.nodes?.map(transformERC721Transfer) || []
  const totalCount = rawData?.totalCount || 0
  const pageInfo = rawData?.pageInfo || { hasNextPage: false, hasPreviousPage: false }

  return {
    erc721Transfers,
    totalCount,
    pageInfo,
    loading,
    error: filterAddressIndexingError(error),
    refetch,
    loadMore: createLoadMore(fetchMore, pageInfo, pagination),
    isFeatureAvailable: !isAddressIndexingNotSupportedError(error),
  }
}

export function useERC721Owner(tokenAddress: string, tokenId: bigint) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_ERC721_OWNER, {
    variables: {
      tokenAddress,
      tokenId: tokenId.toString(),
    },
    skip: !tokenAddress || tokenId === undefined,
    returnPartialData: true,
  })

  const rawData = data?.erc721Owner || previousData?.erc721Owner
  const erc721Owner = rawData ? transformERC721Owner(rawData) : null

  return {
    erc721Owner,
    loading,
    error,
    refetch,
  }
}
