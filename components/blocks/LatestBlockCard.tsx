'use client'

import { useNewBlocks } from '@/lib/hooks/useSubscriptions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatNumber, formatTimeAgo } from '@/lib/utils/format'
import Link from 'next/link'

export function LatestBlockCard() {
  // Use centralized store for real-time updates (no direct subscription)
  const { latestBlock, loading } = useNewBlocks(1)

  if (loading && !latestBlock) {
    return (
      <Card>
        <CardContent className="flex h-48 items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!latestBlock) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-sm text-text-muted">No block data available</p>
        </CardContent>
      </Card>
    )
  }

  const blockNumber = latestBlock.number
  const timestamp = latestBlock.timestamp

  return (
    <Card className="border-accent-blue/30">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <span>LATEST BLOCK</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-accent-blue"></div>
            <span className="font-mono text-xs text-accent-blue">LIVE</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <div className="annotation mb-2">BLOCK NUMBER</div>
            <Link
              href={`/block/${latestBlock.number}`}
              className="font-mono text-2xl font-bold text-accent-blue hover:text-accent-cyan"
            >
              #{formatNumber(blockNumber)}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="annotation mb-1">TIMESTAMP</div>
              <div className="font-mono text-xs text-text-secondary">
                {formatTimeAgo(timestamp)}
              </div>
            </div>
            <div>
              <div className="annotation mb-1">TRANSACTIONS</div>
              <div className="font-mono text-xs text-text-secondary">{latestBlock.transactionCount}</div>
            </div>
            <div className="col-span-2">
              <div className="annotation mb-1">MINER</div>
              {latestBlock.miner ? (
                <Link
                  href={`/address/${latestBlock.miner}`}
                  className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
                >
                  {latestBlock.miner}
                </Link>
              ) : (
                <span className="font-mono text-xs text-text-muted">N/A</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
