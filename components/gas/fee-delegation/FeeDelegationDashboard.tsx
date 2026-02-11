'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useFeeDelegationStats } from '@/lib/hooks/useAnalytics'
import { formatCurrency, formatHash, formatNumber } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import { THRESHOLDS } from '@/lib/config/constants'
import { cn } from '@/lib/utils'
import { TIME_PERIODS, type TimePeriodId, type FeeDelegationDashboardProps } from './types'
import { StatCard } from './StatCard'
import { AdoptionMilestone } from './AdoptionMilestone'
import { BenefitCard } from './BenefitCard'

export function FeeDelegationDashboard({ className }: FeeDelegationDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriodId>('all')

  const timeFilter = useMemo(() => {
    if (selectedPeriod === 'all') return {}
    const now = Math.floor(Date.now() / 1000)
    const periods: Record<string, number> = {
      '24h': 24 * 60 * 60,
      '7d': 7 * 24 * 60 * 60,
      '30d': 30 * 24 * 60 * 60,
    }
    const seconds = periods[selectedPeriod]
    if (!seconds) return {}
    return {
      fromTime: String(now - seconds),
      toTime: String(now),
    }
  }, [selectedPeriod])

  const { stats, loading, error } = useFeeDelegationStats(timeFilter)

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex h-64 items-center justify-center p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error || !stats) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <ErrorDisplay
            title="Failed to load Fee Delegation statistics"
            message={'No data available'}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Time Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {TIME_PERIODS.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={cn(
                'rounded border px-3 py-1.5 font-mono text-xs transition-colors',
                selectedPeriod === period.id
                  ? 'border-accent-purple bg-accent-purple/10 text-accent-purple'
                  : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-purple/50'
              )}
              title={period.description}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Fee Delegated Txs"
          value={formatNumber(stats.totalFeeDelegatedTxs)}
          icon="📝"
          color="text-accent-purple"
          description="Transactions using fee delegation"
        />
        <StatCard
          label="Total Fees Saved"
          value={formatCurrency(stats.totalFeesSaved, env.currencySymbol)}
          icon="💰"
          color="text-accent-green"
          description="User savings from fee delegation"
        />
        <StatCard
          label="Adoption Rate"
          value={`${stats.adoptionRate.toFixed(1)}%`}
          icon="📊"
          color="text-accent-blue"
          description="Percentage of all transactions"
        />
        <StatCard
          label="Avg Fee Saved"
          value={formatCurrency(stats.avgFeeSaved, env.currencySymbol)}
          icon="💎"
          color="text-accent-cyan"
          description="Average per delegated transaction"
        />
      </div>

      {/* Adoption Progress Bar */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>ADOPTION PROGRESS</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between font-mono text-xs text-text-secondary">
                <span>Network Adoption Rate</span>
                <span>{stats.adoptionRate.toFixed(2)}%</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-bg-primary">
                <div
                  className="h-full bg-gradient-to-r from-accent-purple to-accent-blue transition-all"
                  style={{ width: `${Math.min(stats.adoptionRate, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <AdoptionMilestone
                label="Early Adoption"
                threshold={THRESHOLDS.ADOPTION_EARLY}
                current={stats.adoptionRate}
                reached={stats.adoptionRate >= THRESHOLDS.ADOPTION_EARLY}
              />
              <AdoptionMilestone
                label="Growing Usage"
                threshold={THRESHOLDS.ADOPTION_GROWING}
                current={stats.adoptionRate}
                reached={stats.adoptionRate >= THRESHOLDS.ADOPTION_GROWING}
              />
              <AdoptionMilestone
                label="Mainstream"
                threshold={THRESHOLDS.ADOPTION_MAINSTREAM}
                current={stats.adoptionRate}
                reached={stats.adoptionRate >= THRESHOLDS.ADOPTION_MAINSTREAM}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Fee Payers */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center justify-between">
            <span>TOP FEE PAYERS</span>
            <span className="font-mono text-xs text-text-secondary">
              Sponsoring {formatNumber(stats.totalFeeDelegatedTxs)} transactions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RANK</TableHead>
                  <TableHead>FEE PAYER ADDRESS</TableHead>
                  <TableHead className="text-right">TXS SPONSORED</TableHead>
                  <TableHead className="text-right">TOTAL FEES PAID</TableHead>
                  <TableHead className="text-right">SHARE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topFeePayers.map((feePayer, index) => (
                  <TableRow key={feePayer.address}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-sm font-bold ${
                            index === 0
                              ? 'text-accent-green'
                              : index === 1
                                ? 'text-accent-blue'
                                : index === 2
                                  ? 'text-accent-cyan'
                                  : 'text-text-secondary'
                          }`}
                        >
                          #{index + 1}
                        </span>
                        {index === 0 && <span className="text-xs">🥇</span>}
                        {index === 1 && <span className="text-xs">🥈</span>}
                        {index === 2 && <span className="text-xs">🥉</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/address/${feePayer.address}`}
                        className="font-mono text-accent-blue hover:text-accent-cyan"
                      >
                        {formatHash(feePayer.address, true)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(feePayer.txCount)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(feePayer.totalFeesPaid, env.currencySymbol)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 overflow-hidden rounded-full bg-bg-primary">
                          <div
                            className="h-2 bg-accent-purple"
                            style={{ width: `${feePayer.percentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-text-secondary">
                          {feePayer.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Summary */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>FEE DELEGATION BENEFITS</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <BenefitCard
              icon="🎯"
              title="User Experience"
              description="Gasless transactions improve onboarding and user retention"
              color="text-accent-purple"
            />
            <BenefitCard
              icon="💼"
              title="Business Model"
              description="Sponsor user transactions to drive adoption and engagement"
              color="text-accent-blue"
            />
            <BenefitCard
              icon="🔐"
              title="Security"
              description="Fee payers verified on-chain with cryptographic signatures"
              color="text-accent-green"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
