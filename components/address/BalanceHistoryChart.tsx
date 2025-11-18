'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatNumber } from '@/lib/utils/format'
import { env } from '@/lib/config/env'

interface BalanceHistoryEntry {
  blockNumber: string
  balance: string
  delta: string
  transactionHash: string
}

interface BalanceHistoryChartProps {
  history: BalanceHistoryEntry[]
  currencySymbol?: string
}

interface ChartDataPoint {
  blockNumber: number
  balance: number
  balanceRaw: bigint
}

export function BalanceHistoryChart({ history, currencySymbol = env.currencySymbol }: BalanceHistoryChartProps) {
  // Process history data for chart
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!history || history.length === 0) return []

    return history
      .map((entry) => ({
        blockNumber: Number(entry.blockNumber),
        balance: Number(BigInt(entry.balance)) / 1e18, // Convert wei to ether for display
        balanceRaw: BigInt(entry.balance),
      }))
      .sort((a, b) => a.blockNumber - b.blockNumber) // Sort by block number ascending
  }, [history])

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-bg-tertiary bg-bg-secondary">
        <p className="font-mono text-xs text-text-muted">No balance history data available</p>
      </div>
    )
  }

  // Calculate min/max for Y axis
  const balances = chartData.map((d) => d.balance)
  const minBalance = Math.min(...balances)
  const maxBalance = Math.max(...balances)
  const padding = (maxBalance - minBalance) * 0.1 || 1 // 10% padding or 1 if same

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.3} />
          <XAxis
            dataKey="blockNumber"
            stroke="#718096"
            style={{ fontSize: '10px', fontFamily: 'monospace' }}
            tickFormatter={(value: number) => formatNumber(BigInt(value))}
          />
          <YAxis
            stroke="#718096"
            style={{ fontSize: '10px', fontFamily: 'monospace' }}
            domain={[minBalance - padding, maxBalance + padding]}
            tickFormatter={(value: number) => value.toFixed(4)}
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
            formatter={(_value: number, _name: string, props) => {
              const dataPoint = props.payload as ChartDataPoint
              return [formatCurrency(dataPoint.balanceRaw, currencySymbol), 'Balance']
            }}
            labelFormatter={(label: number) => `Block #${formatNumber(BigInt(label))}`}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#00D4FF"
            strokeWidth={2}
            dot={{ fill: '#00D4FF', r: 3 }}
            activeDot={{ r: 5, fill: '#00D4FF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
