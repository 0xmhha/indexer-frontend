'use client'

import { LineChart } from '@/components/charts/LineChart'
import type { Block } from '@/types/graphql'

interface GasUsageTrendsChartProps {
  blocks: Block[]
}

interface ChartDataPoint {
  timestamp: number
  totalGasUsed: number
  totalGasLimit: number
  blockCount: number
  avgGasUsed?: number
  avgGasLimit?: number
  utilization?: string
}

export function GasUsageTrendsChart({ blocks }: GasUsageTrendsChartProps) {
  // Transform blocks data into chart-friendly format
  // Group blocks by hour and calculate average gas usage
  const chartData = blocks.reduce((acc: ChartDataPoint[], block: Block) => {
    const timestamp = Number(block.timestamp) * 1000
    const date = new Date(timestamp)
    const hour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours())
    const hourKey = hour.getTime()

    const gasUsed = Number(block.gasUsed)
    const gasLimit = Number(block.gasLimit)

    const existing = acc.find((item) => item.timestamp === hourKey)
    if (existing) {
      existing.totalGasUsed += gasUsed
      existing.totalGasLimit += gasLimit
      existing.blockCount += 1
    } else {
      acc.push({
        timestamp: hourKey,
        totalGasUsed: gasUsed,
        totalGasLimit: gasLimit,
        blockCount: 1,
      })
    }

    return acc
  }, [])

  // Calculate averages and utilization percentage
  chartData.forEach((item) => {
    item.avgGasUsed = Math.round(item.totalGasUsed / item.blockCount)
    item.avgGasLimit = Math.round(item.totalGasLimit / item.blockCount)
    item.utilization = ((item.totalGasUsed / item.totalGasLimit) * 100).toFixed(2)
  })

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
          key: 'avgGasUsed',
          color: '#00d9ff',
          name: 'Gas Used',
        },
        {
          key: 'avgGasLimit',
          color: '#ff9500',
          name: 'Gas Limit',
        },
      ]}
      height={300}
      showGrid={true}
      showLegend={true}
      xAxisLabel="Time (24h)"
      yAxisLabel="Gas"
    />
  )
}
