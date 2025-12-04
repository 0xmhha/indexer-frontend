'use client'

import { useLatestHeight } from '@/lib/hooks/useLatestHeight'
import { useNetworkMetrics } from '@/lib/hooks/useNetworkMetrics'
import { Card, CardContent } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils/format'
import { LoadingSkeleton } from '@/components/common/LoadingSpinner'

export function NetworkStats() {
  const { latestHeight, loading: heightLoading } = useLatestHeight()
  const { transactionCount, avgBlockTime, loading: metricsLoading } = useNetworkMetrics()

  // Format average block time
  const formatBlockTime = (seconds: number | null) => {
    if (seconds === null) {return '—'}
    if (seconds < 1) {return `${(seconds * 1000).toFixed(0)}ms`}
    return `${seconds.toFixed(2)}s`
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard
        label="LATEST BLOCK"
        value={heightLoading ? null : latestHeight ? formatNumber(latestHeight) : '0'}
        loading={heightLoading}
      />
      <StatCard
        label="TOTAL TRANSACTIONS"
        value={metricsLoading ? null : transactionCount ? formatNumber(transactionCount) : '0'}
        loading={metricsLoading}
      />
      <StatCard
        label="AVG BLOCK TIME"
        value={metricsLoading ? null : formatBlockTime(avgBlockTime)}
        loading={metricsLoading}
      />
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
