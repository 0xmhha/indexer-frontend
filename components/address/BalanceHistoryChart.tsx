'use client'

import { useMemo, memo } from 'react'
import { AreaChart } from '@/components/charts/AreaChart'
import { formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import { BLOCKCHAIN } from '@/lib/config/constants'

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

/**
 * Balance history chart component
 * Wrapped with React.memo to prevent unnecessary re-renders when props haven't changed
 */
function BalanceHistoryChartInner({ history, currencySymbol = env.currencySymbol }: BalanceHistoryChartProps) {
  // Process history data for chart with memoization to prevent unnecessary re-renders
  const formattedData = useMemo(() => {
    if (!history || history.length === 0) {return []}

    return history
      .map((entry) => {
        const blockNumber = Number(entry.blockNumber)
        const balanceRaw = BigInt(entry.balance)
        return {
          blockNumber,
          balance: Number(balanceRaw) / BLOCKCHAIN.WEI_PER_ETHER, // Convert wei to ether for display
          balanceRaw,
          // Use short block number for X-axis to prevent identical labels
          blockLabel: `#${blockNumber}`,
          balanceLabel: formatCurrency(balanceRaw, currencySymbol),
        }
      })
      .sort((a, b) => a.blockNumber - b.blockNumber) // Sort by block number ascending
  }, [history, currencySymbol])

  // Show empty state if no data
  if (formattedData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-bg-tertiary bg-bg-secondary">
        <p className="font-mono text-xs text-text-muted">No balance history data available</p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <AreaChart
        data={formattedData}
        xKey="blockLabel"
        yKeys={[
          {
            key: 'balance',
            color: '#00D4FF',
            name: 'Balance',
            fillOpacity: 0.3,
          },
        ]}
        height={256}
        showGrid={true}
        showLegend={false}
        xAxisLabel="Block Number"
        yAxisLabel="Balance"
      />
    </div>
  )
}

/**
 * Custom comparison function for React.memo
 * Only re-render if the history content has actually changed
 */
function arePropsEqual(
  prevProps: BalanceHistoryChartProps,
  nextProps: BalanceHistoryChartProps
): boolean {
  // If currencySymbol changed, re-render
  if (prevProps.currencySymbol !== nextProps.currencySymbol) {
    return false
  }

  // If history reference is the same, don't re-render
  if (prevProps.history === nextProps.history) {
    return true
  }

  // Deep compare history arrays
  const prev = prevProps.history
  const next = nextProps.history

  if (prev.length !== next.length) {
    return false
  }

  for (let i = 0; i < prev.length; i++) {
    const prevItem = prev[i]
    const nextItem = next[i]
    if (!prevItem || !nextItem) {return false}
    if (
      prevItem.blockNumber !== nextItem.blockNumber ||
      prevItem.balance !== nextItem.balance ||
      prevItem.delta !== nextItem.delta ||
      prevItem.transactionHash !== nextItem.transactionHash
    ) {
      return false
    }
  }

  return true
}

// Export memoized component to prevent unnecessary re-renders
export const BalanceHistoryChart = memo(BalanceHistoryChartInner, arePropsEqual)
