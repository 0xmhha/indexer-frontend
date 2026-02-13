'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatNumber } from '@/lib/utils/format'
import { getParticipationRateColor } from '@/lib/utils/consensus'
import { ParticipationRate } from '@/components/consensus/ParticipationRate'

interface ValidatorStatsOverviewProps {
  stats: {
    address: string
    totalBlocks: string
    blocksProposed: string
    preparesSigned: string
    commitsSigned: string
    preparesMissed: string
    commitsMissed: string
    participationRate: number
    lastProposedBlock?: string
    lastCommittedBlock?: string
    lastSeenBlock?: string
  } | null
  loading: boolean
  error?: Error | undefined
}

export function ValidatorStatsOverview({ stats, loading, error }: ValidatorStatsOverviewProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>VALIDATOR STATISTICS</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>VALIDATOR STATISTICS</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ErrorDisplay title="Failed to load statistics" message={error.message} />
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>VALIDATOR STATISTICS</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="font-mono text-sm text-text-muted">No statistics available</p>
        </CardContent>
      </Card>
    )
  }

  const prepareRate =
    (Number(stats.preparesSigned) /
      (Number(stats.preparesSigned) + Number(stats.preparesMissed))) *
      100 || 0
  const commitRate =
    (Number(stats.commitsSigned) /
      (Number(stats.commitsSigned) + Number(stats.commitsMissed))) *
      100 || 0

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>VALIDATOR STATISTICS</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
            <ParticipationRate rate={stats.participationRate} size="lg" label="OVERALL PARTICIPATION" />
          </div>

          <div className="space-y-3">
            <div className="rounded border border-bg-tertiary bg-bg-secondary p-3">
              <div className="font-mono text-xs text-text-muted">Total Blocks</div>
              <div className="font-mono text-xl font-bold text-text-primary">{formatNumber(stats.totalBlocks)}</div>
            </div>
            <div className="rounded border border-bg-tertiary bg-bg-secondary p-3">
              <div className="font-mono text-xs text-text-muted">Blocks Proposed</div>
              <div className="font-mono text-xl font-bold text-accent-cyan">{formatNumber(stats.blocksProposed)}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded border border-bg-tertiary bg-bg-secondary p-3">
              <div className="font-mono text-xs text-text-muted">Prepare Rate</div>
              <div className={`font-mono text-xl font-bold ${getParticipationRateColor(prepareRate).text}`}>
                {prepareRate.toFixed(2)}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border border-accent-green/30 bg-accent-green/5 p-2">
                <div className="font-mono text-xs text-text-muted">Signed</div>
                <div className="font-mono text-sm font-bold text-accent-green">{formatNumber(stats.preparesSigned)}</div>
              </div>
              <div className="rounded border border-accent-red/30 bg-accent-red/5 p-2">
                <div className="font-mono text-xs text-text-muted">Missed</div>
                <div className="font-mono text-sm font-bold text-accent-red">{formatNumber(stats.preparesMissed)}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded border border-bg-tertiary bg-bg-secondary p-3">
              <div className="font-mono text-xs text-text-muted">Commit Rate</div>
              <div className={`font-mono text-xl font-bold ${getParticipationRateColor(commitRate).text}`}>
                {commitRate.toFixed(2)}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border border-accent-green/30 bg-accent-green/5 p-2">
                <div className="font-mono text-xs text-text-muted">Signed</div>
                <div className="font-mono text-sm font-bold text-accent-green">{formatNumber(stats.commitsSigned)}</div>
              </div>
              <div className="rounded border border-accent-red/30 bg-accent-red/5 p-2">
                <div className="font-mono text-xs text-text-muted">Missed</div>
                <div className="font-mono text-sm font-bold text-accent-red">{formatNumber(stats.commitsMissed)}</div>
              </div>
            </div>
          </div>
        </div>

        {(stats.lastProposedBlock || stats.lastCommittedBlock || stats.lastSeenBlock) && (
          <div className="mt-6 grid gap-4 border-t border-bg-tertiary pt-6 md:grid-cols-3">
            {stats.lastProposedBlock && (
              <div className="flex items-center justify-between rounded border border-bg-tertiary bg-bg-secondary p-3">
                <span className="font-mono text-xs text-text-muted">Last Proposed</span>
                <Link href={`/block/${stats.lastProposedBlock}`} className="font-mono text-sm text-accent-blue hover:underline">
                  #{formatNumber(stats.lastProposedBlock)}
                </Link>
              </div>
            )}
            {stats.lastCommittedBlock && (
              <div className="flex items-center justify-between rounded border border-bg-tertiary bg-bg-secondary p-3">
                <span className="font-mono text-xs text-text-muted">Last Committed</span>
                <Link href={`/block/${stats.lastCommittedBlock}`} className="font-mono text-sm text-accent-blue hover:underline">
                  #{formatNumber(stats.lastCommittedBlock)}
                </Link>
              </div>
            )}
            {stats.lastSeenBlock && (
              <div className="flex items-center justify-between rounded border border-bg-tertiary bg-bg-secondary p-3">
                <span className="font-mono text-xs text-text-muted">Last Seen</span>
                <Link href={`/block/${stats.lastSeenBlock}`} className="font-mono text-sm text-accent-blue hover:underline">
                  #{formatNumber(stats.lastSeenBlock)}
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
