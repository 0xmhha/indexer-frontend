'use client'

import { useQuery } from '@apollo/client'
import { GET_LOGS } from '@/lib/apollo/queries'
import type { RawLog, Log } from '@/types/graphql'

/**
 * Contract logs query result
 */
interface ContractLogsData {
  logs: {
    nodes: RawLog[]
    totalCount: number
  }
}

/**
 * Contract logs query variables
 */
interface ContractLogsVariables {
  address?: string | null
  topics?: string[] | null
  blockNumberFrom?: string | null
  blockNumberTo?: string | null
  limit: number
  offset: number
}

/**
 * Transform raw log data to typed Log
 */
function transformLog(raw: RawLog): Log {
  return {
    address: raw.address,
    topics: raw.topics,
    data: raw.data,
    blockNumber: BigInt(raw.blockNumber),
    blockHash: raw.blockHash ?? '',
    transactionHash: raw.transactionHash,
    transactionIndex: raw.transactionIndex ?? 0,
    logIndex: raw.logIndex,
    removed: raw.removed ?? false,
  }
}

/**
 * Hook to fetch historical contract logs with pagination
 *
 * @param address - Contract address to filter logs
 * @param options - Additional filter options
 * @returns Object containing logs array, totalCount, loading state, and error
 *
 * @example
 * ```tsx
 * const { logs, totalCount, loading, error } = useContractLogs('0x1000', {
 *   limit: 20,
 *   offset: 0,
 *   blockNumberFrom: '1000000',
 *   blockNumberTo: '2000000',
 * })
 * ```
 */
export function useContractLogs(
  address: string | null,
  options: {
    limit?: number
    offset?: number
    topics?: string[]
    blockNumberFrom?: string
    blockNumberTo?: string
  } = {}
) {
  const { limit = 20, offset = 0, topics, blockNumberFrom, blockNumberTo } = options

  const variables: ContractLogsVariables = {
    address: address ?? null,
    topics: topics ?? null,
    blockNumberFrom: blockNumberFrom ?? null,
    blockNumberTo: blockNumberTo ?? null,
    limit,
    offset,
  }

  const { data, loading, error, refetch, previousData } = useQuery<ContractLogsData>(GET_LOGS, {
    variables,
    skip: !address,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  })

  // Use previous data during loading to prevent flicker
  const effectiveData = data ?? previousData

  // Transform logs
  const logs: Log[] = effectiveData?.logs?.nodes?.map(transformLog) ?? []
  const totalCount = effectiveData?.logs?.totalCount ?? 0

  return {
    logs,
    totalCount,
    loading: loading && !effectiveData,
    error: error ?? null,
    refetch,
  }
}

/**
 * Hook to fetch logs for multiple addresses (e.g., for dashboards)
 */
export function useMultiAddressLogs(
  addresses: string[],
  options: {
    limit?: number
    blockNumberFrom?: string
    blockNumberTo?: string
  } = {}
) {
  // For now, this is a simple wrapper that could be extended
  // to support multiple address queries in parallel
  const { limit = 50, blockNumberFrom, blockNumberTo } = options

  const { data, loading, error } = useQuery<ContractLogsData>(GET_LOGS, {
    variables: {
      // Note: Backend may need to support addresses array
      address: addresses[0], // Use first address for now
      blockNumberFrom,
      blockNumberTo,
      limit,
      offset: 0,
    },
    skip: addresses.length === 0,
    fetchPolicy: 'cache-and-network',
  })

  const logs: Log[] = data?.logs?.nodes?.map(transformLog) ?? []

  return {
    logs,
    totalCount: data?.logs?.totalCount ?? 0,
    loading,
    error: error ?? null,
  }
}
