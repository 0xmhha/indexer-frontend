'use client'

import { use } from 'react'
import Link from 'next/link'
import { useTransaction } from '@/lib/hooks/useTransaction'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { TransactionDetailSkeleton } from '@/components/skeletons/TransactionDetailSkeleton'
import { NotFound } from '@/components/common/ErrorBoundary'
import { formatNumber, formatCurrency, formatGasPrice } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import type { Log } from '@/types/graphql'

interface PageProps {
  params: Promise<{ hash: string }>
}

export default function TransactionPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const hash = resolvedParams.hash

  const { transaction, loading, error } = useTransaction(hash)

  if (loading) {
    return <TransactionDetailSkeleton />
  }

  if (error || !transaction) {
    return <NotFound message={`Transaction ${hash} not found`} />
  }

  const value = BigInt(transaction.value)
  const status = transaction.receipt?.status === '1' ? 'Success' : 'Failed'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">TRANSACTION DETAILS</div>
        <h1 className="mb-4 break-all font-mono text-xl font-bold text-accent-blue">
          {transaction.hash}
        </h1>

        {/* Status */}
        <div className="inline-flex items-center gap-2 rounded border px-3 py-1">
          <div
            className={`h-2 w-2 rounded-full ${status === 'Success' ? 'bg-success' : 'bg-error'}`}
          ></div>
          <span
            className={`font-mono text-xs ${status === 'Success' ? 'text-success' : 'text-error'}`}
          >
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Transaction Information */}
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>TRANSACTION INFORMATION</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-bold">Status</TableCell>
                <TableCell className={status === 'Success' ? 'text-success' : 'text-error'}>
                  {status}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Block</TableCell>
                <TableCell>
                  <Link
                    href={`/block/${transaction.blockNumber}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    #{formatNumber(BigInt(transaction.blockNumber))}
                  </Link>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Block Hash</TableCell>
                <TableCell className="font-mono text-accent-blue">
                  {transaction.blockHash}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Transaction Index</TableCell>
                <TableCell className="font-mono">{transaction.transactionIndex}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">From</TableCell>
                <TableCell>
                  <Link
                    href={`/address/${transaction.from}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {transaction.from}
                  </Link>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">To</TableCell>
                <TableCell>
                  {transaction.to ? (
                    <Link
                      href={`/address/${transaction.to}`}
                      className="font-mono text-accent-blue hover:text-accent-cyan"
                    >
                      {transaction.to}
                    </Link>
                  ) : (
                    <span className="font-mono text-text-muted">[Contract Creation]</span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Value</TableCell>
                <TableCell className="font-mono font-bold text-accent-blue">
                  {formatCurrency(value, env.currencySymbol)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Gas & Fees */}
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>GAS & FEES</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-bold">Gas Used</TableCell>
                <TableCell className="font-mono">
                  {transaction.receipt?.gasUsed
                    ? formatNumber(BigInt(transaction.receipt.gasUsed))
                    : 'Pending'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Gas Limit</TableCell>
                <TableCell className="font-mono">{formatNumber(BigInt(transaction.gas))}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Gas Price</TableCell>
                <TableCell className="font-mono">{formatGasPrice(transaction.gasPrice)}</TableCell>
              </TableRow>
              {transaction.maxFeePerGas && (
                <>
                  <TableRow>
                    <TableCell className="font-bold">Max Fee Per Gas</TableCell>
                    <TableCell className="font-mono">
                      {formatGasPrice(transaction.maxFeePerGas)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Max Priority Fee Per Gas</TableCell>
                    <TableCell className="font-mono">
                      {formatGasPrice(transaction.maxPriorityFeePerGas ?? '0')}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>ADDITIONAL DETAILS</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-bold">Type</TableCell>
                <TableCell className="font-mono">{transaction.type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Nonce</TableCell>
                <TableCell className="font-mono">{transaction.nonce}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Input Data</TableCell>
                <TableCell>
                  <div className="max-h-32 overflow-auto rounded bg-bg-primary p-2 font-mono text-xs">
                    {transaction.input || '0x'}
                  </div>
                </TableCell>
              </TableRow>
              {transaction.receipt?.contractAddress && (
                <TableRow>
                  <TableCell className="font-bold">Contract Address</TableCell>
                  <TableCell>
                    <Link
                      href={`/address/${transaction.receipt.contractAddress}`}
                      className="font-mono text-accent-blue hover:text-accent-cyan"
                    >
                      {transaction.receipt.contractAddress}
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Logs */}
      {transaction.receipt?.logs && transaction.receipt.logs.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>LOGS ({transaction.receipt.logs.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {(transaction.receipt.logs as Log[]).map((log: Log, index: number) => (
                <div key={index} className="rounded border border-bg-tertiary p-4">
                  <div className="annotation mb-2">LOG #{log.logIndex}</div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-text-muted">Address:</span>
                      <Link
                        href={`/address/${log.address}`}
                        className="ml-2 font-mono text-accent-blue hover:text-accent-cyan"
                      >
                        {log.address}
                      </Link>
                    </div>
                    <div>
                      <span className="text-text-muted">Topics:</span>
                      <div className="mt-1 space-y-1 font-mono">
                        {log.topics.map((topic: string, i: number) => (
                          <div key={i} className="text-text-secondary">
                            {topic}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-text-muted">Data:</span>
                      <div className="mt-1 max-h-24 overflow-auto rounded bg-bg-primary p-2 font-mono text-text-secondary">
                        {log.data}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
