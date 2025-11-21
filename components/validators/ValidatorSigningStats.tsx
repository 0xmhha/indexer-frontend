'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useValidatorSigningStats, type ValidatorSigningStats } from '@/lib/hooks/useWBFT'
import { formatNumber, truncateAddress, formatHash } from '@/lib/utils/format'

interface ValidatorSigningStatsProps {
  maxStats?: number
}

/**
 * Validator Signing Statistics Dashboard
 *
 * Displays validator signing performance metrics including:
 * - Total blocks vs signed blocks
 * - Signing rate percentage
 * - Missed blocks tracking
 * - Performance trends
 */
export function ValidatorSigningStatsDashboard({ maxStats = 50 }: ValidatorSigningStatsProps) {
  const [validatorFilter, setValidatorFilter] = useState('')
  const [epochFilter, setEpochFilter] = useState('')

  const {
    stats,
    totalCount,
    loading,
    error,
    refetch,
  } = useValidatorSigningStats({
    limit: maxStats,
    ...(validatorFilter && { validator: validatorFilter }),
    ...(epochFilter && { epochNumber: epochFilter }),
  })

  const handleValidatorFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidatorFilter(e.target.value)
  }

  const handleEpochFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEpochFilter(e.target.value)
  }

  const handleClearFilters = () => {
    setValidatorFilter('')
    setEpochFilter('')
  }

  // Calculate aggregate statistics
  const totalBlocks = stats.reduce((sum, stat) => sum + stat.totalBlocks, 0)
  const totalMissed = stats.reduce((sum, stat) => sum + stat.missedBlocks, 0)
  const avgSigningRate = stats.length > 0
    ? stats.reduce((sum, stat) => sum + stat.signingRate, 0) / stats.length
    : 0

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="VALIDATORS" value={formatNumber(totalCount)} icon="⚡" color="text-accent-blue" />
        <StatCard
          label="AVG SIGNING RATE"
          value={`${avgSigningRate.toFixed(2)}%`}
          icon="📊"
          color="text-accent-green"
        />
        <StatCard label="TOTAL BLOCKS" value={formatNumber(totalBlocks)} icon="📦" color="text-accent-cyan" />
        <StatCard label="MISSED BLOCKS" value={formatNumber(totalMissed)} icon="⚠️" color="text-accent-red" />
      </div>

      {/* Filters and Data Table */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>VALIDATOR SIGNING STATISTICS</CardTitle>
            <button
              onClick={() => refetch()}
              className="rounded border border-bg-tertiary bg-bg-secondary px-3 py-1 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue"
              aria-label="Refresh statistics"
            >
              ↻
            </button>
          </div>
        </CardHeader>

        {/* Filters */}
        <div className="border-b border-bg-tertiary bg-bg-secondary p-4">
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                value={validatorFilter}
                onChange={handleValidatorFilterChange}
                placeholder="Filter by validator address..."
                className="rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
              />
              <input
                type="text"
                value={epochFilter}
                onChange={handleEpochFilterChange}
                placeholder="Filter by epoch number..."
                className="rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
              />
            </div>
            {(validatorFilter || epochFilter) && (
              <button
                onClick={handleClearFilters}
                className="rounded border border-bg-tertiary bg-bg-primary px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue"
              >
                CLEAR FILTERS
              </button>
            )}
          </div>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorDisplay title="Failed to load signing statistics" message={error.message} />
            </div>
          ) : stats.length === 0 ? (
            <div className="flex h-96 items-center justify-center">
              <p className="font-mono text-sm text-text-muted">No signing statistics found</p>
            </div>
          ) : (
            <div className="divide-y divide-bg-tertiary">
              {stats.map((stat, idx) => (
                <ValidatorStatCard key={`${stat.validator}-${stat.epochNumber}-${idx}`} stat={stat} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="annotation mb-2">{label}</div>
            <div className="font-mono text-2xl font-bold text-accent-blue">{value}</div>
          </div>
          <div className={`font-mono text-3xl ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function ValidatorStatCard({ stat }: { stat: ValidatorSigningStats }) {
  const getPerformanceColor = (rate: number) => {
    if (rate >= 95) return 'text-accent-green'
    if (rate >= 80) return 'text-accent-cyan'
    if (rate >= 60) return 'text-accent-yellow'
    return 'text-accent-red'
  }

  const getPerformanceBgColor = (rate: number) => {
    if (rate >= 95) return 'bg-accent-green'
    if (rate >= 80) return 'bg-accent-cyan'
    if (rate >= 60) return 'bg-accent-yellow'
    return 'bg-accent-red'
  }

  const performanceColor = getPerformanceColor(stat.signingRate)
  const performanceBgColor = getPerformanceBgColor(stat.signingRate)

  return (
    <div className="p-4 transition-colors hover:bg-bg-secondary">
      <div className="flex flex-col gap-4">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-text-primary" title={stat.validator}>
                {truncateAddress(stat.validator)}
              </span>
              <span className="rounded border border-bg-tertiary bg-bg-secondary px-2 py-0.5 font-mono text-xs text-text-muted">
                EPOCH {stat.epochNumber}
              </span>
            </div>
          </div>
          <div className={`font-mono text-xl font-bold ${performanceColor}`}>{stat.signingRate.toFixed(2)}%</div>
        </div>

        {/* Performance Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-text-muted">
            <span>Signing Performance</span>
            <span>
              {stat.signedBlocks} / {stat.totalBlocks} blocks
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-bg-tertiary">
            <div
              className={`h-full transition-all ${performanceBgColor}`}
              style={{ width: `${Math.min(stat.signingRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatItem label="Total Blocks" value={formatNumber(stat.totalBlocks)} />
          <StatItem label="Signed Blocks" value={formatNumber(stat.signedBlocks)} color="text-accent-green" />
          <StatItem label="Missed Blocks" value={formatNumber(stat.missedBlocks)} color="text-accent-red" />
          <StatItem
            label="Block Range"
            value={`${formatNumber(BigInt(stat.startBlock))} - ${formatNumber(BigInt(stat.endBlock))}`}
          />
        </div>

        {/* Last Activity */}
        <div className="grid gap-2 sm:grid-cols-2">
          {stat.lastSignedBlock && (
            <div className="font-mono text-xs text-text-muted">
              Last Signed:{' '}
              <span className="text-text-secondary" title={stat.lastSignedBlock}>
                {formatHash(stat.lastSignedBlock)}
              </span>
            </div>
          )}
          {stat.lastMissedBlock && (
            <div className="font-mono text-xs text-text-muted">
              Last Missed:{' '}
              <span className="text-accent-red" title={stat.lastMissedBlock}>
                {formatHash(stat.lastMissedBlock)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-xs text-text-muted">{label}</div>
      <div className={`font-mono text-sm ${color || 'text-text-secondary'}`}>{value}</div>
    </div>
  )
}
