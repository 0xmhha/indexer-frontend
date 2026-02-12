'use client'

import { useNewBlocks } from '@/lib/hooks/useSubscriptions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { BlockCard } from './BlockCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { UI } from '@/lib/config/constants'

export function RecentBlocksList() {
  // Use subscription for real-time updates (no polling)
  const { blocks, loading } = useNewBlocks(UI.MAX_LIST_PREVIEW)

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
      <CardContent className="p-4" aria-live="polite">
        <div className="space-y-3">
          {blocks.slice(0, UI.MAX_LIST_PREVIEW).map((block) => (
            <BlockCard key={block.hash} block={block} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
