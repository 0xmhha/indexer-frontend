'use client'

import Link from 'next/link'
import { formatHash, formatNumber } from '@/lib/utils/format'

interface TopMiner {
  address: string
  blockCount: number
  totalGasUsed: string
}

interface TopMinersTableProps {
  miners: TopMiner[]
}

export function TopMinersTable({ miners }: TopMinersTableProps) {
  if (!miners || miners.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-bg-tertiary bg-bg-secondary">
        <p className="font-mono text-xs text-text-muted">No data available</p>
      </div>
    )
  }

  return (
    <div className="h-64 overflow-y-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-bg-secondary border-b border-bg-tertiary">
          <tr>
            <th className="px-4 py-2 text-left font-mono text-xs text-text-secondary">#</th>
            <th className="px-4 py-2 text-left font-mono text-xs text-text-secondary">MINER</th>
            <th className="px-4 py-2 text-right font-mono text-xs text-text-secondary">BLOCKS</th>
            <th className="px-4 py-2 text-right font-mono text-xs text-text-secondary">GAS USED</th>
          </tr>
        </thead>
        <tbody>
          {miners.map((miner, index) => (
            <tr
              key={miner.address}
              className="border-b border-bg-tertiary last:border-b-0 hover:bg-bg-tertiary transition-colors"
            >
              <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                {index + 1}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/address/${miner.address}`}
                  className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
                >
                  {formatHash(miner.address, true)}
                </Link>
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs text-text-primary">
                {formatNumber(miner.blockCount)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs text-text-primary">
                {formatNumber(BigInt(miner.totalGasUsed))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
