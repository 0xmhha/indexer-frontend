'use client'

import { useQuery } from '@apollo/client'
import { GET_BALANCE_HISTORY } from '@/lib/apollo/queries'
import {
  transformBalanceSnapshot,
  type TransformedBalanceSnapshot,
} from '@/lib/utils/graphql-transforms'
import { PAGINATION } from '@/lib/config/constants'

interface RawBalanceHistoryNode {
  blockNumber: string
  balance: string
  delta: string
  transactionHash: string | null
}

interface BalanceHistoryOptions {
  address: string
  fromBlock: bigint
  toBlock: bigint
  limit?: number
  offset?: number
}

interface BalanceHistoryResult {
  snapshots: TransformedBalanceSnapshot[]
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  loading: boolean
  error: Error | undefined
}

/**
 * Hook to fetch balance history for an address
 *
 * @example
 * ```tsx
 * const { snapshots, loading, error } = useBalanceHistory({
 *   address: '0x...',
 *   fromBlock: 0n,
 *   toBlock: 1000n,
 *   limit: 100
 * })
 * ```
 */
export function useBalanceHistory(options: BalanceHistoryOptions): BalanceHistoryResult {
  const { address, fromBlock, toBlock, limit = PAGINATION.BALANCE_HISTORY_LIMIT, offset = 0 } = options

  const { data, loading, error } = useQuery(GET_BALANCE_HISTORY, {
    variables: {
      address,
      fromBlock: fromBlock.toString(),
      toBlock: toBlock.toString(),
      limit,
      offset,
    },
    skip: !address || fromBlock < 0n || toBlock < 0n,
  })

  const rawNodes: RawBalanceHistoryNode[] = data?.balanceHistory?.nodes ?? []
  const snapshots = rawNodes.map(transformBalanceSnapshot)
  const totalCount = data?.balanceHistory?.totalCount ?? 0
  const hasNextPage = data?.balanceHistory?.pageInfo?.hasNextPage ?? false
  const hasPreviousPage = data?.balanceHistory?.pageInfo?.hasPreviousPage ?? false

  return {
    snapshots,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    loading,
    error,
  }
}
