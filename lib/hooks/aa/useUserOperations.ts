/**
 * Hook to fetch paginated UserOperation list
 *
 * Routes to the correct backend query based on filter dimension:
 * - filter.sender  → GET_USER_OPS_BY_SENDER (paginated)
 * - filter.bundler → GET_USER_OPS_BY_BUNDLER (paginated)
 * - filter.paymaster → GET_USER_OPS_BY_PAYMASTER (paginated)
 * - no filter → GET_RECENT_USER_OPS (limit only)
 *
 * Status filtering (success/failed) is applied client-side.
 */

'use client'

import { useMemo } from 'react'
import { useQuery, type DocumentNode } from '@apollo/client'
import {
  GET_USER_OPS_BY_SENDER,
  GET_USER_OPS_BY_BUNDLER,
  GET_USER_OPS_BY_PAYMASTER,
  GET_RECENT_USER_OPS,
} from '@/lib/apollo/queries/aa'
import { transformUserOperationListItems } from '@/lib/utils/aa-transforms'
import type { UserOperationListItem, UserOpFilter, RawUserOperationListItem } from '@/types/aa'

interface UseUserOperationsOptions {
  limit?: number
  offset?: number
  filter?: UserOpFilter | undefined
}

interface UseUserOperationsResult {
  userOps: UserOperationListItem[]
  totalCount: number
  loading: boolean
  error: Error | null
}

interface QueryConfig {
  query: DocumentNode
  variables: Record<string, unknown>
  extractData: (data: Record<string, unknown>) => { nodes: RawUserOperationListItem[]; totalCount: number }
}

function getQueryConfig(filter: UserOpFilter | undefined, limit: number, offset: number): QueryConfig {
  if (filter?.sender) {
    return {
      query: GET_USER_OPS_BY_SENDER,
      variables: { sender: filter.sender, limit, offset },
      extractData: (data) => {
        const result = data.userOpsBySender as { nodes: RawUserOperationListItem[]; totalCount: number }
        return { nodes: result.nodes, totalCount: result.totalCount }
      },
    }
  }

  if (filter?.bundler) {
    return {
      query: GET_USER_OPS_BY_BUNDLER,
      variables: { bundler: filter.bundler, limit, offset },
      extractData: (data) => {
        const result = data.userOpsByBundler as { nodes: RawUserOperationListItem[]; totalCount: number }
        return { nodes: result.nodes, totalCount: result.totalCount }
      },
    }
  }

  if (filter?.paymaster) {
    return {
      query: GET_USER_OPS_BY_PAYMASTER,
      variables: { paymaster: filter.paymaster, limit, offset },
      extractData: (data) => {
        const result = data.userOpsByPaymaster as { nodes: RawUserOperationListItem[]; totalCount: number }
        return { nodes: result.nodes, totalCount: result.totalCount }
      },
    }
  }

  // Default: recent UserOps (no pagination, just limit)
  return {
    query: GET_RECENT_USER_OPS,
    variables: { limit },
    extractData: (data) => {
      const nodes = (data.recentUserOps ?? []) as RawUserOperationListItem[]
      return { nodes, totalCount: nodes.length }
    },
  }
}

export function useUserOperations({
  limit = 20,
  offset = 0,
  filter,
}: UseUserOperationsOptions = {}): UseUserOperationsResult {
  const config = getQueryConfig(filter, limit, offset)

  const { data, loading, error } = useQuery(config.query, {
    variables: config.variables,
    fetchPolicy: 'cache-and-network',
  })

  const result = useMemo(() => {
    if (!data) {
      return { userOps: [], totalCount: 0 }
    }

    const extracted = config.extractData(data as Record<string, unknown>)
    const transformed = transformUserOperationListItems(extracted.nodes)

    // Apply client-side status filter (backend doesn't support it)
    const statusFilter = filter?.status
    if (statusFilter === 'success') {
      const filtered = transformed.filter((op) => op.success)
      return { userOps: filtered, totalCount: filtered.length }
    }
    if (statusFilter === 'failed') {
      const filtered = transformed.filter((op) => !op.success)
      return { userOps: filtered, totalCount: filtered.length }
    }

    return { userOps: transformed, totalCount: extracted.totalCount }
  }, [data, config, filter?.status])

  return {
    userOps: result.userOps,
    totalCount: result.totalCount,
    loading,
    error: error ?? null,
  }
}
