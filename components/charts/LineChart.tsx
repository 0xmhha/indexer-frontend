'use client'

import {
  LineChart as RechartsLineChart,
  Line,
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

export interface LineChartProps {
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
  xAxisLabel?: string
  yAxisLabel?: string
}

export function LineChart({
  data,
  xKey,
  yKeys,
  height = 300,
  showGrid = true,
  showLegend = true,
  xAxisLabel,
  yAxisLabel,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray={GRID_DASH_ARRAY} stroke={GRID_STROKE} />}
        <XAxis
          dataKey={xKey}
          stroke={AXIS_STROKE}
          tick={AXIS_TICK}
          {...(xAxisLabel && { label: { value: xAxisLabel, position: 'insideBottom', offset: -5 } })}
        />
        <YAxis
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
            iconType="line"
          />
        )}
        {yKeys.map((yKey) => (
          <Line
            key={yKey.key}
            type="monotone"
            dataKey={yKey.key}
            stroke={yKey.color}
            strokeWidth={2}
            dot={false}
            name={yKey.name || yKey.key}
            activeDot={{ r: 4 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
