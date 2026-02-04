'use client'

/**
 * Contracts List Hook
 *
 * Custom hook for fetching the list of all deployed contracts
 */

import { useQuery } from '@apollo/client'
import { GET_CONTRACTS } from '@/lib/graphql/queries/address-indexing'
import type { ContractCreation, RawContractCreation, PageInfo } from '@/types/address-indexing'

// ============================================================================
// Types
// ============================================================================

interface ContractsConnection {
  nodes: RawContractCreation[]
  totalCount: number
  pageInfo: PageInfo
}

interface UseContractsOptions {
  limit?: number
  offset?: number
}

interface UseContractsResult {
  contracts: ContractCreation[]
  totalCount: number
  pageInfo: PageInfo
  loading: boolean
  error: Error | null
  refetch: () => void
}

// ============================================================================
// Transform Function
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

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to fetch the list of all deployed contracts
 *
 * @param options - Pagination options (limit, offset)
 * @returns Contracts list with loading/error states
 */
export function useContracts({ limit = 20, offset = 0 }: UseContractsOptions = {}): UseContractsResult {
  const { data, loading, error, refetch, previousData } = useQuery<{
    contracts: ContractsConnection
  }>(GET_CONTRACTS, {
    variables: {
      pagination: { limit, offset }
    },
    fetchPolicy: 'cache-and-network',
    returnPartialData: true,
    notifyOnNetworkStatusChange: false,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  const rawContracts = effectiveData?.contracts?.nodes ?? []
  const contracts = rawContracts.map(transformContractCreation)
  const totalCount = effectiveData?.contracts?.totalCount ?? 0
  const pageInfo = effectiveData?.contracts?.pageInfo ?? {
    hasNextPage: false,
    hasPreviousPage: false,
  }

  return {
    contracts,
    totalCount,
    pageInfo,
    loading: loading && contracts.length === 0,
    error: error ?? null,
    refetch,
  }
}
