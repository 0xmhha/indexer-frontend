'use client'

import { useMemo } from 'react'
import { AreaChart } from '@/components/charts/AreaChart'
import { formatCurrency, formatNumber } from '@/lib/utils/format'
import { env } from '@/lib/config/env'

interface BalanceHistoryEntry {
  blockNumber: string
  balance: string
  delta: string
  transactionHash: string
}

interface BalanceHistoryChartProps {
  history: BalanceHistoryEntry[]
  currencySymbol?: string
}

interface ChartDataPoint {
  blockNumber: number
  balance: number
  balanceRaw: bigint
}

export function BalanceHistoryChart({ history, currencySymbol = env.currencySymbol }: BalanceHistoryChartProps) {
  // Process history data for chart
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!history || history.length === 0) return []

    return history
      .map((entry) => ({
        blockNumber: Number(entry.blockNumber),
        balance: Number(BigInt(entry.balance)) / 1e18, // Convert wei to ether for display
        balanceRaw: BigInt(entry.balance),
      }))
      .sort((a, b) => a.blockNumber - b.blockNumber) // Sort by block number ascending
  }, [history])

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-bg-tertiary bg-bg-secondary">
        <p className="font-mono text-xs text-text-muted">No balance history data available</p>
      </div>
    )
  }

  // Format data with readable labels
  const formattedData = chartData.map((d) => ({
    ...d,
    blockLabel: formatNumber(BigInt(d.blockNumber)),
    balanceLabel: formatCurrency(d.balanceRaw, currencySymbol),
  }))

  return (
    <div className="h-64 w-full">
      <AreaChart
        data={formattedData}
        xKey="blockLabel"
        yKeys={[
          {
            key: 'balance',
            color: '#00D4FF',
            name: 'Balance',
            fillOpacity: 0.3,
          },
        ]}
        height={256}
        showGrid={true}
        showLegend={false}
        xAxisLabel="Block Number"
        yAxisLabel="Balance"
      />
    </div>
  )
}
