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
import {
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE,
  AXIS_STROKE,
  AXIS_TICK,
  GRID_STROKE,
  GRID_DASH_ARRAY,
  LEGEND_WRAPPER_STYLE,
} from '@/lib/config/chartTheme'

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
        {showGrid && <CartesianGrid strokeDasharray={GRID_DASH_ARRAY} stroke={GRID_STROKE} />}
        <XAxis
          {...(!horizontal && { dataKey: xKey })}
          type={horizontal ? 'number' : 'category'}
          stroke={AXIS_STROKE}
          tick={AXIS_TICK}
          {...(xAxisLabel && { label: { value: xAxisLabel, position: 'insideBottom', offset: -5 } })}
        />
        <YAxis
          {...(horizontal && { dataKey: xKey })}
          type={horizontal ? 'category' : 'number'}
          stroke={AXIS_STROKE}
          tick={AXIS_TICK}
          {...(yAxisLabel && { label: { value: yAxisLabel, angle: -90, position: 'insideLeft' } })}
        />
        <Tooltip
          contentStyle={TOOLTIP_CONTENT_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          itemStyle={TOOLTIP_ITEM_STYLE}
        />
        {showLegend && (
          <Legend
            wrapperStyle={LEGEND_WRAPPER_STYLE}
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
