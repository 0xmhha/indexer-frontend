'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useValidatorSigningStats, type ValidatorSigningStats } from '@/lib/hooks/useWBFT'
import { formatNumber, truncateAddress } from '@/lib/utils/format'
import { UI } from '@/lib/config/constants'

interface ValidatorSigningStatsProps {
  maxStats?: number
}

/**
 * Validator Signing Statistics Dashboard
 *
 * Displays validator signing performance metrics including:
 * - Signing rate percentage
 * - Prepare/Commit sign and miss counts
 * - Block range statistics
 */
export function ValidatorSigningStatsDashboard({ maxStats = UI.MAX_VIEWER_ITEMS }: ValidatorSigningStatsProps) {
  const [fromBlockFilter, setFromBlockFilter] = useState('')
  const [toBlockFilter, setToBlockFilter] = useState('')

  const {
    stats,
    totalCount,
    loading,
    error,
    refetch,
  } = useValidatorSigningStats({
    limit: maxStats,
    // Only override defaults if filter values are provided
    ...(fromBlockFilter && { fromBlock: fromBlockFilter }),
    ...(toBlockFilter && { toBlock: toBlockFilter }),
  })

  const handleFromBlockFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromBlockFilter(e.target.value)
  }

  const handleToBlockFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToBlockFilter(e.target.value)
  }

  const handleClearFilters = () => {
    setFromBlockFilter('')
    setToBlockFilter('')
  }

  // Calculate aggregate statistics (counts are strings from backend)
  const totalSigned = stats.reduce((sum, stat) => sum + parseInt(stat.prepareSignCount || '0', 10) + parseInt(stat.commitSignCount || '0', 10), 0)
  const totalMissed = stats.reduce((sum, stat) => sum + parseInt(stat.prepareMissCount || '0', 10) + parseInt(stat.commitMissCount || '0', 10), 0)
  const avgSigningRate = stats.length > 0
    ? stats.reduce((sum, stat) => sum + stat.signingRate, 0) / stats.length
    : 0

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="VALIDATORS"
          value={formatNumber(totalCount)}
          icon="⚡"
          color="text-accent-blue"
          tooltip="현재 조회된 밸리데이터의 총 수"
        />
        <StatCard
          label="AVG SIGNING RATE"
          value={`${avgSigningRate.toFixed(2)}%`}
          icon="📊"
          color="text-accent-green"
          tooltip="모든 밸리데이터의 평균 서명 성공률 (높을수록 네트워크 참여도가 좋음)"
        />
        <StatCard
          label="TOTAL SIGNED"
          value={formatNumber(totalSigned)}
          icon="✓"
          color="text-accent-cyan"
          tooltip="모든 밸리데이터의 Prepare + Commit 서명 성공 횟수 합계"
        />
        <StatCard
          label="TOTAL MISSED"
          value={formatNumber(totalMissed)}
          icon="⚠️"
          color="text-accent-red"
          tooltip="모든 밸리데이터의 Prepare + Commit 서명 실패 횟수 합계 (낮을수록 좋음)"
        />
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
                value={fromBlockFilter}
                onChange={handleFromBlockFilterChange}
                placeholder="From block number..."
                className="rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
              />
              <input
                type="text"
                value={toBlockFilter}
                onChange={handleToBlockFilterChange}
                placeholder="To block number..."
                className="rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
              />
            </div>
            {(fromBlockFilter || toBlockFilter) && (
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
                <ValidatorStatCard key={`${stat.validatorAddress}-${stat.validatorIndex}-${idx}`} stat={stat} />
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
  tooltip,
}: {
  label: string
  value: string
  icon: string
  color: string
  tooltip?: string
}) {
  return (
    <Card className="group relative">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="annotation mb-2 flex items-center gap-1">
              {label}
              {tooltip && (
                <span className="cursor-help text-text-muted">ⓘ</span>
              )}
            </div>
            <div className="font-mono text-2xl font-bold text-accent-blue">{value}</div>
          </div>
          <div className={`font-mono text-3xl ${color}`}>{icon}</div>
        </div>
        {/* Tooltip */}
        {tooltip && (
          <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg border border-bg-tertiary bg-bg-primary p-3 font-mono text-xs text-text-secondary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-bg-tertiary" />
            {tooltip}
          </div>
        )}
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

  // Calculate totals from prepare and commit counts (counts are strings)
  const prepareSignCount = parseInt(stat.prepareSignCount || '0', 10)
  const commitSignCount = parseInt(stat.commitSignCount || '0', 10)
  const prepareMissCount = parseInt(stat.prepareMissCount || '0', 10)
  const commitMissCount = parseInt(stat.commitMissCount || '0', 10)
  const totalSigned = prepareSignCount + commitSignCount
  const totalMissed = prepareMissCount + commitMissCount

  return (
    <div className="p-4 transition-colors hover:bg-bg-secondary">
      <div className="flex flex-col gap-4">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-text-primary" title={stat.validatorAddress}>
                {truncateAddress(stat.validatorAddress)}
              </span>
              <span className="rounded border border-bg-tertiary bg-bg-secondary px-2 py-0.5 font-mono text-xs text-text-muted">
                INDEX {stat.validatorIndex}
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
              {totalSigned} signed / {totalMissed} missed
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
          <StatItem label="Prepare Signs" value={formatNumber(prepareSignCount)} color="text-accent-green" />
          <StatItem label="Prepare Misses" value={formatNumber(prepareMissCount)} color="text-accent-red" />
          <StatItem label="Commit Signs" value={formatNumber(commitSignCount)} color="text-accent-green" />
          <StatItem label="Commit Misses" value={formatNumber(commitMissCount)} color="text-accent-red" />
        </div>

        {/* Block Range */}
        <div className="font-mono text-xs text-text-muted">
          Block Range:{' '}
          <span className="text-text-secondary">
            {formatNumber(BigInt(stat.fromBlock))} - {formatNumber(BigInt(stat.toBlock))}
          </span>
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
