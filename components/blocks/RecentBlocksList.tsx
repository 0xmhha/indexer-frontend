'use client'

import { useNewBlocks } from '@/lib/hooks/useSubscriptions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BlockCard } from './BlockCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export function RecentBlocksList() {
  // Use subscription for real-time updates (no polling)
  const { blocks, loading } = useNewBlocks(5)

  if (loading && blocks.length === 0) {
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

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>RECENT BLOCKS</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {blocks.slice(0, 5).map((block) => (
            <BlockCard key={block.hash} block={block} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
