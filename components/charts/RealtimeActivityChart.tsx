'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { usePendingTransactions } from '@/lib/hooks/useSubscriptions'
import { weiToGwei } from '@/lib/utils/gas'

interface ChartDataPoint {
  time: string
  txCount: number
  avgGasPrice: number
}

interface RealtimeActivityChartProps {
  timeWindowMinutes?: number
  updateIntervalMs?: number
  className?: string
}

/**
 * Real-time Activity Chart
 *
 * Displays live transaction activity and gas prices using WebSocket data.
 * Updates in real-time as new pending transactions arrive.
 *
 * @param timeWindowMinutes - Time window to display (default: 5 minutes)
 * @param updateIntervalMs - Update interval for aggregation (default: 5000ms)
 * @param className - Additional CSS classes
 */
export function RealtimeActivityChart({
  timeWindowMinutes = 5,
  updateIntervalMs = 5000,
  className,
}: RealtimeActivityChartProps) {
  const { pendingTransactions } = usePendingTransactions(100)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  // Aggregate data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const timeLabel = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      // Calculate average gas price from recent transactions
      const recentTxs = pendingTransactions.slice(0, 20)
      let avgGasPrice = 0

      if (recentTxs.length > 0) {
        const totalGasPrice = recentTxs.reduce((sum, tx) => {
          // Use gasPrice for legacy or maxFeePerGas for EIP-1559
          const price = tx.gasPrice || tx.maxFeePerGas || BigInt(0)
          return sum + Number(price)
        }, 0)
        avgGasPrice = totalGasPrice / recentTxs.length
      }

      const newDataPoint: ChartDataPoint = {
        time: timeLabel,
        txCount: recentTxs.length,
        avgGasPrice: weiToGwei(BigInt(Math.floor(avgGasPrice))),
      }

      setChartData((prev) => {
        const updated = [...prev, newDataPoint]
        // Keep only data within time window
        const maxDataPoints = Math.ceil((timeWindowMinutes * 60 * 1000) / updateIntervalMs)
        return updated.slice(-maxDataPoints)
      })
    }, updateIntervalMs)

    return () => clearInterval(interval)
  }, [pendingTransactions, timeWindowMinutes, updateIntervalMs])

  // Calculate statistics
  const currentTxCount = chartData.length > 0 ? chartData[chartData.length - 1]?.txCount ?? 0 : 0
  const currentGasPrice = chartData.length > 0 ? chartData[chartData.length - 1]?.avgGasPrice ?? 0 : 0
  const avgTxCount =
    chartData.length > 0 ? chartData.reduce((sum, d) => sum + d.txCount, 0) / chartData.length : 0
  const avgGasPrice =
    chartData.length > 0
      ? chartData.reduce((sum, d) => sum + d.avgGasPrice, 0) / chartData.length
      : 0

  return (
    <Card className={className}>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <span>REAL-TIME NETWORK ACTIVITY</span>
          <div className="flex items-center gap-2">
            <div className="flex h-2 w-2 animate-pulse rounded-full bg-accent-green" />
            <span className="font-mono text-[10px] text-accent-green">LIVE</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Current TX/Interval" value={currentTxCount.toString()} color="text-accent-cyan" />
          <StatCard
            label="Avg TX/Interval"
            value={avgTxCount.toFixed(1)}
            color="text-accent-blue"
          />
          <StatCard
            label="Current Gas Price"
            value={`${currentGasPrice.toFixed(2)} Gwei`}
            color="text-accent-orange"
          />
          <StatCard
            label="Avg Gas Price"
            value={`${avgGasPrice.toFixed(2)} Gwei`}
            color="text-accent-purple"
          />
        </div>

        {/* Chart */}
        <div className="h-80">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-2 font-mono text-sm text-text-muted">
                  Collecting data...
                </div>
                <div className="font-mono text-xs text-text-muted">
                  Chart will appear in {(updateIntervalMs / 1000).toFixed(0)} seconds
                </div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis
                  dataKey="time"
                  stroke="rgba(255, 255, 255, 0.5)"
                  style={{ fontSize: '10px' }}
                  tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="rgba(0, 255, 255, 0.8)"
                  style={{ fontSize: '10px' }}
                  tick={{ fill: 'rgba(0, 255, 255, 0.8)' }}
                  label={{
                    value: 'Transactions',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '10px', fill: 'rgba(0, 255, 255, 0.8)' },
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="rgba(255, 165, 0, 0.8)"
                  style={{ fontSize: '10px' }}
                  tick={{ fill: 'rgba(255, 165, 0, 0.8)' }}
                  label={{
                    value: 'Gas Price (Gwei)',
                    angle: 90,
                    position: 'insideRight',
                    style: { fontSize: '10px', fill: 'rgba(255, 165, 0, 0.8)' },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'rgba(255, 255, 255, 0.8)' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="line"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="txCount"
                  stroke="#00ffff"
                  strokeWidth={2}
                  dot={{ fill: '#00ffff', r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Transactions"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgGasPrice"
                  stroke="#ffa500"
                  strokeWidth={2}
                  dot={{ fill: '#ffa500', r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Gas Price (Gwei)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 border-t border-bg-tertiary pt-4">
          <div className="flex items-center justify-between font-mono text-xs text-text-muted">
            <span>Time Window: {timeWindowMinutes} minutes</span>
            <span>Update Interval: {(updateIntervalMs / 1000).toFixed(0)}s</span>
            <span>Data Points: {chartData.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  label: string
  value: string
  color: string
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="rounded border border-bg-tertiary bg-bg-secondary p-3">
      <div className="mb-1 font-mono text-xs text-text-muted">{label}</div>
      <div className={`font-mono text-lg font-bold ${color}`}>{value}</div>
    </div>
  )
}
