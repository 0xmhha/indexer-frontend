'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { CopyButton } from '@/components/common/CopyButton'
import { AddressLink } from '@/components/common/AddressLink'
import { formatNumber, formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import { useAddressOverview } from '@/lib/hooks/useAddress'
import type { TransactionData } from './types'

export function TxInfoCard({ tx, status }: { tx: TransactionData; status: string }) {
  const { isContract: fromIsContract } = useAddressOverview(tx.from)
  const { isContract: toIsContract } = useAddressOverview(tx.to ?? null)
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>TRANSACTION INFORMATION</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">Status</TableCell>
              <TableCell
                className={
                  status === 'Success'
                    ? 'text-success'
                    : status === 'Pending'
                      ? 'text-warning'
                      : 'text-error'
                }
              >
                {status}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Block</TableCell>
              <TableCell>
                <Link
                  href={`/block/${tx.blockNumber}`}
                  className="font-mono text-accent-blue hover:text-accent-cyan"
                >
                  #{formatNumber(BigInt(tx.blockNumber ?? '0'))}
                </Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Block Hash</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1">
                  <span className="font-mono text-accent-blue">{tx.blockHash}</span>
                  <CopyButton text={tx.blockHash} />
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Transaction Index</TableCell>
              <TableCell className="font-mono">{tx.transactionIndex}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">From</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1">
                  <AddressLink address={tx.from} truncate={false} isContract={fromIsContract} textSize="text-sm" />
                  <CopyButton text={tx.from} />
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">To</TableCell>
              <TableCell>
                {tx.to ? (
                  <span className="inline-flex items-center gap-1">
                    <AddressLink address={tx.to} truncate={false} isContract={toIsContract} textSize="text-sm" />
                    <CopyButton text={tx.to} />
                  </span>
                ) : tx.receipt?.contractAddress ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="text-accent-orange">[Contract Creation]</span>
                    <AddressLink address={tx.receipt.contractAddress} truncate={false} isContract={true} textSize="text-sm" />
                    <CopyButton text={tx.receipt.contractAddress} />
                  </span>
                ) : (
                  <span className="font-mono text-text-muted">[Contract Creation]</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Value</TableCell>
              <TableCell className="font-mono font-bold text-accent-blue">
                {formatCurrency(BigInt(tx.value ?? '0'), env.currencySymbol)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
