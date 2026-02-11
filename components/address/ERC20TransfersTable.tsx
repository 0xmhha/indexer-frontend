'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useERC20TransfersByAddress } from '@/lib/hooks/useAddressIndexing'
import { useMergedTransfers } from '@/lib/hooks/useMergedTransfers'
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
import { AddressLink } from '@/components/common/AddressLink'
import { formatHash, formatNumber, formatDate, formatTokenAmount } from '@/lib/utils/format'
import { PAGINATION, getSystemContractInfo } from '@/lib/config/constants'
import { useContractDetection } from '@/lib/hooks/useContractDetection'
import type { ERC20Transfer } from '@/types/address-indexing'

interface ERC20TransfersTableProps {
  address: string
  limit?: number
}

export function ERC20TransfersTable({ address, limit = PAGINATION.DEFAULT_PAGE_SIZE }: ERC20TransfersTableProps) {
  const [currentOffset, setCurrentOffset] = useState(0)

  const fromResult = useERC20TransfersByAddress(address, true, { limit, offset: currentOffset })
  const toResult = useERC20TransfersByAddress(address, false, { limit, offset: currentOffset })

  const { transfers: erc20Transfers, totalCount, loading, error, pageInfo, loadMore } = useMergedTransfers<ERC20Transfer>(
    { transfers: fromResult.erc20Transfers, totalCount: fromResult.totalCount, pageInfo: fromResult.pageInfo, loading: fromResult.loading, error: fromResult.error, loadMore: fromResult.loadMore },
    { transfers: toResult.erc20Transfers, totalCount: toResult.totalCount, pageInfo: toResult.pageInfo, loading: toResult.loading, error: toResult.error, loadMore: toResult.loadMore },
  )

  // Collect unique addresses for batch contract detection
  const allAddresses = useMemo(() => {
    const set = new Set<string>()
    for (const t of erc20Transfers) {
      if (t.from) set.add(t.from)
      if (t.to) set.add(t.to)
      if (t.contractAddress) set.add(t.contractAddress)
    }
    return [...set]
  }, [erc20Transfers])

  const contractMap = useContractDetection(allAddresses)

  const handleLoadMore = () => {
    if (pageInfo.hasNextPage) {
      setCurrentOffset((prev) => prev + limit)
      loadMore()
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
                    <AddressLink address={transfer.from} isContract={contractMap.get(transfer.from.toLowerCase())} />
                  )}
                </TableCell>
                <TableCell>
                  {transfer.to === address ? (
                    <span className="font-mono text-text-secondary">Self</span>
                  ) : (
                    <AddressLink address={transfer.to} isContract={contractMap.get(transfer.to.toLowerCase())} />
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

      <div className="border-t border-bg-tertiary p-4 text-center">
        <p className="font-mono text-xs text-text-secondary">
          Showing {formatNumber(erc20Transfers.length)} of {formatNumber(totalCount)} ERC20 transfers
        </p>
      </div>
    </div>
  )
}
