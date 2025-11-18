'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BlocksOverTimeEntry {
  timestamp: string
  count: number
  averageGasUsed: string
}

interface BlocksOverTimeChartProps {
  data: BlocksOverTimeEntry[]
}

interface ChartDataPoint {
  timestamp: string
  count: number
  date: Date
}

export function BlocksOverTimeChart({ data }: BlocksOverTimeChartProps) {
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!data || data.length === 0) return []

    return data.map((entry) => ({
      timestamp: new Date(Number(entry.timestamp) * 1000).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
      }),
      count: entry.count,
      date: new Date(Number(entry.timestamp) * 1000),
    }))
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-bg-tertiary bg-bg-secondary">
        <p className="font-mono text-xs text-text-muted">No data available</p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.3} />
          <XAxis
            dataKey="timestamp"
            stroke="#718096"
            style={{ fontSize: '10px', fontFamily: 'monospace' }}
          />
          <YAxis
            stroke="#718096"
            style={{ fontSize: '10px', fontFamily: 'monospace' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A202C',
              border: '1px solid #2D3748',
              borderRadius: 0,
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
            labelStyle={{ color: '#00D4FF', marginBottom: '4px' }}
            formatter={(value: number) => [value, 'Blocks']}
          />
          <Bar dataKey="count" fill="#00D4FF" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
