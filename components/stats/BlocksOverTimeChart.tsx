'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  BLOCKS_TOOLTIP_CONTENT_STYLE,
  BLOCKS_TOOLTIP_LABEL_STYLE,
  BLOCKS_AXIS_STROKE,
  BLOCKS_AXIS_STYLE,
  BLOCKS_GRID_STROKE,
  BLOCKS_GRID_OPACITY,
  GRID_DASH_ARRAY,
} from '@/lib/config/chartTheme'

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
    if (!data || data.length === 0) {return []}

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
          <CartesianGrid strokeDasharray={GRID_DASH_ARRAY} stroke={BLOCKS_GRID_STROKE} opacity={BLOCKS_GRID_OPACITY} />
          <XAxis
            dataKey="timestamp"
            stroke={BLOCKS_AXIS_STROKE}
            style={BLOCKS_AXIS_STYLE}
          />
          <YAxis
            stroke={BLOCKS_AXIS_STROKE}
            style={BLOCKS_AXIS_STYLE}
          />
          <Tooltip
            contentStyle={BLOCKS_TOOLTIP_CONTENT_STYLE}
            labelStyle={BLOCKS_TOOLTIP_LABEL_STYLE}
            formatter={(value: number) => [value, 'Blocks']}
          />
          <Bar dataKey="count" fill="#00D4FF" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
