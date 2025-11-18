'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { BlocksOverTimeChart } from '@/components/stats/BlocksOverTimeChart'
import { TopMinersTable } from '@/components/stats/TopMinersTable'
import { useNetworkStats, useBlocksOverTime, useTopMiners } from '@/lib/hooks/useNetworkStats'
import { useLatestHeight } from '@/lib/hooks/useLatestHeight'
import { formatNumber } from '@/lib/utils/format'

export default function StatsPage() {
  const { stats, loading: statsLoading, error: statsError } = useNetworkStats()
  const { latestHeight } = useLatestHeight()

  // Get data for last 24 hours (assuming 12 second block time, ~7200 blocks)
  const toBlock = latestHeight ?? BigInt(0)
  const fromBlock = toBlock > BigInt(7200) ? toBlock - BigInt(7200) : BigInt(0)

  const {
    blocksOverTime,
    loading: blocksLoading,
    error: blocksError,
  } = useBlocksOverTime(fromBlock, toBlock, '1h')

  const { topMiners, loading: minersLoading, error: minersError } = useTopMiners(10)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">NETWORK STATISTICS</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">NETWORK ANALYTICS</h1>
        <p className="font-mono text-xs text-text-secondary">Real-time statistics and historical data</p>
      </div>

      {/* Key Metrics */}
      {statsLoading ? (
        <div className="mb-8 flex h-32 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : statsError ? (
        <div className="mb-8">
          <ErrorDisplay title="Failed to load network statistics" message={statsError.message} />
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="TOTAL BLOCKS"
            value={stats ? formatNumber(stats.totalBlocks) : 'N/A'}
            icon="□"
            color="text-accent-blue"
          />
          <StatCard
            label="TOTAL TRANSACTIONS"
            value={stats ? formatNumber(stats.totalTransactions) : 'N/A'}
            icon="→"
            color="text-accent-cyan"
          />
          <StatCard
            label="AVG BLOCK TIME"
            value={stats ? `${stats.averageBlockTime.toFixed(2)}s` : 'N/A'}
            icon="◷"
            color="text-text-secondary"
          />
          <StatCard
            label="AVG GAS PRICE"
            value={stats ? formatNumber(BigInt(stats.averageGasPrice)) : 'N/A'}
            icon="⚡"
            color="text-accent-orange"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Blocks Over Time */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>BLOCKS OVER TIME (24H)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {blocksLoading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : blocksError ? (
              <ErrorDisplay title="Failed to load chart" message={blocksError.message} />
            ) : (
              <BlocksOverTimeChart data={blocksOverTime} />
            )}
          </CardContent>
        </Card>

        {/* Transactions Over Time - Placeholder */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>TRANSACTIONS OVER TIME</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex h-64 items-center justify-center border border-bg-tertiary bg-bg-secondary">
              <p className="font-mono text-xs text-text-muted">
                Requires separate transactions aggregation query
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gas Usage Trends - Placeholder */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>GAS USAGE TRENDS</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex h-64 items-center justify-center border border-bg-tertiary bg-bg-secondary">
              <p className="font-mono text-xs text-text-muted">
                Gas trend data available in blocksOverTime query
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Miners */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>TOP MINERS</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {minersLoading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : minersError ? (
              <ErrorDisplay title="Failed to load miners" message={minersError.message} />
            ) : (
              <TopMinersTable miners={topMiners} />
            )}
          </CardContent>
        </Card>
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
