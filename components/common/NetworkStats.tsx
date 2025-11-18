'use client'

import { useLatestHeight } from '@/lib/hooks/useLatestHeight'
import { Card, CardContent } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils/format'
import { LoadingSkeleton } from '@/components/common/LoadingSpinner'

export function NetworkStats() {
  const { latestHeight, loading } = useLatestHeight()

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard
        label="LATEST BLOCK"
        value={loading ? null : latestHeight ? formatNumber(latestHeight) : '0'}
        loading={loading}
      />
      <StatCard label="TOTAL TRANSACTIONS" value="—" info="Coming soon" />
      <StatCard label="AVG BLOCK TIME" value="—" info="Coming soon" />
    </div>
  )
}

function StatCard({
  label,
  value,
  loading,
  info,
}: {
  label: string
  value: string | null
  loading?: boolean
  info?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="annotation mb-2">{label}</div>
        {loading ? (
          <LoadingSkeleton className="h-8 w-24" />
        ) : (
          <div className="font-mono text-2xl font-bold text-accent-blue">{value}</div>
        )}
        {info && <div className="mt-1 text-xs text-text-muted">{info}</div>}
      </CardContent>
    </Card>
  )
}
