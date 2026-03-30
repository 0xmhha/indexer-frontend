/**
 * Hook to build Paymaster list
 *
 * Primary: uses GET_ALL_PAYMASTERS query (backend list endpoint).
 * Fallback: if backend query fails or returns no data, falls back to
 * extracting unique addresses from recent UserOps + individual stats queries.
 */

'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useQuery, useApolloClient } from '@apollo/client'
import { GET_ALL_PAYMASTERS, GET_RECENT_USER_OPS, GET_PAYMASTER_STATS } from '@/lib/apollo/queries/aa'
import { transformPaymasterStats } from '@/lib/utils/aa-transforms'
import { ZERO_ADDRESS } from '@/types/aa'
import type { RawUserOperationListItem, RawPaymasterStats, PaymasterWithStats } from '@/types/aa'

const STATS_BATCH_SIZE = 5
const RECENT_OPS_LIMIT = 200

interface UsePaymasterListResult {
  paymasters: PaymasterWithStats[]
  totalCount: number
  loading: boolean
  error: Error | null
}

function transformRawPaymasterStats(raw: RawPaymasterStats): PaymasterWithStats {
  const stats = transformPaymasterStats(raw)
  const successRate = stats.totalOps > 0
    ? (stats.successfulOps / stats.totalOps) * 100 : 0
  return { ...stats, successRate }
}

async function fetchIndividualStats(
  client: ReturnType<typeof useApolloClient>,
  addresses: string[]
): Promise<Map<string, PaymasterWithStats>> {
  const results = new Map<string, PaymasterWithStats>()
  for (let i = 0; i < addresses.length; i += STATS_BATCH_SIZE) {
    const batch = addresses.slice(i, i + STATS_BATCH_SIZE)
    await Promise.all(batch.map(async (address) => {
      try {
        const { data } = await client.query({
          query: GET_PAYMASTER_STATS,
          variables: { address },
          fetchPolicy: 'cache-first',
        })
        const raw = data?.paymasterStats as RawPaymasterStats | undefined
        if (raw) {
          results.set(address, transformRawPaymasterStats(raw))
        }
      } catch {
        // Graceful degradation
      }
    }))
  }
  return results
}

export function usePaymasterList(): UsePaymasterListResult {
  const client = useApolloClient()

  // Primary: try GET_ALL_PAYMASTERS
  const { data: listData, loading: listLoading, error: listError } = useQuery(GET_ALL_PAYMASTERS, {
    variables: { limit: RECENT_OPS_LIMIT, offset: 0 },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  const backendNodes = (listData?.allPaymasters?.nodes ?? []) as RawPaymasterStats[]
  const backendTotal = (listData?.allPaymasters?.totalCount ?? 0) as number
  const backendAvailable = !listError && backendNodes.length > 0

  // Fallback: fetch from recent UserOps
  const { data: recentData, loading: recentLoading } = useQuery(GET_RECENT_USER_OPS, {
    variables: { limit: RECENT_OPS_LIMIT },
    fetchPolicy: 'cache-and-network',
    skip: backendAvailable,
  })

  // Fallback state
  const [version, setVersion] = useState(0)
  const statsRef = useRef<Map<string, PaymasterWithStats>>(new Map())
  const loadingRef = useRef(false)
  const prevAddrsRef = useRef('')

  const fallbackAddresses = useMemo(() => {
    if (backendAvailable) { return [] }
    const rawOps = (recentData?.recentUserOps ?? []) as RawUserOperationListItem[]
    const set = new Set<string>()
    for (const op of rawOps) {
      if (op.paymaster && op.paymaster !== ZERO_ADDRESS) {
        set.add(op.paymaster.toLowerCase())
      }
    }
    return [...set]
  }, [recentData, backendAvailable])

  const doFetch = useCallback(async (addrs: string[]) => {
    loadingRef.current = true
    statsRef.current = await fetchIndividualStats(client, addrs)
    loadingRef.current = false
    setVersion((v) => v + 1)
  }, [client])

  useEffect(() => {
    if (backendAvailable) { return undefined }
    const key = fallbackAddresses.join(',')
    if (key === prevAddrsRef.current || fallbackAddresses.length === 0) { return undefined }
    prevAddrsRef.current = key
    doFetch(fallbackAddresses)
    return undefined
  }, [fallbackAddresses, doFetch, backendAvailable])

  const paymasters = useMemo(() => {
    if (backendAvailable) {
      return backendNodes
        .map(transformRawPaymasterStats)
        .sort((a, b) => b.totalOps - a.totalOps)
    }
    return [...statsRef.current.values()].sort((a, b) => b.totalOps - a.totalOps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendAvailable, backendNodes, version])

  const loading = backendAvailable ? listLoading : (recentLoading || loadingRef.current)
  const totalCount = backendAvailable ? backendTotal : paymasters.length

  return {
    paymasters,
    totalCount,
    loading,
    error: backendAvailable ? null : (listError ?? null),
  }
}
