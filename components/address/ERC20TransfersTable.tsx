'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useERC20TransfersByAddress } from '@/lib/hooks/useAddressIndexing'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatHash, formatNumber, formatDate, formatTokenAmount } from '@/lib/utils/format'
import { PAGINATION, getSystemContractInfo } from '@/lib/config/constants'
import type { ERC20Transfer } from '@/types/address-indexing'

interface ERC20TransfersTableProps {
  address: string
  limit?: number
}

export function ERC20TransfersTable({ address, limit = PAGINATION.DEFAULT_PAGE_SIZE }: ERC20TransfersTableProps) {
  const [currentOffset, setCurrentOffset] = useState(0)

  // Query transfers FROM this address
  const {
    erc20Transfers: fromTransfers,
    totalCount: fromTotalCount,
    pageInfo: fromPageInfo,
    loading: fromLoading,
    error: fromError,
    loadMore: loadMoreFrom,
  } = useERC20TransfersByAddress(address, true, { limit, offset: currentOffset })

  // Query transfers TO this address
  const {
    erc20Transfers: toTransfers,
    totalCount: toTotalCount,
    pageInfo: toPageInfo,
    loading: toLoading,
    error: toError,
    loadMore: loadMoreTo,
  } = useERC20TransfersByAddress(address, false, { limit, offset: currentOffset })

  // Merge and deduplicate transfers from both directions
  const erc20Transfers = useMemo(() => {
    const seen = new Set<string>()
    const merged: ERC20Transfer[] = []

    // Add FROM transfers
    for (const transfer of fromTransfers) {
      const key = `${transfer.transactionHash}-${transfer.logIndex}`
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(transfer)
      }
    }

    // Add TO transfers (avoiding duplicates)
    for (const transfer of toTransfers) {
      const key = `${transfer.transactionHash}-${transfer.logIndex}`
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(transfer)
      }
    }

    // Sort by block number descending
    return merged.sort((a, b) => Number(b.blockNumber - a.blockNumber))
  }, [fromTransfers, toTransfers])

  const totalCount = fromTotalCount + toTotalCount
  const loading = fromLoading || toLoading
  const error = fromError || toError
  const pageInfo = {
    hasNextPage: fromPageInfo.hasNextPage || toPageInfo.hasNextPage,
    hasPreviousPage: fromPageInfo.hasPreviousPage || toPageInfo.hasPreviousPage,
  }

  const loadMore = () => {
    if (fromPageInfo.hasNextPage) loadMoreFrom?.()
    if (toPageInfo.hasNextPage) loadMoreTo?.()
  }

  const handleLoadMore = () => {
    if (pageInfo.hasNextPage) {
      setCurrentOffset((prev) => prev + limit)
      loadMore?.()
    }
  }

  if (loading && erc20Transfers.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorDisplay title="Failed to load ERC20 transfers" message={error.message} />
      </div>
    )
  }

  if (erc20Transfers.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-text-muted">No ERC20 token transfers found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TX HASH</TableHead>
              <TableHead>TOKEN</TableHead>
              <TableHead>FROM</TableHead>
              <TableHead>TO</TableHead>
              <TableHead className="text-right">VALUE</TableHead>
              <TableHead>BLOCK</TableHead>
              <TableHead>TIME</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {erc20Transfers.map((transfer: ERC20Transfer) => (
              <TableRow key={`${transfer.transactionHash}-${transfer.logIndex}`}>
                <TableCell>
                  <Link
                    href={`/tx/${transfer.transactionHash}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {formatHash(transfer.transactionHash)}
                  </Link>
                </TableCell>
                <TableCell>
                  {(() => {
                    const tokenInfo = getSystemContractInfo(transfer.contractAddress)
                    if (tokenInfo) {
                      return (
                        <Link
                          href={`/address/${transfer.contractAddress}`}
                          className="inline-flex items-center gap-1 font-mono text-accent-blue hover:text-accent-cyan"
                          title={transfer.contractAddress}
                        >
                          <span className="font-semibold">{tokenInfo.symbol}</span>
                          <span className="text-xs text-text-secondary">({tokenInfo.name})</span>
                        </Link>
                      )
                    }
                    return (
                      <Link
                        href={`/address/${transfer.contractAddress}`}
                        className="font-mono text-accent-blue hover:text-accent-cyan"
                        title={transfer.contractAddress}
                      >
                        {formatHash(transfer.contractAddress, true)}
                      </Link>
                    )
                  })()}
                </TableCell>
                <TableCell>
                  {transfer.from === address ? (
                    <span className="font-mono text-text-secondary">Self</span>
                  ) : (
                    <Link
                      href={`/address/${transfer.from}`}
                      className="font-mono text-accent-blue hover:text-accent-cyan"
                    >
                      {formatHash(transfer.from, true)}
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  {transfer.to === address ? (
                    <span className="font-mono text-text-secondary">Self</span>
                  ) : (
                    <Link
                      href={`/address/${transfer.to}`}
                      className="font-mono text-accent-blue hover:text-accent-cyan"
                    >
                      {formatHash(transfer.to, true)}
                    </Link>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {(() => {
                    const tokenInfo = getSystemContractInfo(transfer.contractAddress)
                    const decimals = tokenInfo?.decimals ?? 18
                    const symbol = tokenInfo?.symbol ?? ''
                    return `${formatTokenAmount(transfer.value, decimals)} ${symbol}`.trim()
                  })()}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/block/${transfer.blockNumber}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {formatNumber(transfer.blockNumber)}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs text-text-secondary">
                  {formatDate(Number(transfer.timestamp))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Load More Button */}
      {pageInfo.hasNextPage && (
        <div className="border-t border-bg-tertiary p-4 text-center">
          <Button onClick={handleLoadMore} disabled={loading} variant="outline">
            {loading ? (
              <>
                <LoadingSpinner className="mr-2" size="sm" />
                Loading...
              </>
            ) : (
              <>
                Load More ({formatNumber(totalCount - erc20Transfers.length)} remaining)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Total Count */}
      <div className="border-t border-bg-tertiary p-4 text-center">
        <p className="font-mono text-xs text-text-secondary">
          Showing {formatNumber(erc20Transfers.length)} of {formatNumber(totalCount)} ERC20 transfers
        </p>
      </div>
    </div>
  )
}
