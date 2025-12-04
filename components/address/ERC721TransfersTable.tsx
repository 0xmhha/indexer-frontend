'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useERC721TransfersByAddress } from '@/lib/hooks/useAddressIndexing'
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
import { PAGINATION } from '@/lib/config/constants'
import type { ERC721Transfer } from '@/types/address-indexing'

interface ERC721TransfersTableProps {
  address: string
  limit?: number
}

export function ERC721TransfersTable({ address, limit = PAGINATION.DEFAULT_PAGE_SIZE }: ERC721TransfersTableProps) {
  const [currentOffset, setCurrentOffset] = useState(0)

  // Fetch both sent (isFrom=true) and received (isFrom=false) transfers
  // For now, default to showing transfers FROM this address
  const { erc721Transfers, totalCount, pageInfo, loading, error, loadMore } =
    useERC721TransfersByAddress(address, true, { limit, offset: currentOffset })

  const handleLoadMore = () => {
    if (pageInfo.hasNextPage) {
      setCurrentOffset((prev) => prev + limit)
      loadMore?.()
    }
  }

  if (loading && erc721Transfers.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorDisplay title="Failed to load ERC721 transfers" message={error.message} />
      </div>
    )
  }

  if (erc721Transfers.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-text-muted">No ERC721 NFT transfers found</p>
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
              <TableHead>NFT</TableHead>
              <TableHead>TOKEN ID</TableHead>
              <TableHead>FROM</TableHead>
              <TableHead>TO</TableHead>
              <TableHead>BLOCK</TableHead>
              <TableHead>TIME</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {erc721Transfers.map((transfer: ERC721Transfer) => (
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
                    href={`/address/${transfer.contractAddress}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                    title={transfer.contractAddress}
                  >
                    {formatHash(transfer.contractAddress, true)}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-text-secondary">
                  #{formatNumber(transfer.tokenId)}
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
                Load More ({formatNumber(totalCount - erc721Transfers.length)} remaining)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Total Count */}
      <div className="border-t border-bg-tertiary p-4 text-center">
        <p className="font-mono text-xs text-text-secondary">
          Showing {formatNumber(erc721Transfers.length)} of {formatNumber(totalCount)} ERC721 transfers
        </p>
      </div>
    </div>
  )
}
