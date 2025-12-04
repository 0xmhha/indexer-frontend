'use client'

import { useMemo, memo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'

// Lazy load heavy chart component
const BalanceHistoryChart = dynamic(
  () => import('@/components/address/BalanceHistoryChart').then((mod) => ({ default: mod.BalanceHistoryChart })),
  {
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
)

// Raw balance history entry from GraphQL (strings)
interface BalanceHistoryEntry {
  blockNumber: string
  balance: string
  delta: string
  transactionHash: string | null
}

interface BalanceHistoryCardProps {
  history: BalanceHistoryEntry[]
  loading: boolean
  error: Error | null
}

/**
 * Transform history to chart-compatible format
 */
function transformHistoryForChart(
  history: BalanceHistoryEntry[]
): { blockNumber: string; balance: string; delta: string; transactionHash: string }[] {
  return history.map((entry) => ({
    blockNumber: entry.blockNumber,
    balance: entry.balance,
    delta: entry.delta,
    transactionHash: entry.transactionHash ?? '',
  }))
}

/**
 * Empty state component
 */
function EmptyHistoryState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center">
      <p className="text-sm text-text-muted">No balance changes found</p>
      <p className="mt-2 text-xs text-text-muted">
        Balance history will appear when transactions affect this address
      </p>
    </div>
  )
}

/**
 * Balance history chart card (SRP: Only displays chart)
 * Memoized to prevent unnecessary re-renders
 */
function BalanceHistoryCardInner({ history, loading, error }: BalanceHistoryCardProps) {
  const chartHistory = useMemo(() => transformHistoryForChart(history), [history])

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center gap-2">
          BALANCE HISTORY
          {history.length > 0 && (
            <span className="text-xs font-normal text-text-muted">
              {history.length} changes
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <ErrorDisplay title="Failed to load balance history" message={error.message} />
        ) : chartHistory.length === 0 ? (
          <EmptyHistoryState />
        ) : (
          <BalanceHistoryChart history={chartHistory} />
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Custom comparison for React.memo
 * Only re-render if history content actually changed
 */
function arePropsEqual(
  prevProps: BalanceHistoryCardProps,
  nextProps: BalanceHistoryCardProps
): boolean {
  // Loading or error state change should re-render
  if (prevProps.loading !== nextProps.loading) {return false}
  if (prevProps.error !== nextProps.error) {return false}

  // If history reference is the same, don't re-render
  if (prevProps.history === nextProps.history) {return true}

  // Deep compare history
  const prev = prevProps.history
  const next = nextProps.history

  if (prev.length !== next.length) {return false}

  for (let i = 0; i < prev.length; i++) {
    const prevItem = prev[i]
    const nextItem = next[i]
    if (!prevItem || !nextItem) {return false}
    if (
      prevItem.blockNumber !== nextItem.blockNumber ||
      prevItem.balance !== nextItem.balance
    ) {
      return false
    }
  }

  return true
}

export const BalanceHistoryCard = memo(BalanceHistoryCardInner, arePropsEqual)
