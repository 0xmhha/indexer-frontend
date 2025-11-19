'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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
          formatter={(value: number) => [value.toLocaleString(), 'Transactions']}
        />
        <Line
          type="monotone"
          dataKey="transactions"
          stroke="#00d9ff"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
