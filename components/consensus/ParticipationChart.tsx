'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  type TooltipProps,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useConsensusStore } from '@/stores/consensusStore'
import { CONSENSUS, UI } from '@/lib/config/constants'

/**
 * Participation Rate History Chart
 *
 * Displays a real-time chart of validator participation rates
 * using data from the consensus store (WebSocket updates)
 */
export function ParticipationChart() {
  const { recentBlocks, stats, isConnected } = useConsensusStore()

  // Transform block data for chart
  const chartData = useMemo(() => {
    return recentBlocks
      .slice()
      .reverse()
      .map((block) => ({
        blockNumber: block.blockNumber,
        participationRate: block.participationRate,
        roundChanged: block.roundChanged,
        timestamp: block.timestamp,
        label: `#${block.blockNumber.toLocaleString()}`,
      }))
  }, [recentBlocks])

  // Calculate stats from the data
  const chartStats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        roundChanges: 0,
      }
    }

    const rates = chartData.map((d) => d.participationRate)
    return {
      average: rates.reduce((a, b) => a + b, 0) / rates.length,
      min: Math.min(...rates),
      max: Math.max(...rates),
      roundChanges: chartData.filter((d) => d.roundChanged).length,
    }
  }, [chartData])

  // Custom tooltip render function
  const renderTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { active, payload } = props
    if (!active || !payload || payload.length === 0) {return null}

    const firstPayload = payload[0]
    if (!firstPayload?.payload) {return null}

    const data = firstPayload.payload as (typeof chartData)[0]
    return (
      <div className="rounded border border-bg-tertiary bg-bg-secondary p-3 shadow-lg">
        <p className="font-mono text-sm font-bold text-text-primary">Block #{data.blockNumber.toLocaleString()}</p>
        <p className="font-mono text-xs text-text-muted">
          {new Date(data.timestamp * 1000).toLocaleTimeString()}
        </p>
        <p
          className={`mt-1 font-mono text-lg font-bold ${
            data.participationRate >= CONSENSUS.PARTICIPATION_WARNING_THRESHOLD
              ? 'text-accent-green'
              : data.participationRate >= CONSENSUS.PARTICIPATION_CRITICAL_THRESHOLD
                ? 'text-yellow-400'
                : 'text-accent-red'
          }`}
        >
          {data.participationRate.toFixed(1)}%
        </p>
        {data.roundChanged && (
          <p className="mt-1 font-mono text-xs text-yellow-400">Round Changed</p>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>PARTICIPATION RATE HISTORY</CardTitle>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
            />
            <span className="font-mono text-xs text-text-muted">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Stats Summary */}
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded border border-bg-tertiary bg-bg-secondary p-3 text-center">
            <div className="font-mono text-xs text-text-muted">Average</div>
            <div className="font-mono text-lg font-bold text-accent-blue">
              {chartStats.average.toFixed(1)}%
            </div>
          </div>
          <div className="rounded border border-bg-tertiary bg-bg-secondary p-3 text-center">
            <div className="font-mono text-xs text-text-muted">Min</div>
            <div
              className={`font-mono text-lg font-bold ${
                chartStats.min >= CONSENSUS.PARTICIPATION_WARNING_THRESHOLD
                  ? 'text-accent-green'
                  : chartStats.min >= CONSENSUS.PARTICIPATION_CRITICAL_THRESHOLD
                    ? 'text-yellow-400'
                    : 'text-accent-red'
              }`}
            >
              {chartStats.min.toFixed(1)}%
            </div>
          </div>
          <div className="rounded border border-bg-tertiary bg-bg-secondary p-3 text-center">
            <div className="font-mono text-xs text-text-muted">Max</div>
            <div className="font-mono text-lg font-bold text-accent-green">
              {chartStats.max.toFixed(1)}%
            </div>
          </div>
          <div className="rounded border border-bg-tertiary bg-bg-secondary p-3 text-center">
            <div className="font-mono text-xs text-text-muted">Round Changes</div>
            <div
              className={`font-mono text-lg font-bold ${
                chartStats.roundChanges > 0 ? 'text-yellow-400' : 'text-accent-green'
              }`}
            >
              {chartStats.roundChanges}
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                <span className="font-mono text-sm text-text-muted">Waiting for blocks...</span>
              </div>
            ) : (
              <p className="font-mono text-sm text-text-muted">
                Connect to see participation history
              </p>
            )}
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="participationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d9ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#8b8b8b', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={{ stroke: '#2a2a2a' }}
                  axisLine={{ stroke: '#2a2a2a' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[
                    (dataMin: number) => Math.max(0, Math.floor(dataMin - UI.CHART_Y_AXIS_PADDING)),
                    CONSENSUS.DEFAULT_PARTICIPATION_RATE,
                  ]}
                  tick={{ fill: '#8b8b8b', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={{ stroke: '#2a2a2a' }}
                  axisLine={{ stroke: '#2a2a2a' }}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <Tooltip content={renderTooltip} />
                <ReferenceLine
                  y={CONSENSUS.PARTICIPATION_WARNING_THRESHOLD}
                  stroke="#fbbf24"
                  strokeDasharray="5 5"
                  label={{
                    value: 'Warning',
                    fill: '#fbbf24',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <ReferenceLine
                  y={CONSENSUS.PARTICIPATION_CRITICAL_THRESHOLD}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{
                    value: 'Critical',
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="participationRate"
                  stroke="#00d9ff"
                  strokeWidth={2}
                  fill="url(#participationGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    stroke: '#00d9ff',
                    strokeWidth: 2,
                    fill: '#0a0a0a',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Footer with current stats */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-bg-tertiary pt-4 font-mono text-xs text-text-muted">
          <span>
            Current Average:{' '}
            <span className="text-accent-blue">{stats.averageParticipation.toFixed(1)}%</span>
          </span>
          <span>
            Total Blocks: <span className="text-text-secondary">{stats.totalBlocks}</span>
          </span>
          <span>
            Round Changes: <span className="text-yellow-400">{stats.roundChanges}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact participation indicator for headers/sidebars
 */
export function ParticipationIndicator() {
  const { stats, latestBlock } = useConsensusStore()

  const rate = latestBlock?.participationRate ?? stats.averageParticipation

  const getColor = (value: number) => {
    if (value >= CONSENSUS.PARTICIPATION_WARNING_THRESHOLD) {return 'text-accent-green'}
    if (value >= CONSENSUS.PARTICIPATION_CRITICAL_THRESHOLD) {return 'text-yellow-400'}
    return 'text-accent-red'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="font-mono text-xs text-text-muted">Participation:</div>
      <div className={`font-mono text-sm font-bold ${getColor(rate)}`}>{rate.toFixed(1)}%</div>
    </div>
  )
}

/**
 * Mini participation sparkline for compact displays
 */
export function ParticipationSparkline() {
  const { recentBlocks } = useConsensusStore()

  // Get last blocks for sparkline
  const sparklineData = useMemo(() => {
    return recentBlocks
      .slice(0, UI.SPARKLINE_BLOCKS)
      .reverse()
      .map((block) => ({
        value: block.participationRate,
      }))
  }, [recentBlocks])

  if (sparklineData.length < 2) {
    return <div className="h-8 w-24 rounded bg-bg-tertiary" />
  }

  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00d9ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00d9ff"
            strokeWidth={1}
            fill="url(#sparklineGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
