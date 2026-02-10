/**
 * Contract Creation & Internal Transaction Hooks
 * Hooks for contract creation tracking and internal transactions
 */

import { useQuery, type ApolloError } from '@apollo/client'
import {
  GET_CONTRACT_CREATION,
  GET_CONTRACTS_BY_CREATOR,
  GET_INTERNAL_TRANSACTIONS_BY_ADDRESS,
} from '@/lib/graphql/queries/address-indexing'
import type {
  ContractCreation,
  InternalTransaction,
  PaginationInput,
  RawContractCreation,
  RawInternalTransaction,
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

function transformContractCreation(raw: RawContractCreation): ContractCreation {
  return {
    contractAddress: raw.contractAddress,
    name: raw.name,
    creator: raw.creator,
    transactionHash: raw.transactionHash,
    blockNumber: BigInt(raw.blockNumber),
    timestamp: BigInt(raw.timestamp),
    bytecodeSize: raw.bytecodeSize,
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

// ============================================================================
// Contract Creation Hooks
// ============================================================================

export function useContractCreation(address: string) {
  const { data, loading, error, refetch, previousData } = useQuery(GET_CONTRACT_CREATION, {
    variables: { address },
    skip: !address,
    returnPartialData: true,
    errorPolicy: 'all',
  })

  const rawData = data?.contractCreation || previousData?.contractCreation
  const contractCreation = rawData ? transformContractCreation(rawData) : null

  return {
    contractCreation,
    loading,
    error: filterAddressIndexingError(error),
    refetch,
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
    error: filterAddressIndexingError(error),
    refetch,
    loadMore,
    isFeatureAvailable: !isAddressIndexingNotSupportedError(error),
  }
}

// ============================================================================
// Internal Transactions Hooks
// ============================================================================

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
    error: filterAddressIndexingError(error),
    refetch,
    loadMore,
    isFeatureAvailable: !isAddressIndexingNotSupportedError(error),
  }
}
