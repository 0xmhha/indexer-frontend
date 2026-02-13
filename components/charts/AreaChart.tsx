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
import { THRESHOLDS } from '@/lib/config/constants'
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
  /** Control XAxis tick interval. 'preserveStartEnd' shows first/last, number for fixed interval */
  xAxisInterval?: 'preserveStartEnd' | 'preserveStart' | 'preserveEnd' | number
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
  xAxisInterval = 'preserveStartEnd',
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray={GRID_DASH_ARRAY} stroke={GRID_STROKE} />}
        <XAxis
          dataKey={xKey}
          stroke={AXIS_STROKE}
          tick={AXIS_TICK}
          interval={xAxisInterval}
          allowDuplicatedCategory={false}
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
            fillOpacity={yKey.fillOpacity || THRESHOLDS.CHART_OPACITY}
            name={yKey.name || yKey.key}
            {...(stacked && { stackId: '1' })}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}
