'use client'

import { memo } from 'react'
import Link from 'next/link'
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
import type { PaymasterWithStats } from '@/types/aa'

interface PaymasterTableProps {
  paymasters: PaymasterWithStats[]
}

function formatAge(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) { return `${seconds}s ago` }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) { return `${minutes}m ago` }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) { return `${hours}h ago` }
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function PaymasterRowComponent({ paymaster }: { paymaster: PaymasterWithStats }) {
  return (
    <TableRow>
      <TableCell>
        <Link href={`/paymaster/${paymaster.address}`} className="hover:underline">
          <AddressLink address={paymaster.address} isContract={true} />
        </Link>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs text-text-primary">
          {formatNumber(paymaster.totalOps)}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <span className="font-mono text-xs text-text-primary">
          {formatValue(paymaster.totalGasSponsored)} STB
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
      <TableCell>
        <span className="font-mono text-xs text-text-secondary">
          {formatAge(paymaster.lastActivityTime)}
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
          <TableHead>TOTAL OPS</TableHead>
          <TableHead className="text-right">TOTAL GAS PAID</TableHead>
          <TableHead>SUCCESS RATE</TableHead>
          <TableHead>LAST ACTIVE</TableHead>
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
