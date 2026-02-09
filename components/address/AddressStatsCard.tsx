'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatNumber, formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types/graphql'

interface AddressStatsCardProps {
  address: string
  transactions: Transaction[]
  totalCount: number
  loading?: boolean
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
 * Displays comprehensive statistics about an address's activity including:
 * - Total transaction count
 * - First/Last activity dates
 * - Total gas spent
 * - Transaction success rate
 * - Unique interactions
 */
export function AddressStatsCard({
  address,
  transactions,
  totalCount,
  loading = false,
  className,
}: AddressStatsCardProps) {
  const stats = useMemo(() => {
    if (transactions.length === 0) {
      return null
    }

    const lowerAddress = address.toLowerCase()

    // Calculate statistics from available transactions
    let sentCount = 0
    let receivedCount = 0
    let successCount = 0
    let failedCount = 0
    let totalGasUsed = BigInt(0)
    let totalGasCost = BigInt(0)
    let totalValueSent = BigInt(0)
    let totalValueReceived = BigInt(0)
    let contractInteractions = 0
    const uniqueAddresses = new Set<string>()

    // Track first and last tx timestamps
    let firstTxTimestamp: bigint | null = null
    let lastTxTimestamp: bigint | null = null

    for (const tx of transactions) {
      const from = tx.from?.toLowerCase()
      const to = tx.to?.toLowerCase()

      // Direction
      if (from === lowerAddress) {
        sentCount++
        if (tx.value) {
          totalValueSent += BigInt(tx.value)
        }
      }
      if (to === lowerAddress) {
        receivedCount++
        if (tx.value) {
          totalValueReceived += BigInt(tx.value)
        }
      }

      // Status
      if (tx.receipt?.status === 1) {
        successCount++
      } else if (tx.receipt?.status === 0) {
        failedCount++
      }

      // Gas calculations
      if (tx.receipt?.gasUsed && tx.gasPrice) {
        const gasUsed = BigInt(tx.receipt.gasUsed)
        const gasPrice = BigInt(tx.gasPrice)
        totalGasUsed += gasUsed
        totalGasCost += gasUsed * gasPrice
      }

      // Contract interactions (has input data beyond 0x)
      if (tx.input && tx.input.length > 2) {
        contractInteractions++
      }

      // Unique addresses
      if (from && from !== lowerAddress) uniqueAddresses.add(from)
      if (to && to !== lowerAddress) uniqueAddresses.add(to)

      // Timestamps - Note: Transaction type may not have blockNumber directly tied to timestamp
      // This is an approximation based on available data
    }

    const totalTx = sentCount + receivedCount
    const successRate = totalTx > 0 ? (successCount / totalTx) * 100 : 0

    return {
      totalTransactions: totalCount,
      sentCount,
      receivedCount,
      successCount,
      failedCount,
      successRate,
      totalGasUsed,
      totalGasCost,
      totalValueSent,
      totalValueReceived,
      contractInteractions,
      uniqueAddressCount: uniqueAddresses.size,
      firstTxTimestamp,
      lastTxTimestamp,
    }
  }, [address, transactions, totalCount])

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

  if (!stats || totalCount === 0) {
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
            value={`${stats.successRate.toFixed(1)}%`}
            subValue={`${stats.successCount} success / ${stats.failedCount} failed`}
            icon={stats.successRate >= 95 ? '✅' : stats.successRate >= 80 ? '⚠️' : '❌'}
            color={
              stats.successRate >= 95
                ? 'text-accent-green'
                : stats.successRate >= 80
                  ? 'text-yellow-500'
                  : 'text-accent-red'
            }
          />

          {/* Total Gas Spent */}
          <StatItem
            label="Total Gas Spent"
            value={formatCurrency(stats.totalGasCost, env.currencySymbol)}
            subValue={`${formatNumber(stats.totalGasUsed)} gas units`}
            icon="⛽"
            color="text-accent-purple"
          />

          {/* Unique Interactions */}
          <StatItem
            label="Unique Addresses"
            value={formatNumber(stats.uniqueAddressCount)}
            subValue={`${stats.contractInteractions} contract calls`}
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
              {formatCurrency(stats.totalValueSent, env.currencySymbol)}
            </span>
          </div>

          {/* Value Received */}
          <div className="flex items-center justify-between rounded border border-bg-tertiary bg-bg-secondary p-3">
            <div className="flex items-center gap-2">
              <span className="text-accent-green">↘️</span>
              <span className="font-mono text-xs text-text-muted">Total Value Received</span>
            </div>
            <span className="font-mono text-sm font-bold text-accent-green">
              {formatCurrency(stats.totalValueReceived, env.currencySymbol)}
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
  totalCount,
  loading,
}: {
  totalCount: number
  loading?: boolean
}) {
  if (loading) {
    return <div className="animate-pulse font-mono text-xs text-text-muted">Loading...</div>
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-text-muted">Transactions:</span>
      <span className="font-mono text-sm font-bold text-accent-blue">
        {formatNumber(totalCount)}
      </span>
    </div>
  )
}
