'use client'

import Link from 'next/link'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { formatHash, formatNumber, formatDate } from '@/lib/utils/format'
import type { MinerStats } from '@/lib/graphql/queries/stats'

interface TopMinersTableProps {
  miners: MinerStats[]
  loading?: boolean
}

export function TopMinersTable({ miners, loading }: TopMinersTableProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="font-mono text-sm text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!miners || miners.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="font-mono text-sm text-text-muted">No miner data available</div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">RANK</TableHead>
          <TableHead>MINER ADDRESS</TableHead>
          <TableHead className="text-right">BLOCKS MINED</TableHead>
          <TableHead className="text-right">TOTAL REWARDS</TableHead>
          <TableHead className="text-right">LAST BLOCK</TableHead>
          <TableHead className="text-right">LAST ACTIVITY</TableHead>
          <TableHead className="text-right">PERCENTAGE</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {miners.map((miner, index) => (
          <TableRow key={miner.address}>
            <TableCell className="font-mono font-bold text-accent-blue">#{index + 1}</TableCell>
            <TableCell>
              <Link
                href={`/address/${miner.address}`}
                className="font-mono text-accent-blue hover:text-accent-cyan"
              >
                {formatHash(miner.address)}
              </Link>
            </TableCell>
            <TableCell className="text-right font-mono">{formatNumber(miner.blockCount)}</TableCell>
            <TableCell className="text-right font-mono text-accent-cyan">
              {formatNumber(BigInt(miner.totalRewards))} wei
            </TableCell>
            <TableCell className="text-right">
              <Link
                href={`/block/${miner.lastBlockNumber}`}
                className="font-mono text-accent-blue hover:text-accent-cyan"
              >
                {formatNumber(Number(miner.lastBlockNumber))}
              </Link>
            </TableCell>
            <TableCell className="text-right font-mono text-xs text-text-secondary">
              {formatDate(Number(miner.lastBlockTime))}
            </TableCell>
            <TableCell className="text-right font-mono">
              <span className="text-accent-cyan">{miner.percentage.toFixed(2)}%</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
