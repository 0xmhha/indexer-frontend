'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { TransactionTypeBadge } from '@/components/transactions/TransactionTypeBadge'
import type { TransactionData } from './types'

export function TxDetailsCard({ tx }: { tx: TransactionData }) {
  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>ADDITIONAL DETAILS</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">Type</TableCell>
              <TableCell>
                <TransactionTypeBadge type={tx.type} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Nonce</TableCell>
              <TableCell className="font-mono">{tx.nonce}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Chain ID</TableCell>
              <TableCell className="font-mono">{tx.chainId ?? 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Input Data</TableCell>
              <TableCell>
                <div className="max-h-32 overflow-auto rounded bg-bg-primary p-2 font-mono text-xs">
                  {tx.input || '0x'}
                </div>
              </TableCell>
            </TableRow>
            {tx.receipt?.contractAddress && (
              <TableRow>
                <TableCell className="font-bold">Contract Address</TableCell>
                <TableCell>
                  <Link
                    href={`/address/${tx.receipt.contractAddress}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {tx.receipt.contractAddress}
                  </Link>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
