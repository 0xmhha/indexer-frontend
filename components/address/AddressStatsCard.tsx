'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatNumber, formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import { cn } from '@/lib/utils'
import { THRESHOLDS } from '@/lib/config/constants'
import { useAddressStats } from '@/lib/hooks/useAddress'

interface AddressStatsCardProps {
  address: string
  className?: string
}

interface StatItemProps {
  label: string
  value: string | number
  subValue?: string
  icon?: string
  color?: string
}

function StatItem({ label, value, subValue, icon, color = 'text-text-primary' }: StatItemProps) {
  return (
    <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-xs uppercase text-text-muted">{label}</div>
          <div className={cn('mt-1 font-mono text-xl font-bold', color)}>{value}</div>
          {subValue && (
            <div className="mt-0.5 font-mono text-xs text-text-muted">{subValue}</div>
          )}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
    </div>
  )
}

/**
 * Address Statistics Card
 *
 * Displays comprehensive statistics about an address's activity
 * using pre-computed backend stats for efficiency.
 */
export function AddressStatsCard({
  address,
  className,
}: AddressStatsCardProps) {
  const { stats, loading, error } = useAddressStats(address)

  if (loading) {
    return (
      <Card className={cn('mb-6', className)}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>ADDRESS STATISTICS</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error || !stats || stats.totalTransactions === 0) {
    return (
      <Card className={cn('mb-6', className)}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>ADDRESS STATISTICS</CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="font-mono text-sm text-text-muted">No transaction history</p>
        </CardContent>
      </Card>
    )
  }

  const totalTx = stats.sentCount + stats.receivedCount
  const successRate = totalTx > 0 ? (stats.successCount / totalTx) * 100 : 0

  return (
    <Card className={cn('mb-6', className)}>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>ADDRESS STATISTICS</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Transactions */}
          <StatItem
            label="Total Transactions"
            value={formatNumber(stats.totalTransactions)}
            subValue={`${stats.sentCount} sent / ${stats.receivedCount} received`}
            icon="📊"
            color="text-accent-blue"
          />

          {/* Success Rate */}
          <StatItem
            label="Success Rate"
            value={`${successRate.toFixed(1)}%`}
            subValue={`${stats.successCount} success / ${stats.failedCount} failed`}
            icon={successRate >= THRESHOLDS.SUCCESS_RATE_EXCELLENT ? '✅' : successRate >= THRESHOLDS.SUCCESS_RATE_GOOD ? '⚠️' : '❌'}
            color={
              successRate >= THRESHOLDS.SUCCESS_RATE_EXCELLENT
                ? 'text-accent-green'
                : successRate >= THRESHOLDS.SUCCESS_RATE_GOOD
                  ? 'text-yellow-500'
                  : 'text-accent-red'
            }
          />

          {/* Total Gas Spent */}
          <StatItem
            label="Total Gas Spent"
            value={formatCurrency(BigInt(stats.totalGasCost || '0'), env.currencySymbol)}
            subValue={`${formatNumber(BigInt(stats.totalGasUsed || '0'))} gas units`}
            icon="⛽"
            color="text-accent-purple"
          />

          {/* Unique Interactions */}
          <StatItem
            label="Unique Addresses"
            value={formatNumber(stats.uniqueAddressCount)}
            subValue={`${stats.contractInteractionCount} contract calls`}
            icon="🔗"
            color="text-accent-cyan"
          />
        </div>

        {/* Secondary Stats */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Value Sent */}
          <div className="flex items-center justify-between rounded border border-bg-tertiary bg-bg-secondary p-3">
            <div className="flex items-center gap-2">
              <span className="text-accent-red">↗️</span>
              <span className="font-mono text-xs text-text-muted">Total Value Sent</span>
            </div>
            <span className="font-mono text-sm font-bold text-accent-red">
              {formatCurrency(BigInt(stats.totalValueSent || '0'), env.currencySymbol)}
            </span>
          </div>

          {/* Value Received */}
          <div className="flex items-center justify-between rounded border border-bg-tertiary bg-bg-secondary p-3">
            <div className="flex items-center gap-2">
              <span className="text-accent-green">↘️</span>
              <span className="font-mono text-xs text-text-muted">Total Value Received</span>
            </div>
            <span className="font-mono text-sm font-bold text-accent-green">
              {formatCurrency(BigInt(stats.totalValueReceived || '0'), env.currencySymbol)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact version for sidebars or smaller displays
 */
export function AddressStatsCompact({
  address,
}: {
  address: string
}) {
  const { stats, loading } = useAddressStats(address)

  if (loading) {
    return <div className="animate-pulse font-mono text-xs text-text-muted">Loading...</div>
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-text-muted">Transactions:</span>
      <span className="font-mono text-sm font-bold text-accent-blue">
        {formatNumber(stats?.totalTransactions ?? 0)}
      </span>
    </div>
  )
}
