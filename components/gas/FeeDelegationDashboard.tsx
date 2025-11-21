'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useFeeDelegationStats } from '@/lib/hooks/useAnalytics'
import { formatCurrency, formatHash, formatNumber } from '@/lib/utils/format'
import { env } from '@/lib/config/env'

interface FeeDelegationDashboardProps {
  className?: string
}

/**
 * Fee Delegation Dashboard
 *
 * Displays comprehensive statistics about Fee Delegation usage on the network.
 * Shows top fee payers, adoption rates, and total fees saved by users.
 *
 * @param className - Additional CSS classes
 */
export function FeeDelegationDashboard({ className }: FeeDelegationDashboardProps) {
  const { stats, loading, error } = useFeeDelegationStats()

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
                threshold={5}
                current={stats.adoptionRate}
                reached={stats.adoptionRate >= 5}
              />
              <AdoptionMilestone
                label="Growing Usage"
                threshold={15}
                current={stats.adoptionRate}
                reached={stats.adoptionRate >= 15}
              />
              <AdoptionMilestone
                label="Mainstream"
                threshold={30}
                current={stats.adoptionRate}
                reached={stats.adoptionRate >= 30}
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

interface StatCardProps {
  label: string
  value: string
  icon: string
  color: string
  description: string
}

function StatCard({ label, value, icon, color, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="annotation mb-2">{label}</div>
            <div className={`mb-1 font-mono text-2xl font-bold ${color}`}>{value}</div>
            <div className="font-mono text-xs text-text-muted">{description}</div>
          </div>
          <div className="text-3xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AdoptionMilestoneProps {
  label: string
  threshold: number
  current: number
  reached: boolean
}

function AdoptionMilestone({ label, threshold, current, reached }: AdoptionMilestoneProps) {
  return (
    <div
      className={`rounded border p-3 ${
        reached
          ? 'border-accent-green/30 bg-accent-green/5'
          : 'border-bg-tertiary bg-bg-secondary'
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className={`text-lg ${reached ? 'text-accent-green' : 'text-text-muted'}`}>
          {reached ? '✓' : '○'}
        </span>
        <span
          className={`font-mono text-xs font-bold ${
            reached ? 'text-accent-green' : 'text-text-secondary'
          }`}
        >
          {label}
        </span>
      </div>
      <div className="font-mono text-xs text-text-muted">
        {threshold}% threshold {reached ? 'reached' : `(${(threshold - current).toFixed(1)}% to go)`}
      </div>
    </div>
  )
}

interface BenefitCardProps {
  icon: string
  title: string
  description: string
  color: string
}

function BenefitCard({ icon, title, description, color }: BenefitCardProps) {
  return (
    <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
      <div className="mb-2 text-3xl">{icon}</div>
      <div className={`mb-2 font-mono text-sm font-bold ${color}`}>{title}</div>
      <div className="font-mono text-xs text-text-secondary">{description}</div>
    </div>
  )
}
