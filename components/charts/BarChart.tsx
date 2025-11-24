'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export interface BarChartProps {
  data: Array<Record<string, unknown>>
  xKey: string
  yKeys: Array<{
    key: string
    color: string
    name?: string
  }>
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  stacked?: boolean
  horizontal?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
}

export function BarChart({
  data,
  xKey,
  yKeys,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  horizontal = false,
  xAxisLabel,
  yAxisLabel,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        layout={horizontal ? 'vertical' : 'horizontal'}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />}
        <XAxis
          {...(!horizontal && { dataKey: xKey })}
          type={horizontal ? 'number' : 'category'}
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          {...(xAxisLabel && { label: { value: xAxisLabel, position: 'insideBottom', offset: -5 } })}
        />
        <YAxis
          {...(horizontal && { dataKey: xKey })}
          type={horizontal ? 'category' : 'number'}
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          {...(yAxisLabel && { label: { value: yAxisLabel, angle: -90, position: 'insideLeft' } })}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
          labelStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
          itemStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
            iconType="rect"
          />
        )}
        {yKeys.map((yKey) => (
          <Bar
            key={yKey.key}
            dataKey={yKey.key}
            fill={yKey.color}
            name={yKey.name || yKey.key}
            {...(stacked && { stackId: '1' })}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
