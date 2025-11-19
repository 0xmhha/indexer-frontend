'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis
          dataKey="timestamp"
          stroke="#808080"
          tick={{ fill: '#808080', fontSize: 12 }}
          tickFormatter={(timestamp) => {
            const date = new Date(timestamp)
            return `${date.getHours()}:00`
          }}
        />
        <YAxis stroke="#808080" tick={{ fill: '#808080', fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '4px',
            fontFamily: 'monospace',
          }}
          labelStyle={{ color: '#00d9ff', fontSize: 12 }}
          itemStyle={{ color: '#ffffff', fontSize: 12 }}
          labelFormatter={(timestamp) => {
            const date = new Date(timestamp)
            return `${date.toLocaleDateString()} ${date.getHours()}:00`
          }}
          formatter={(value: number, name: string) => {
            if (name === 'utilization') {
              return [`${value}%`, 'Utilization']
            }
            return [value.toLocaleString(), name === 'avgGasUsed' ? 'Avg Gas Used' : 'Avg Gas Limit']
          }}
        />
        <Legend
          wrapperStyle={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#808080',
          }}
        />
        <Line
          type="monotone"
          dataKey="avgGasUsed"
          stroke="#00d9ff"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          name="Gas Used"
        />
        <Line
          type="monotone"
          dataKey="avgGasLimit"
          stroke="#ff9500"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          name="Gas Limit"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
