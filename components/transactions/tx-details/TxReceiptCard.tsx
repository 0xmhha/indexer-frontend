'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { formatNumber, formatCurrency, formatGasPrice } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import type { FullReceipt } from './types'

export function TxReceiptCard({ receipt }: { receipt: FullReceipt }) {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>RECEIPT</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">Status</TableCell>
              <TableCell>
                <span
                  className={`font-mono font-bold ${receipt.isSuccess ? 'text-success' : 'text-error'}`}
                >
                  {receipt.isSuccess ? 'Success (1)' : 'Failed (0)'}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Block Number</TableCell>
              <TableCell>
                <Link
                  href={`/block/${receipt.blockNumber}`}
                  className="font-mono text-accent-blue hover:text-accent-cyan"
                >
                  #{formatNumber(BigInt(receipt.blockNumber))}
                </Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Transaction Index</TableCell>
              <TableCell className="font-mono">{receipt.transactionIndex}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Gas Used</TableCell>
              <TableCell className="font-mono">
                {formatNumber(BigInt(receipt.gasUsed))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Cumulative Gas Used</TableCell>
              <TableCell className="font-mono">
                {formatNumber(BigInt(receipt.cumulativeGasUsed))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Effective Gas Price</TableCell>
              <TableCell className="font-mono">
                {formatGasPrice(receipt.effectiveGasPrice)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Transaction Fee</TableCell>
              <TableCell className="font-mono font-bold text-accent-orange">
                {formatCurrency(receipt.txCostWei, env.currencySymbol)}
              </TableCell>
            </TableRow>
            {receipt.contractAddress && (
              <TableRow>
                <TableCell className="font-bold">Contract Created</TableCell>
                <TableCell>
                  <Link
                    href={`/address/${receipt.contractAddress}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {receipt.contractAddress}
                  </Link>
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="font-bold">Block Hash</TableCell>
              <TableCell className="font-mono text-xs text-text-secondary break-all">
                {receipt.blockHash}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
