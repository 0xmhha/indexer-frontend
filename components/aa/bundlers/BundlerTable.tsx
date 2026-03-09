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
import type { Bundler } from '@/types/aa'

interface BundlerTableProps {
  bundlers: Bundler[]
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

function BundlerRowComponent({ bundler }: { bundler: Bundler }) {
  return (
    <TableRow>
      <TableCell>
        <AddressLink address={bundler.address} />
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs text-text-primary">
          {formatNumber(bundler.totalBundles)}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs text-text-primary">
          {formatNumber(bundler.totalUserOps)}
        </span>
      </TableCell>
      <TableCell>
        <span className={`font-mono text-xs ${
          bundler.successRate >= 99 ? 'text-status-success' :
          bundler.successRate >= 95 ? 'text-accent-orange' : 'text-status-error'
        }`}>
          {bundler.successRate.toFixed(1)}%
        </span>
      </TableCell>
      <TableCell className="text-right">
        <span className="font-mono text-xs text-text-primary">
          {formatValue(bundler.totalGasUsed)} STB
        </span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs text-text-secondary">
          {formatAge(bundler.lastSeen)}
        </span>
      </TableCell>
    </TableRow>
  )
}

const BundlerRow = memo(BundlerRowComponent)

export function BundlerTable({ bundlers }: BundlerTableProps) {
  if (bundlers.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-text-muted">No bundlers found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ADDRESS</TableHead>
          <TableHead>BUNDLES</TableHead>
          <TableHead>USER OPS</TableHead>
          <TableHead>SUCCESS RATE</TableHead>
          <TableHead className="text-right">TOTAL GAS USED</TableHead>
          <TableHead>LAST SEEN</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bundlers.map((bundler) => (
          <BundlerRow key={bundler.address} bundler={bundler} />
        ))}
      </TableBody>
    </Table>
  )
}
