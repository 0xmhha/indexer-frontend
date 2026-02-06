'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useContractCreation, useContractsByCreator } from '@/lib/hooks/useAddressIndexing'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
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
import { formatHash, formatNumber, formatDate } from '@/lib/utils/format'
import { PAGINATION } from '@/lib/config/constants'
import type { ContractCreation } from '@/types/address-indexing'

interface ContractCreationInfoProps {
  address: string
}

export function ContractCreationInfo({ address }: ContractCreationInfoProps) {
  const [currentOffset, setCurrentOffset] = useState(0)
  const limit = PAGINATION.DEFAULT_PAGE_SIZE

  // Check if this address IS a contract (get its creation info)
  const {
    contractCreation,
    loading: creationLoading,
    error: creationError,
  } = useContractCreation(address)

  // Check if this address CREATED contracts
  const {
    contracts: createdContracts,
    totalCount,
    pageInfo,
    loading: createdLoading,
    error: createdError,
    loadMore,
  } = useContractsByCreator(address, { limit, offset: currentOffset })

  const hasCreationInfo = contractCreation !== null
  const hasCreatedContracts = createdContracts.length > 0
  const isLoading = creationLoading || createdLoading

  // Don't show anything if no contract creation data
  if (!isLoading && !hasCreationInfo && !hasCreatedContracts) {
    return null
  }

  return (
    <>
      {/* Contract Creation Info (if this address is a contract) */}
      {hasCreationInfo && (
        <Card className="mb-6">
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>CONTRACT CREATION</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {creationLoading ? (
              <div className="flex h-32 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : creationError ? (
              <ErrorDisplay title="Failed to load contract creation" message={creationError.message} />
            ) : contractCreation ? (
              <div className="space-y-4">
                <div>
                  <div className="annotation mb-2">CREATOR</div>
                  <Link
                    href={`/address/${contractCreation.creator}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {contractCreation.creator}
                  </Link>
                </div>
                <div>
                  <div className="annotation mb-2">TRANSACTION HASH</div>
                  <Link
                    href={`/tx/${contractCreation.transactionHash}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {contractCreation.transactionHash}
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="annotation mb-2">BLOCK NUMBER</div>
                    <Link
                      href={`/block/${contractCreation.blockNumber}`}
                      className="font-mono text-accent-blue hover:text-accent-cyan"
                    >
                      {formatNumber(contractCreation.blockNumber)}
                    </Link>
                  </div>
                  <div>
                    <div className="annotation mb-2">TIMESTAMP</div>
                    <div className="font-mono text-text-primary">
                      {formatDate(Number(contractCreation.timestamp))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Contracts Created by this Address */}
      {hasCreatedContracts && (
        <Card className="mb-6">
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle className="flex items-center justify-between">
              <span>CONTRACTS CREATED</span>
              <span className="font-mono text-xs text-text-secondary">
                {formatNumber(totalCount)} total
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {createdLoading ? (
              <div className="flex h-32 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : createdError ? (
              <div className="p-6">
                <ErrorDisplay title="Failed to load created contracts" message={createdError.message} />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>CONTRACT ADDRESS</TableHead>
                        <TableHead>CREATOR</TableHead>
                        <TableHead>TRANSACTION HASH</TableHead>
                        <TableHead>BLOCK</TableHead>
                        <TableHead>TIME</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {createdContracts.map((contract: ContractCreation) => (
                        <TableRow key={contract.transactionHash}>
                          <TableCell>
                            <Link
                              href={`/address/${contract.contractAddress}`}
                              className="font-mono text-accent-blue hover:text-accent-cyan"
                            >
                              {formatHash(contract.contractAddress)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/address/${contract.creator}`}
                              className="font-mono text-accent-blue hover:text-accent-cyan"
                            >
                              {formatHash(contract.creator)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/tx/${contract.transactionHash}`}
                              className="font-mono text-accent-blue hover:text-accent-cyan"
                            >
                              {formatHash(contract.transactionHash)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/block/${contract.blockNumber}`}
                              className="font-mono text-accent-blue hover:text-accent-cyan"
                            >
                              {formatNumber(contract.blockNumber)}
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-text-secondary">
                            {formatDate(Number(contract.timestamp))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Load More Button */}
                {pageInfo.hasNextPage && (
                  <div className="border-t border-bg-tertiary p-4 text-center">
                    <Button
                      onClick={() => {
                        setCurrentOffset((prev) => prev + limit)
                        loadMore?.()
                      }}
                      disabled={createdLoading}
                      variant="outline"
                    >
                      {createdLoading ? (
                        <>
                          <LoadingSpinner className="mr-2" size="sm" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More ({formatNumber(totalCount - createdContracts.length)} remaining)
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Total Count */}
                <div className="border-t border-bg-tertiary p-4 text-center">
                  <p className="font-mono text-xs text-text-secondary">
                    Showing {formatNumber(createdContracts.length)} of {formatNumber(totalCount)} contracts
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
