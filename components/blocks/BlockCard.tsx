import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { formatTimeAgo, formatNumber } from '@/lib/utils/format'
import type { Block } from '@/types/graphql'

interface BlockCardProps {
  block: Block
}

export function BlockCard({ block }: BlockCardProps) {
  const blockNumber = block.number
  const timestamp = block.timestamp

  return (
    <Card className="transition-colors duration-200 hover:border-accent-blue/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="annotation">BLOCK</span>
              <Link
                href={`/block/${block.number}`}
                className="font-mono text-sm font-bold text-accent-blue hover:text-accent-cyan"
              >
                #{formatNumber(blockNumber)}
              </Link>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-text-muted">
                <span className="w-16">Time:</span>
                <span className="text-text-secondary">{formatTimeAgo(timestamp)}</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <span className="w-16">Miner:</span>
                {block.miner ? (
                  <Link
                    href={`/address/${block.miner}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {block.miner.slice(0, 10)}...
                  </Link>
                ) : (
                  <span className="text-text-muted">N/A</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <span className="w-16">Txns:</span>
                <span className="text-text-secondary">{block.transactionCount}</span>
              </div>
            </div>
          </div>

          <div className="flex h-8 w-8 items-center justify-center border border-accent-blue/30 bg-accent-blue/5">
            <div className="h-4 w-4 border border-accent-blue/50"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
