'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import type { TransformedBalanceSnapshot } from '@/lib/utils/graphql-transforms'

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

interface BalanceHistoryCardProps {
  history: TransformedBalanceSnapshot[]
  loading: boolean
  error: Error | null
}

/**
 * Transform TransformedBalanceSnapshot to chart-compatible format
 */
function transformHistoryForChart(
  history: TransformedBalanceSnapshot[]
): { blockNumber: string; balance: string; delta: string; transactionHash: string }[] {
  return history.map((entry) => ({
    blockNumber: entry.blockNumber.toString(),
    balance: entry.balance.toString(),
    delta: entry.delta.toString(),
    transactionHash: entry.transactionHash ?? '',
  }))
}

/**
 * Balance history chart card (SRP: Only displays chart)
 */
export function BalanceHistoryCard({ history, loading, error }: BalanceHistoryCardProps) {
  const chartHistory = useMemo(() => transformHistoryForChart(history), [history])

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>BALANCE HISTORY</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <ErrorDisplay title="Failed to load balance history" message={error.message} />
        ) : (
          <BalanceHistoryChart history={chartHistory} />
        )}
      </CardContent>
    </Card>
  )
}
