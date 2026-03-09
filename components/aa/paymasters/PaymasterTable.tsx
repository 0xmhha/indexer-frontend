'use client'

import { memo } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { AddressLink } from '@/components/common/AddressLink'
import { formatNumber, formatValue } from '@/lib/utils/format'
import type { Paymaster } from '@/types/aa'

interface PaymasterTableProps {
  paymasters: Paymaster[]
}

function PaymasterRowComponent({ paymaster }: { paymaster: Paymaster }) {
  return (
    <TableRow>
      <TableCell>
        <AddressLink address={paymaster.address} isContract={true} />
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs text-text-primary">
          {formatNumber(paymaster.totalSponsored)}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <span className="font-mono text-xs text-text-primary">
          {formatValue(paymaster.totalGasPaid)} STB
        </span>
      </TableCell>
      <TableCell>
        <span className={`font-mono text-xs ${
          paymaster.successRate >= 99 ? 'text-status-success' :
          paymaster.successRate >= 95 ? 'text-accent-orange' : 'text-status-error'
        }`}>
          {paymaster.successRate.toFixed(1)}%
        </span>
      </TableCell>
    </TableRow>
  )
}

const PaymasterRow = memo(PaymasterRowComponent)

export function PaymasterTable({ paymasters }: PaymasterTableProps) {
  if (paymasters.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-text-muted">No paymasters found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ADDRESS</TableHead>
          <TableHead>SPONSORED OPS</TableHead>
          <TableHead className="text-right">TOTAL GAS PAID</TableHead>
          <TableHead>SUCCESS RATE</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paymasters.map((pm) => (
          <PaymasterRow key={pm.address} paymaster={pm} />
        ))}
      </TableBody>
    </Table>
  )
}
