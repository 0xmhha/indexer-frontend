/**
 * Address Indexing React Hooks
 *
 * Custom hooks for contract creation tracking, internal transactions,
 * and ERC20/ERC721 token transfers
 *
 * Note: These features require address indexing to be enabled on the backend.
 * If not enabled, queries will return empty data gracefully.
 */

import { useQuery, type ApolloError } from '@apollo/client'
import {
  GET_CONTRACT_CREATION,
  GET_CONTRACTS_BY_CREATOR,
  GET_INTERNAL_TRANSACTIONS_BY_ADDRESS,
  GET_ERC20_TRANSFER,
  GET_ERC20_TRANSFERS_BY_TOKEN,
  GET_ERC20_TRANSFERS_BY_ADDRESS,
  GET_ERC721_TRANSFER,
  GET_ERC721_TRANSFERS_BY_TOKEN,
  GET_ERC721_TRANSFERS_BY_ADDRESS,
  GET_ERC721_OWNER,
} from '@/lib/graphql/queries/address-indexing'
import type {
  ContractCreation,
  InternalTransaction,
  ERC20Transfer,
  ERC20TransferFilter,
  ERC721Transfer,
  ERC721TransferFilter,
  ERC721Owner,
  PaginationInput,
  RawContractCreation,
  RawInternalTransaction,
  RawERC20Transfer,
  RawERC721Transfer,
  RawERC721Owner,
} from '@/types/address-indexing'
import { PAGINATION } from '@/lib/config/constants'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if error is due to address indexing not being supported
 * This is a known limitation when the backend doesn't have address indexing enabled
 */
function isAddressIndexingNotSupportedError(error: ApolloError | undefined): boolean {
  if (!error) {return false}
  return error.message.includes('does not support address indexing')
}

/**
 * Filter out address indexing errors from being treated as real errors
 * Returns undefined if the error is just about address indexing not being supported
 */
function filterAddressIndexingError(error: ApolloError | undefined): ApolloError | undefined {
  if (isAddressIndexingNotSupportedError(error)) {
    return undefined
  }
  return error
}

// ============================================================================
// Transform Functions (GraphQL string → TypeScript bigint)
// ============================================================================

function transformContractCreation(raw: RawContractCreation): ContractCreation {
  return {
    contractAddress: raw.contractAddress,
    creator: raw.creator,
    transactionHash: raw.transactionHash,
    blockNumber: BigInt(raw.blockNumber),
    timestamp: BigInt(raw.timestamp),
  }
}

function transformInternalTransaction(raw: RawInternalTransaction): InternalTransaction {
  return {
    transactionHash: raw.transactionHash,
    type: raw.type,
    from: raw.from,
    to: raw.to,
    value: BigInt(raw.value),
    input: raw.input,
    output: raw.output,
    error: raw.error,
    blockNumber: BigInt(raw.blockNumber),
  }
}

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
// Contract Creation Hooks
// ============================================================================

export function useContractCreation(address: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_CONTRACT_CREATION, {
    variables: { address },
    skip: !address,
    returnPartialData: true,
    // Don't log errors for address indexing not supported
    errorPolicy: 'all',
  })

  const rawData = data?.contractCreation || previousData?.contractCreation
  const contractCreation = rawData ? transformContractCreation(rawData) : null

  return {
    contractCreation,
    loading,
    // Filter out "address indexing not supported" errors
    error: filterAddressIndexingError(error),
    refetch,
    // Flag to indicate if feature is available
    isFeatureAvailable: !isAddressIndexingNotSupportedError(error),
  }
}

export function useContractsByCreator(
  creator: string,
  pagination?: PaginationInput
) {
  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(
    GET_CONTRACTS_BY_CREATOR,
    {
      variables: {
        creator,
        pagination,
      },
      skip: !creator,
      returnPartialData: true,
      // Don't log errors for address indexing not supported
      errorPolicy: 'all',
    }
  )

  const rawData = data?.contractsByCreator || previousData?.contractsByCreator
  const contracts = rawData?.nodes?.map(transformContractCreation) || []
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
    contracts,
    totalCount,
    pageInfo,
    loading,
    // Filter out "address indexing not supported" errors
    error: filterAddressIndexingError(error),
    refetch,
    loadMore,
    // Flag to indicate if feature is available
    isFeatureAvailable: !isAddressIndexingNotSupportedError(error),
  }
}

// ============================================================================
// Internal Transactions Hooks
// ============================================================================

/**
 * Fetch internal transactions by address
 * @param address - The address to query
 * @param isFrom - true to get transactions FROM this address, false to get transactions TO this address
 * @param pagination - Pagination options (limit, offset)
 */
export function useInternalTransactionsByAddress(
  address: string,
  isFrom: boolean = true,
  pagination?: PaginationInput
) {
  const { data, loading, error, refetch, fetchMore, previousData } = useQuery(
    GET_INTERNAL_TRANSACTIONS_BY_ADDRESS,
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

  const rawData =
    data?.internalTransactionsByAddress || previousData?.internalTransactionsByAddress
  const internalTransactions = rawData?.nodes?.map(transformInternalTransaction) || []
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
    internalTransactions,
    totalCount,
    pageInfo,
    loading,
    // Filter out "address indexing not supported" errors
    error: filterAddressIndexingError(error),
    refetch,
    loadMore,
    // Flag to indicate if feature is available
    isFeatureAvailable: !isAddressIndexingNotSupportedError(error),
  }
}

// ============================================================================
// ERC20 Token Transfer Hooks
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

/**
 * Fetch ERC20 transfers by address
 * @param address - The address to query
 * @param isFrom - true to get transfers FROM this address, false to get transfers TO this address
 * @param pagination - Pagination options (limit, offset)
 */
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
    // Filter out "address indexing not supported" errors
    error: filterAddressIndexingError(error),
    refetch,
    loadMore,
    // Flag to indicate if feature is available
    isFeatureAvailable: !isAddressIndexingNotSupportedError(error),
  }
}

// ============================================================================
// ERC721 NFT Transfer Hooks
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
    erc721Transfers,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    loadMore,
  }
}

/**
 * Fetch ERC721 transfers by address
 * @param address - The address to query
 * @param isFrom - true to get transfers FROM this address, false to get transfers TO this address
 * @param pagination - Pagination options (limit, offset)
 */
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
    erc721Transfers,
    totalCount,
    pageInfo,
    loading,
    // Filter out "address indexing not supported" errors
    error: filterAddressIndexingError(error),
    refetch,
    loadMore,
    // Flag to indicate if feature is available
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
