'use client'

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export interface AreaChartProps {
  data: Array<Record<string, unknown>>
  xKey: string
  yKeys: Array<{
    key: string
    color: string
    name?: string
    fillOpacity?: number
  }>
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  stacked?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
}

export function AreaChart({
  data,
  xKey,
  yKeys,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  xAxisLabel,
  yAxisLabel,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />}
        <XAxis
          dataKey={xKey}
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          {...(xAxisLabel && { label: { value: xAxisLabel, position: 'insideBottom', offset: -5 } })}
        />
        <YAxis
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
          <Area
            key={yKey.key}
            type="monotone"
            dataKey={yKey.key}
            stroke={yKey.color}
            fill={yKey.color}
            fillOpacity={yKey.fillOpacity || 0.6}
            name={yKey.name || yKey.key}
            {...(stacked && { stackId: '1' })}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}
