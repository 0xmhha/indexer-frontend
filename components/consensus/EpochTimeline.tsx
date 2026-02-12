'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useLatestEpochData } from '@/lib/hooks/useConsensus'
import { formatNumber } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

interface EpochTimelineProps {
  className?: string
}

interface EpochDataDisplay {
  epochNumber: string
  blockNumber: string
  validatorCount: number
  candidateCount: number
  validatorChange: number
}

/**
 * Epoch Transition Timeline
 *
 * Visual timeline showing current epoch information with key metrics.
 * Displays validator count and epoch progression.
 */
export function EpochTimeline({ className }: EpochTimelineProps) {
  const { latestEpochData, loading, error } = useLatestEpochData()

  // Create display data from latest epoch
  const epochsToDisplay = useMemo((): EpochDataDisplay[] => {
    if (!latestEpochData) {return []}

    const prevCount = latestEpochData.previousEpochValidatorCount
    const validatorChange = prevCount !== undefined && prevCount !== null
      ? latestEpochData.validatorCount - prevCount
      : 0

    return [{
      epochNumber: latestEpochData.epochNumber,
      blockNumber: latestEpochData.blockNumber ?? '0',
      validatorCount: latestEpochData.validatorCount,
      candidateCount: latestEpochData.candidateCount,
      validatorChange,
    }]
  }, [latestEpochData])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>CURRENT EPOCH</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error || epochsToDisplay.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>CURRENT EPOCH</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="font-mono text-sm text-text-muted">
            {error ? 'Failed to load epoch' : 'No epoch data available'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>CURRENT EPOCH</CardTitle>
          <Link
            href="/epochs"
            className="font-mono text-xs text-accent-blue hover:underline"
          >
            View All →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 h-full w-0.5 bg-bg-tertiary" />

          {/* Timeline Items */}
          <div className="space-y-4">
            {epochsToDisplay.map((epoch, index) => (
              <EpochTimelineItem
                key={epoch.epochNumber}
                epoch={epoch}
                isCurrent={index === 0}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface EpochTimelineItemProps {
  epoch: EpochDataDisplay
  isCurrent: boolean
}

function EpochTimelineItem({ epoch, isCurrent }: EpochTimelineItemProps) {
  return (
    <div className="relative flex gap-4 pl-8">
      {/* Timeline Node */}
      <div
        className={cn(
          'absolute left-2 top-2 h-5 w-5 rounded-full border-2',
          isCurrent
            ? 'border-accent-green bg-accent-green/20'
            : 'border-bg-tertiary bg-bg-secondary'
        )}
      >
        {isCurrent && (
          <div className="absolute inset-1 animate-pulse rounded-full bg-accent-green" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 rounded border border-bg-tertiary bg-bg-secondary p-3">
        <div className="flex items-center justify-between">
          <Link
            href={`/epochs/${epoch.epochNumber}`}
            className="font-mono text-sm font-bold text-accent-blue hover:underline"
          >
            Epoch #{epoch.epochNumber}
          </Link>
          {isCurrent && (
            <span className="rounded-full bg-accent-green/20 px-2 py-0.5 font-mono text-xs text-accent-green">
              Current
            </span>
          )}
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2">
          {/* Block Number */}
          <div>
            <div className="font-mono text-xs text-text-muted">Start Block</div>
            <Link
              href={`/block/${epoch.blockNumber}`}
              className="font-mono text-sm text-text-secondary hover:text-accent-blue"
            >
              #{formatNumber(BigInt(epoch.blockNumber))}
            </Link>
          </div>

          {/* Validator Count */}
          <div>
            <div className="font-mono text-xs text-text-muted">Validators</div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-sm text-text-primary">
                {epoch.validatorCount}
              </span>
              {epoch.validatorChange !== 0 && (
                <span
                  className={cn(
                    'font-mono text-xs',
                    epoch.validatorChange > 0 ? 'text-accent-green' : 'text-accent-red'
                  )}
                >
                  {epoch.validatorChange > 0 ? '+' : ''}
                  {epoch.validatorChange}
                </span>
              )}
            </div>
          </div>

          {/* Candidates */}
          <div>
            <div className="font-mono text-xs text-text-muted">Candidates</div>
            <span className="font-mono text-sm text-text-secondary">
              {epoch.candidateCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact Epoch Progress Indicator
 *
 * Shows current epoch progress in a compact format.
 */
export function EpochProgressIndicator({ className }: { className?: string }) {
  const { latestEpochData, loading } = useLatestEpochData()

  if (loading || !latestEpochData) {
    return null
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-accent-green" />
        <span className="font-mono text-sm text-text-secondary">
          Epoch #{latestEpochData.epochNumber}
        </span>
      </div>
      <div className="font-mono text-xs text-text-muted">
        {latestEpochData.validatorCount} validators
      </div>
    </div>
  )
}
