'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LineChart } from '@/components/charts/LineChart'
import type { GasPriceHistoryPoint } from '@/lib/hooks/useGasTracker'
import { cn } from '@/lib/utils'

interface GasPriceHistoryChartProps {
  data: GasPriceHistoryPoint[]
  className?: string
}

/**
 * Gas price history chart component
 *
 * Shows historical base fee and utilization trends
 */
export function GasPriceHistoryChart({ data, className }: GasPriceHistoryChartProps) {
  if (!data.length) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center justify-between">
            <span>GAS PRICE HISTORY</span>
            <span className="font-mono text-xs text-text-secondary">LAST {data.length} BLOCKS</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <span className="font-mono text-sm text-text-muted">No data available</span>
        </CardContent>
      </Card>
    )
  }

  // Transform data for chart - show block numbers relative to latest
  const chartData = data.map((point, index) => ({
    label: `#${point.blockNumber}`,
    blockNumber: point.blockNumber,
    baseFee: point.baseFeeGwei,
    utilization: point.utilization,
    txCount: point.txCount,
    index,
  }))

  return (
    <Card className={cn('', className)}>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <span>GAS PRICE HISTORY</span>
          <span className="font-mono text-xs text-text-secondary">LAST {data.length} BLOCKS</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <LineChart
          data={chartData}
          xKey="index"
          yKeys={[
            { key: 'baseFee', color: '#00D1FF', name: 'Base Fee (Gwei)' },
            { key: 'utilization', color: '#7B61FF', name: 'Utilization (%)' },
          ]}
          height={200}
          showGrid={true}
          showLegend={true}
        />

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-bg-tertiary pt-4">
          <div>
            <div className="font-mono text-xs text-text-muted">Avg Base Fee</div>
            <div className="font-mono text-lg text-accent-cyan">
              {(data.reduce((sum, p) => sum + p.baseFeeGwei, 0) / data.length).toFixed(2)} Gwei
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-text-muted">Avg Utilization</div>
            <div className="font-mono text-lg text-accent-purple">
              {(data.reduce((sum, p) => sum + p.utilization, 0) / data.length).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-text-muted">Avg Tx/Block</div>
            <div className="font-mono text-lg text-text-primary">
              {(data.reduce((sum, p) => sum + p.txCount, 0) / data.length).toFixed(0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
