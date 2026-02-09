'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useAllValidatorStats, type ValidatorStats } from '@/lib/hooks/useConsensus'
import { truncateAddress } from '@/lib/utils/format'
import { THRESHOLDS } from '@/lib/config/constants'
import { cn } from '@/lib/utils'

interface ValidatorHeatmapProps {
  limit?: number
  className?: string
}

/**
 * Validator Participation Heatmap
 *
 * Visual representation of validator performance across multiple metrics.
 * Shows prepare, commit, and proposal rates in a heatmap grid format.
 */
export function ValidatorHeatmap({ limit = 10, className }: ValidatorHeatmapProps) {
  const { stats, loading, error } = useAllValidatorStats({ limit })

  // Sort by participation rate
  const sortedStats = useMemo(() => {
    return [...stats].sort((a, b) => b.participationRate - a.participationRate)
  }, [stats])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>VALIDATOR HEATMAP</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error || sortedStats.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>VALIDATOR HEATMAP</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="font-mono text-sm text-text-muted">
            {error ? 'Failed to load data' : 'No validator data available'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>VALIDATOR PARTICIPATION HEATMAP</CardTitle>
          <HeatmapLegend />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Metric Headers */}
        <div className="mb-2 grid grid-cols-[140px_1fr_1fr_1fr_1fr] gap-2 px-2">
          <div className="font-mono text-xs text-text-muted">Validator</div>
          <div className="text-center font-mono text-xs text-text-muted">Prepare</div>
          <div className="text-center font-mono text-xs text-text-muted">Commit</div>
          <div className="text-center font-mono text-xs text-text-muted">Proposed</div>
          <div className="text-center font-mono text-xs text-text-muted">Overall</div>
        </div>

        {/* Heatmap Rows */}
        <div className="space-y-1">
          {sortedStats.map((validator, index) => (
            <HeatmapRow
              key={validator.address}
              validator={validator}
              rank={index + 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface HeatmapRowProps {
  validator: ValidatorStats
  rank: number
}

function HeatmapRow({ validator, rank }: HeatmapRowProps) {
  // Calculate rates
  const prepareTotal = Number(validator.preparesSigned) + Number(validator.preparesMissed)
  const commitTotal = Number(validator.commitsSigned) + Number(validator.commitsMissed)

  const prepareRate = prepareTotal > 0
    ? (Number(validator.preparesSigned) / prepareTotal) * 100
    : 0

  const commitRate = commitTotal > 0
    ? (Number(validator.commitsSigned) / commitTotal) * 100
    : 0

  // Proposal rate relative to total blocks
  const totalBlocks = Number(validator.totalBlocks)
  const proposalRate = totalBlocks > 0
    ? (Number(validator.blocksProposed) / totalBlocks) * 100
    : 0

  return (
    <div className="grid grid-cols-[140px_1fr_1fr_1fr_1fr] gap-2 rounded border border-bg-tertiary bg-bg-secondary px-2 py-2">
      {/* Validator Address */}
      <div className="flex items-center gap-2">
        <RankBadge rank={rank} />
        <span
          className="truncate font-mono text-xs text-text-secondary"
          title={validator.address}
        >
          {truncateAddress(validator.address)}
        </span>
      </div>

      {/* Prepare Rate Cell */}
      <HeatmapCell value={prepareRate} label={`${prepareRate.toFixed(1)}%`} />

      {/* Commit Rate Cell */}
      <HeatmapCell value={commitRate} label={`${commitRate.toFixed(1)}%`} />

      {/* Proposal Rate Cell */}
      <HeatmapCell
        value={proposalRate}
        label={`${Number(validator.blocksProposed)}`}
        isProposal
      />

      {/* Overall Participation */}
      <HeatmapCell
        value={validator.participationRate}
        label={`${validator.participationRate.toFixed(1)}%`}
      />
    </div>
  )
}

interface HeatmapCellProps {
  value: number
  label: string
  isProposal?: boolean
}

function HeatmapCell({ value, label, isProposal = false }: HeatmapCellProps) {
  // For proposal cells, use different thresholds
  const getHeatColor = () => {
    if (isProposal) {
      // Proposal rate is typically much lower, use different scale
      if (value > 20) return 'bg-accent-green'
      if (value > 10) return 'bg-accent-cyan'
      if (value > 5) return 'bg-accent-blue'
      if (value > 0) return 'bg-yellow-500'
      return 'bg-bg-tertiary'
    }

    // Standard participation rate thresholds
    if (value >= THRESHOLDS.PARTICIPATION_EXCELLENT) return 'bg-accent-green'
    if (value >= THRESHOLDS.PARTICIPATION_GOOD) return 'bg-accent-cyan'
    if (value >= THRESHOLDS.PARTICIPATION_MINIMUM) return 'bg-yellow-500'
    if (value >= 50) return 'bg-orange-500'
    return 'bg-accent-red'
  }

  const getTextColor = () => {
    if (isProposal) {
      return value > 0 ? 'text-white' : 'text-text-muted'
    }
    if (value >= THRESHOLDS.PARTICIPATION_MINIMUM) return 'text-white'
    return 'text-white'
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded px-2 py-1',
        getHeatColor()
      )}
    >
      <span className={cn('font-mono text-xs font-bold', getTextColor())}>
        {label}
      </span>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const getBadgeStyle = () => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-500'
    if (rank === 2) return 'bg-gray-400/20 text-gray-400'
    if (rank === 3) return 'bg-orange-600/20 text-orange-600'
    return 'bg-bg-tertiary text-text-muted'
  }

  return (
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold',
        getBadgeStyle()
      )}
    >
      {rank}
    </span>
  )
}

function HeatmapLegend() {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-text-muted">Performance:</span>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded bg-accent-green" title="Excellent (≥95%)" />
        <div className="h-3 w-3 rounded bg-accent-cyan" title="Good (≥90%)" />
        <div className="h-3 w-3 rounded bg-yellow-500" title="Fair (≥80%)" />
        <div className="h-3 w-3 rounded bg-orange-500" title="Low (≥50%)" />
        <div className="h-3 w-3 rounded bg-accent-red" title="Poor (<50%)" />
      </div>
    </div>
  )
}
