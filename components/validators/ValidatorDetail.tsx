'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useValidatorStats, useValidatorParticipation } from '@/lib/hooks/useConsensus'
import { formatNumber } from '@/lib/utils/format'
import { THRESHOLDS } from '@/lib/config/constants'
import { ParticipationRate } from '@/components/consensus/ParticipationRate'
import { RoundIndicator } from '@/components/consensus/RoundIndicator'

interface ValidatorDetailProps {
  address: string
}

/**
 * Validator Detail Component
 *
 * Displays comprehensive validator information including:
 * - Basic info and stats
 * - Participation metrics
 * - Recent block participation history
 */
export function ValidatorDetail({ address }: ValidatorDetailProps) {
  const blockRange = {
    fromBlock: '0',
    toBlock: '999999999',
  }

  const {
    validatorStats,
    loading: statsLoading,
    error: statsError,
  } = useValidatorStats({
    address,
    fromBlock: blockRange.fromBlock,
    toBlock: blockRange.toBlock,
  })

  const {
    participation,
    loading: participationLoading,
    error: participationError,
  } = useValidatorParticipation({
    address,
    fromBlock: blockRange.fromBlock,
    toBlock: blockRange.toBlock,
    limit: 50,
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href="/validators"
              className="font-mono text-sm text-text-muted hover:text-accent-blue"
            >
              ← Validators
            </Link>
          </div>
          <h1 className="mb-2 font-mono text-2xl font-bold text-text-primary">VALIDATOR</h1>
          <p className="font-mono text-sm text-text-secondary" title={address}>
            {address}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <ValidatorStatsOverview
        stats={validatorStats}
        loading={statsLoading}
        error={statsError}
      />

      {/* Participation History */}
      <ValidatorParticipationHistory
        participation={participation}
        loading={participationLoading}
        error={participationError}
      />
    </div>
  )
}

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

function ValidatorStatsOverview({ stats, loading, error }: ValidatorStatsOverviewProps) {
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
          {/* Overall Participation Rate */}
          <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
            <ParticipationRate
              rate={stats.participationRate}
              size="lg"
              label="OVERALL PARTICIPATION"
            />
          </div>

          {/* Blocks Stats */}
          <div className="space-y-3">
            <div className="rounded border border-bg-tertiary bg-bg-secondary p-3">
              <div className="font-mono text-xs text-text-muted">Total Blocks</div>
              <div className="font-mono text-xl font-bold text-text-primary">
                {formatNumber(stats.totalBlocks)}
              </div>
            </div>
            <div className="rounded border border-bg-tertiary bg-bg-secondary p-3">
              <div className="font-mono text-xs text-text-muted">Blocks Proposed</div>
              <div className="font-mono text-xl font-bold text-accent-cyan">
                {formatNumber(stats.blocksProposed)}
              </div>
            </div>
          </div>

          {/* Prepare Stats */}
          <div className="space-y-3">
            <div className="rounded border border-bg-tertiary bg-bg-secondary p-3">
              <div className="font-mono text-xs text-text-muted">Prepare Rate</div>
              <div
                className={`font-mono text-xl font-bold ${
                  prepareRate >= THRESHOLDS.PARTICIPATION_EXCELLENT
                    ? 'text-accent-green'
                    : prepareRate >= THRESHOLDS.PARTICIPATION_GOOD
                      ? 'text-accent-cyan'
                      : prepareRate >= THRESHOLDS.PARTICIPATION_MINIMUM
                        ? 'text-yellow-500'
                        : 'text-accent-red'
                }`}
              >
                {prepareRate.toFixed(2)}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border border-accent-green/30 bg-accent-green/5 p-2">
                <div className="font-mono text-xs text-text-muted">Signed</div>
                <div className="font-mono text-sm font-bold text-accent-green">
                  {formatNumber(stats.preparesSigned)}
                </div>
              </div>
              <div className="rounded border border-accent-red/30 bg-accent-red/5 p-2">
                <div className="font-mono text-xs text-text-muted">Missed</div>
                <div className="font-mono text-sm font-bold text-accent-red">
                  {formatNumber(stats.preparesMissed)}
                </div>
              </div>
            </div>
          </div>

          {/* Commit Stats */}
          <div className="space-y-3">
            <div className="rounded border border-bg-tertiary bg-bg-secondary p-3">
              <div className="font-mono text-xs text-text-muted">Commit Rate</div>
              <div
                className={`font-mono text-xl font-bold ${
                  commitRate >= THRESHOLDS.PARTICIPATION_EXCELLENT
                    ? 'text-accent-green'
                    : commitRate >= THRESHOLDS.PARTICIPATION_GOOD
                      ? 'text-accent-cyan'
                      : commitRate >= THRESHOLDS.PARTICIPATION_MINIMUM
                        ? 'text-yellow-500'
                        : 'text-accent-red'
                }`}
              >
                {commitRate.toFixed(2)}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border border-accent-green/30 bg-accent-green/5 p-2">
                <div className="font-mono text-xs text-text-muted">Signed</div>
                <div className="font-mono text-sm font-bold text-accent-green">
                  {formatNumber(stats.commitsSigned)}
                </div>
              </div>
              <div className="rounded border border-accent-red/30 bg-accent-red/5 p-2">
                <div className="font-mono text-xs text-text-muted">Missed</div>
                <div className="font-mono text-sm font-bold text-accent-red">
                  {formatNumber(stats.commitsMissed)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Last Activity */}
        {(stats.lastProposedBlock || stats.lastCommittedBlock || stats.lastSeenBlock) && (
          <div className="mt-6 grid gap-4 border-t border-bg-tertiary pt-6 md:grid-cols-3">
            {stats.lastProposedBlock && (
              <div className="flex items-center justify-between rounded border border-bg-tertiary bg-bg-secondary p-3">
                <span className="font-mono text-xs text-text-muted">Last Proposed</span>
                <Link
                  href={`/block/${stats.lastProposedBlock}`}
                  className="font-mono text-sm text-accent-blue hover:underline"
                >
                  #{formatNumber(stats.lastProposedBlock)}
                </Link>
              </div>
            )}
            {stats.lastCommittedBlock && (
              <div className="flex items-center justify-between rounded border border-bg-tertiary bg-bg-secondary p-3">
                <span className="font-mono text-xs text-text-muted">Last Committed</span>
                <Link
                  href={`/block/${stats.lastCommittedBlock}`}
                  className="font-mono text-sm text-accent-blue hover:underline"
                >
                  #{formatNumber(stats.lastCommittedBlock)}
                </Link>
              </div>
            )}
            {stats.lastSeenBlock && (
              <div className="flex items-center justify-between rounded border border-bg-tertiary bg-bg-secondary p-3">
                <span className="font-mono text-xs text-text-muted">Last Seen</span>
                <Link
                  href={`/block/${stats.lastSeenBlock}`}
                  className="font-mono text-sm text-accent-blue hover:underline"
                >
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

interface ValidatorParticipationHistoryProps {
  participation: {
    address: string
    startBlock: string
    endBlock: string
    totalBlocks: string
    blocksProposed: string
    blocksCommitted: string
    blocksMissed: string
    participationRate: number
    blocks: Array<{
      blockNumber: string
      wasProposer: boolean
      signedPrepare: boolean
      signedCommit: boolean
      round: number
    }>
  } | null
  loading: boolean
  error?: Error | undefined
}

function ValidatorParticipationHistory({
  participation,
  loading,
  error,
}: ValidatorParticipationHistoryProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>PARTICIPATION HISTORY</CardTitle>
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
          <CardTitle>PARTICIPATION HISTORY</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ErrorDisplay title="Failed to load history" message={error.message} />
        </CardContent>
      </Card>
    )
  }

  if (!participation || participation.blocks.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>PARTICIPATION HISTORY</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="font-mono text-sm text-text-muted">No participation history available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>PARTICIPATION HISTORY</CardTitle>
          <div className="font-mono text-xs text-text-muted">
            Blocks {formatNumber(participation.startBlock)} - {formatNumber(participation.endBlock)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-bg-tertiary bg-bg-secondary">
                <th className="px-4 py-3 text-left font-mono text-xs font-normal text-text-muted">
                  Block
                </th>
                <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">
                  Round
                </th>
                <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">
                  Role
                </th>
                <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">
                  Prepare
                </th>
                <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">
                  Commit
                </th>
              </tr>
            </thead>
            <tbody>
              {participation.blocks.map((block) => (
                <tr
                  key={block.blockNumber}
                  className="border-b border-bg-tertiary hover:bg-bg-secondary"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/block/${block.blockNumber}`}
                      className="font-mono text-sm text-accent-blue hover:underline"
                    >
                      #{formatNumber(block.blockNumber)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <RoundIndicator round={block.round} size="sm" showLabel={false} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {block.wasProposer ? (
                      <span className="rounded bg-accent-cyan/10 px-2 py-0.5 font-mono text-xs text-accent-cyan">
                        Proposer
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-text-muted">Validator</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {block.signedPrepare ? (
                      <span className="text-accent-green">&#10003;</span>
                    ) : (
                      <span className="text-accent-red">&#10007;</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {block.signedCommit ? (
                      <span className="text-accent-green">&#10003;</span>
                    ) : (
                      <span className="text-accent-red">&#10007;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
