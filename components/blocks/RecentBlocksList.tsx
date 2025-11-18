'use client'

import { useLatestHeight } from '@/lib/hooks/useLatestHeight'
import { useBlock } from '@/lib/hooks/useBlock'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BlockCard } from './BlockCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export function RecentBlocksList() {
  const { latestHeight, loading } = useLatestHeight()

  if (loading || !latestHeight) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>RECENT BLOCKS</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  // Generate array of last 5 block numbers
  const recentBlockNumbers = Array.from({ length: 5 }, (_, i) => latestHeight - BigInt(i))

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>RECENT BLOCKS</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {recentBlockNumbers.map((blockNumber) => (
            <RecentBlockItem key={blockNumber.toString()} blockNumber={blockNumber} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentBlockItem({ blockNumber }: { blockNumber: bigint }) {
  const { block, loading } = useBlock(blockNumber)

  if (loading || !block) {
    return <div className="h-24 animate-pulse rounded bg-bg-tertiary"></div>
  }

  return <BlockCard block={block} />
}
