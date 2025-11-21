'use client'

import Link from 'next/link'
import { useContractCreation, useContractsByCreator } from '@/lib/hooks/useAddressIndexing'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatHash, formatNumber, formatDate } from '@/lib/utils/format'
import type { ContractCreation } from '@/types/address-indexing'

interface ContractCreationInfoProps {
  address: string
}

export function ContractCreationInfo({ address }: ContractCreationInfoProps) {
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
    loading: createdLoading,
    error: createdError,
  } = useContractsByCreator(address, undefined, { limit: 5, offset: 0 })

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
                        <TableHead>TRANSACTION HASH</TableHead>
                        <TableHead>BLOCK</TableHead>
                        <TableHead>TIME</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {createdContracts.map((contract: ContractCreation) => (
                        <TableRow key={contract.address}>
                          <TableCell>
                            <Link
                              href={`/address/${contract.address}`}
                              className="font-mono text-accent-blue hover:text-accent-cyan"
                            >
                              {formatHash(contract.address)}
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
                {totalCount > 5 && (
                  <div className="border-t border-bg-tertiary p-4 text-center">
                    <p className="font-mono text-xs text-text-secondary">
                      Showing first 5 contracts. Visit creator&apos;s page to see all {formatNumber(totalCount)}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
