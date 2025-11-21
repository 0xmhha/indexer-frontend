'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useERC20TransfersByAddress } from '@/lib/hooks/useAddressIndexing'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatHash, formatNumber, formatDate } from '@/lib/utils/format'
import type { ERC20Transfer } from '@/types/address-indexing'

interface ERC20TransfersTableProps {
  address: string
  limit?: number
}

export function ERC20TransfersTable({ address, limit = 20 }: ERC20TransfersTableProps) {
  const [currentOffset, setCurrentOffset] = useState(0)

  const { erc20Transfers, totalCount, pageInfo, loading, error, loadMore } =
    useERC20TransfersByAddress(address, undefined, { limit, offset: currentOffset })

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
                  <Link
                    href={`/address/${transfer.tokenAddress}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                    title={transfer.tokenAddress}
                  >
                    {formatHash(transfer.tokenAddress, true)}
                  </Link>
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
                  {formatNumber(transfer.value)}
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
