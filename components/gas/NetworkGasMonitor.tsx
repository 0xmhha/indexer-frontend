'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useGasTracker } from '@/lib/hooks/useGasTracker'
import { GasPriceLevelCard } from './GasPriceLevelCard'
import { BaseFeeDisplay } from './BaseFeeDisplay'
import { NetworkUtilizationBar } from './NetworkUtilizationBar'
import { GasPriceHistoryChart } from './GasPriceHistoryChart'
import { formatTimeAgo } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

interface NetworkGasMonitorProps {
  /** Number of blocks to analyze for recommendations */
  blockCount?: number
  /** Show history chart */
  showHistory?: boolean
  /** Enable real-time updates */
  enableRealtime?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Network Gas Monitor Component
 *
 * Real-time gas price tracking with recommendations based on recent block analysis.
 * Shows economy/standard/priority price levels, base fee, and network utilization.
 *
 * @example
 * ```tsx
 * <NetworkGasMonitor blockCount={20} showHistory={true} />
 * ```
 */
export function NetworkGasMonitor({
  blockCount = 20,
  showHistory = true,
  enableRealtime = true,
  className,
}: NetworkGasMonitorProps) {
  const { metrics, history, loading, error, refetch } = useGasTracker({
    blockCount,
    enableSubscription: enableRealtime,
  })

  // Loading state
  if (loading && !metrics) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-green" />
            </span>
            NETWORK GAS MONITOR
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>NETWORK GAS MONITOR</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded border border-accent-red/30 bg-accent-red/10 p-4">
            <div className="mb-2 font-mono text-sm text-accent-red">Failed to load gas data</div>
            <div className="mb-3 font-mono text-xs text-text-muted">{error.message}</div>
            <button
              onClick={() => refetch()}
              className="rounded border border-accent-blue/50 bg-accent-blue/10 px-3 py-1 font-mono text-xs text-accent-blue transition-colors hover:bg-accent-blue/20"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data
  if (!metrics) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>NETWORK GAS MONITOR</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <span className="font-mono text-sm text-text-muted">No gas data available</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Card */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-green" />
              </span>
              NETWORK GAS MONITOR
            </div>
            <span className="font-mono text-xs text-text-muted">
              Updated {formatTimeAgo(metrics.updatedAt.getTime() / 1000)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Base Fee & Network Utilization */}
          <div className="grid grid-cols-1 gap-px bg-bg-tertiary md:grid-cols-2">
            <div className="bg-bg-secondary">
              <BaseFeeDisplay
                baseFeeGwei={metrics.baseFeeGwei}
                blockNumber={metrics.lastBlockNumber}
                className="border-0"
              />
            </div>
            <div className="bg-bg-secondary">
              <NetworkUtilizationBar
                utilization={metrics.networkUtilization}
                gasUsed={metrics.lastBlockGasUsed}
                gasLimit={metrics.lastBlockGasLimit}
                className="border-0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gas Price Recommendations */}
      <div>
        <div className="annotation mb-4">GAS PRICE RECOMMENDATIONS</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {metrics.priceLevels.map((level) => (
            <GasPriceLevelCard key={level.tier} level={level} />
          ))}
        </div>
      </div>

      {/* History Chart */}
      {showHistory && history.length > 0 && <GasPriceHistoryChart data={history} />}

      {/* Info Footer */}
      <div className="rounded border border-bg-tertiary bg-bg-secondary/50 p-4">
        <div className="annotation mb-2">HOW IT WORKS</div>
        <p className="font-mono text-xs leading-relaxed text-text-secondary">
          Gas prices are calculated by analyzing the last {blockCount} blocks. Economy uses the 25th
          percentile of priority fees, Standard uses the 50th percentile, and Priority uses the 75th
          percentile. A buffer is added to max fee to account for base fee fluctuations.
        </p>
      </div>
    </div>
  )
}
