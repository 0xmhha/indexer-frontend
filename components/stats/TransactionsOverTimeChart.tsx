'use client'

import { LineChart } from '@/components/charts/LineChart'
import type { Block } from '@/types/graphql'

interface TransactionsOverTimeChartProps {
  blocks: Block[]
}

interface ChartDataPoint {
  timestamp: number
  transactions: number
  blockCount: number
}

export function TransactionsOverTimeChart({ blocks }: TransactionsOverTimeChartProps) {
  // Transform blocks data into chart-friendly format
  // Group blocks by hour and sum transaction counts
  const chartData = blocks.reduce((acc: ChartDataPoint[], block: Block) => {
    const timestamp = Number(block.timestamp) * 1000
    const date = new Date(timestamp)
    const hour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours())
    const hourKey = hour.getTime()

    const existing = acc.find((item) => item.timestamp === hourKey)
    if (existing) {
      existing.transactions += block.transactionCount
      existing.blockCount += 1
    } else {
      acc.push({
        timestamp: hourKey,
        transactions: block.transactionCount,
        blockCount: 1,
      })
    }

    return acc
  }, [])

  // Sort by timestamp
  chartData.sort((a, b) => a.timestamp - b.timestamp)

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-mono text-xs text-text-muted">No data available</p>
      </div>
    )
  }

  // Format data with readable time labels
  const formattedData = chartData.map((d) => ({
    ...d,
    timeLabel: (() => {
      const date = new Date(d.timestamp)
      return `${date.getHours().toString().padStart(2, '0')}:00`
    })(),
  }))

  return (
    <LineChart
      data={formattedData}
      xKey="timeLabel"
      yKeys={[
        {
          key: 'transactions',
          color: '#00d9ff',
          name: 'Transactions',
        },
      ]}
      height={300}
      showGrid={true}
      showLegend={false}
      xAxisLabel="Time (24h)"
      yAxisLabel="Transaction Count"
    />
  )
}
