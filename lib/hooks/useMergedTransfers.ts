'use client'

/**
 * Shared hook for merging bidirectional transfer queries (FROM + TO)
 * Used by ERC20TransfersTable and ERC721TransfersTable
 */

import { useMemo } from 'react'

export interface BaseTransfer {
  transactionHash: string
  logIndex: number
  blockNumber: bigint
}

interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface TransferQueryResult<T> {
  transfers: T[]
  totalCount: number
  pageInfo: PageInfo
  loading: boolean
  error: Error | undefined
  loadMore?: () => void
}

export function useMergedTransfers<T extends BaseTransfer>(
  fromResult: TransferQueryResult<T>,
  toResult: TransferQueryResult<T>,
) {
  const transfers = useMemo(() => {
    const seen = new Set<string>()
    const merged: T[] = []

    for (const transfer of fromResult.transfers) {
      const key = `${transfer.transactionHash}-${transfer.logIndex}`
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(transfer)
      }
    }

    for (const transfer of toResult.transfers) {
      const key = `${transfer.transactionHash}-${transfer.logIndex}`
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(transfer)
      }
    }

    return merged.sort((a, b) => Number(b.blockNumber - a.blockNumber))
  }, [fromResult.transfers, toResult.transfers])

  const totalCount = fromResult.totalCount + toResult.totalCount
  const loading = fromResult.loading || toResult.loading
  const error = fromResult.error || toResult.error
  const pageInfo: PageInfo = {
    hasNextPage: fromResult.pageInfo.hasNextPage || toResult.pageInfo.hasNextPage,
    hasPreviousPage: fromResult.pageInfo.hasPreviousPage || toResult.pageInfo.hasPreviousPage,
  }

  const loadMore = () => {
    if (fromResult.pageInfo.hasNextPage) fromResult.loadMore?.()
    if (toResult.pageInfo.hasNextPage) toResult.loadMore?.()
  }

  return { transfers, totalCount, loading, error, pageInfo, loadMore }
}
