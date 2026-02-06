'use client'

import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useBlocksByTimeRange, useNetworkMetrics } from '@/lib/hooks/useAnalytics'
import { useTopMiners } from '@/lib/hooks/useStats'
import { TopMinersTable } from '@/components/stats/TopMinersTable'
import { AdvancedLogsViewer } from '@/components/logs/AdvancedLogsViewer'
import { formatNumber } from '@/lib/utils/format'
import { BLOCKCHAIN } from '@/lib/config/constants'

// Lazy load heavy chart components
const TransactionsOverTimeChart = dynamic(
  () =>
    import('@/components/stats/TransactionsOverTimeChart').then((mod) => ({
      default: mod.TransactionsOverTimeChart,
    })),
  {
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
)

const GasUsageTrendsChart = dynamic(
  () =>
    import('@/components/stats/GasUsageTrendsChart').then((mod) => ({
      default: mod.GasUsageTrendsChart,
    })),
  {
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
)

export default function StatsPage() {
  const { blockCount, transactionCount, loading: metricsLoading, error: metricsError } = useNetworkMetrics()

  // Calculate time range for last 24 hours
  const now = Math.floor(Date.now() / 1000)
  const dayAgo = now - BLOCKCHAIN.HOURS_PER_DAY * BLOCKCHAIN.MINUTES_PER_HOUR * BLOCKCHAIN.SECONDS_PER_MINUTE
  const toTime = BigInt(now)
  const fromTime = BigInt(dayAgo)

  const {
    blocks,
    loading: blocksLoading,
    error: blocksError,
  } = useBlocksByTimeRange(fromTime, toTime, 1000)

  const { miners, loading: minersLoading } = useTopMiners({ limit: 10 })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">NETWORK STATISTICS</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">NETWORK ANALYTICS</h1>
        <p className="font-mono text-xs text-text-secondary">Real-time statistics and historical data</p>
      </div>

      {/* Key Metrics */}
      {metricsLoading ? (
        <div className="mb-8 flex h-32 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : metricsError ? (
        <div className="mb-8">
          <ErrorDisplay title="Failed to load network metrics" message={metricsError.message} />
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          <StatCard
            label="TOTAL BLOCKS"
            value={formatNumber(blockCount)}
            icon="□"
            color="text-accent-blue"
          />
          <StatCard
            label="TOTAL TRANSACTIONS"
            value={formatNumber(transactionCount)}
            icon="→"
            color="text-accent-cyan"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Transactions Over Time */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>TRANSACTIONS OVER TIME (24H)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {blocksLoading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : blocksError ? (
              <ErrorDisplay title="Failed to load chart" message={blocksError.message} />
            ) : (
              <TransactionsOverTimeChart blocks={blocks} />
            )}
          </CardContent>
        </Card>

        {/* Gas Usage Trends */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>GAS USAGE TRENDS (24H)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {blocksLoading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : blocksError ? (
              <ErrorDisplay title="Failed to load chart" message={blocksError.message} />
            ) : (
              <GasUsageTrendsChart blocks={blocks} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Miners Section */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>TOP MINERS</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TopMinersTable miners={miners} loading={minersLoading} />
        </CardContent>
      </Card>

      {/* Advanced Real-time Logs Section with Filters */}
      <div className="mt-6">
        <AdvancedLogsViewer maxLogs={50} />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="annotation mb-2">{label}</div>
            <div className="font-mono text-2xl font-bold text-accent-blue">{value}</div>
          </div>
          <div className={`font-mono text-3xl ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
