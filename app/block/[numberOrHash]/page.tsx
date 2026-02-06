'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useBlock } from '@/lib/hooks/useBlock'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { BlockDetailSkeleton } from '@/components/skeletons/BlockDetailSkeleton'
import { NotFound } from '@/components/common/ErrorBoundary'
import {
  formatNumber,
  formatHash,
  formatDate,
  formatCurrency,
  formatBytes,
  formatGasPrice,
} from '@/lib/utils/format'
import { isValidBlockNumber, parseBlockNumber } from '@/lib/utils/validation'
import { env } from '@/lib/config/env'
import type { Transaction } from '@/types/graphql'

export default function BlockPage() {
  const params = useParams()
  const numberOrHash = params.numberOrHash as string

  // Parse block number
  let blockIdentifier: bigint | string
  if (isValidBlockNumber(numberOrHash)) {
    const parsed = parseBlockNumber(numberOrHash)
    blockIdentifier = parsed ?? numberOrHash
  } else {
    blockIdentifier = numberOrHash
  }

  const { block, loading, error } = useBlock(blockIdentifier)

  if (loading) {
    return <BlockDetailSkeleton />
  }

  if (error || !block) {
    return <NotFound message={`Block ${numberOrHash} not found`} />
  }

  const blockNumber = BigInt(block.number)
  const timestamp = BigInt(block.timestamp)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">BLOCK DETAILS</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">
          #{formatNumber(blockNumber)}
        </h1>

        {/* Navigation */}
        <div className="flex gap-2">
          <Link href={`/block/${blockNumber - BigInt(1)}`}>
            <Button variant="outline" size="sm" disabled={blockNumber === BigInt(0)}>
              ← PREV
            </Button>
          </Link>
          <Link href={`/block/${blockNumber + BigInt(1)}`}>
            <Button variant="outline" size="sm">
              NEXT →
            </Button>
          </Link>
        </div>
      </div>

      {/* Block Information */}
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>BLOCK INFORMATION</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-bold">Block Number</TableCell>
                <TableCell className="font-mono">{formatNumber(blockNumber)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Block Hash</TableCell>
                <TableCell className="font-mono text-accent-blue">{block.hash}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Parent Hash</TableCell>
                <TableCell>
                  <Link
                    href={`/block/${block.parentHash}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {block.parentHash}
                  </Link>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Timestamp</TableCell>
                <TableCell className="font-mono">{formatDate(timestamp)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Miner</TableCell>
                <TableCell>
                  <Link
                    href={`/address/${block.miner}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {block.miner}
                  </Link>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Gas Used / Limit</TableCell>
                <TableCell className="font-mono">
                  {formatNumber(BigInt(block.gasUsed))} / {formatNumber(BigInt(block.gasLimit))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Base Fee Per Gas</TableCell>
                <TableCell className="font-mono">
                  {block.baseFeePerGas ? formatGasPrice(block.baseFeePerGas) : 'N/A'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Blob Gas Used / Excess</TableCell>
                <TableCell className="font-mono">
                  {formatNumber(BigInt(block.blobGasUsed ?? '0'))} / {formatNumber(BigInt(block.excessBlobGas ?? '0'))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Withdrawals Root</TableCell>
                <TableCell className="font-mono text-accent-blue">
                  {block.withdrawalsRoot ?? 'N/A'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Block Size</TableCell>
                <TableCell className="font-mono">{formatBytes(Number(block.size))}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Transactions</TableCell>
                <TableCell className="font-mono">{block.transactionCount}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transactions */}
      {block.transactions && block.transactions.length > 0 && (
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>TRANSACTIONS ({block.transactions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TX HASH</TableHead>
                  <TableHead>FROM</TableHead>
                  <TableHead>TO</TableHead>
                  <TableHead className="text-right">VALUE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(block.transactions as Transaction[]).map((tx: Transaction) => (
                  <TableRow key={tx.hash}>
                    <TableCell>
                      <Link
                        href={`/tx/${tx.hash}`}
                        className="font-mono text-accent-blue hover:text-accent-cyan"
                      >
                        {formatHash(tx.hash)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/address/${tx.from}`}
                        className="font-mono text-accent-blue hover:text-accent-cyan"
                      >
                        {formatHash(tx.from, true)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {tx.to ? (
                        <Link
                          href={`/address/${tx.to}`}
                          className="font-mono text-accent-blue hover:text-accent-cyan"
                        >
                          {formatHash(tx.to, true)}
                        </Link>
                      ) : tx.contractAddress ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="text-xs text-accent-orange">[Created]</span>
                          <Link
                            href={`/address/${tx.contractAddress}`}
                            className="font-mono text-accent-blue hover:text-accent-cyan"
                          >
                            {formatHash(tx.contractAddress, true)}
                          </Link>
                        </span>
                      ) : (
                        <span className="font-mono text-text-muted">[Contract]</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(BigInt(tx.value ?? '0'), env.currencySymbol)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
