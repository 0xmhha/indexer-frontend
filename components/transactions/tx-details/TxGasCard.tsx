'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { formatNumber, formatCurrency, formatGasPrice } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import type { TransactionData, ParsedReceipt } from './types'

export function TxGasCard({
  tx,
  receipt,
}: {
  tx: TransactionData
  receipt?: ParsedReceipt | null
}) {
  // Use receipt from separate query if available, fallback to embedded receipt
  const gasUsed = receipt?.gasUsed ?? tx.receipt?.gasUsed
  const effectiveGasPrice = receipt?.effectiveGasPrice

  return (
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
                {gasUsed ? formatNumber(BigInt(gasUsed)) : 'Pending'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Gas Limit</TableCell>
              <TableCell className="font-mono">{formatNumber(BigInt(tx.gas ?? '0'))}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Gas Price</TableCell>
              <TableCell className="font-mono">{formatGasPrice(tx.gasPrice)}</TableCell>
            </TableRow>
            {effectiveGasPrice && (
              <TableRow>
                <TableCell className="font-bold">Effective Gas Price</TableCell>
                <TableCell className="font-mono">{formatGasPrice(effectiveGasPrice)}</TableCell>
              </TableRow>
            )}
            {tx.maxFeePerGas && (
              <>
                <TableRow>
                  <TableCell className="font-bold">Max Fee Per Gas</TableCell>
                  <TableCell className="font-mono">{formatGasPrice(tx.maxFeePerGas)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Max Priority Fee Per Gas</TableCell>
                  <TableCell className="font-mono">
                    {formatGasPrice(tx.maxPriorityFeePerGas ?? '0')}
                  </TableCell>
                </TableRow>
              </>
            )}
            {receipt?.txCostWei !== undefined && (
              <TableRow>
                <TableCell className="font-bold">Transaction Fee</TableCell>
                <TableCell className="font-mono font-bold text-accent-orange">
                  {formatCurrency(receipt.txCostWei, env.currencySymbol)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
