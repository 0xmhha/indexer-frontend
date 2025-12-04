'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useAllValidatorStats, type ValidatorStats } from '@/lib/hooks/useConsensus'
import { truncateAddress, formatNumber } from '@/lib/utils/format'
import { THRESHOLDS, BLOCKCHAIN } from '@/lib/config/constants'
import { ParticipationRate } from './ParticipationRate'

interface ValidatorLeaderboardProps {
  fromBlock?: string
  toBlock?: string
  limit?: number
  showTitle?: boolean
}

/**
 * Validator Leaderboard Component
 *
 * Displays validators ranked by participation rate with key metrics.
 */
export function ValidatorLeaderboard({
  fromBlock,
  toBlock,
  limit = 10,
  showTitle = true,
}: ValidatorLeaderboardProps) {
  const { stats, loading, error } = useAllValidatorStats({
    ...(fromBlock && { fromBlock }),
    ...(toBlock && { toBlock }),
    limit,
  })

  // Sort by participation rate descending
  const sortedStats = [...stats].sort((a, b) => b.participationRate - a.participationRate)

  if (loading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>VALIDATOR LEADERBOARD</CardTitle>
          </CardHeader>
        )}
        <CardContent className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>VALIDATOR LEADERBOARD</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-6">
          <ErrorDisplay title="Failed to load leaderboard" message={error.message} />
        </CardContent>
      </Card>
    )
  }

  if (sortedStats.length === 0) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>VALIDATOR LEADERBOARD</CardTitle>
          </CardHeader>
        )}
        <CardContent className="flex h-64 items-center justify-center">
          <p className="font-mono text-sm text-text-muted">No validator data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader className="border-b border-bg-tertiary">
          <div className="flex items-center justify-between">
            <CardTitle>VALIDATOR LEADERBOARD</CardTitle>
            <Link
              href="/validators"
              className="font-mono text-xs text-accent-blue hover:underline"
            >
              View All →
            </Link>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-bg-tertiary bg-bg-secondary">
                <th className="px-4 py-3 text-left font-mono text-xs font-normal text-text-muted">
                  Rank
                </th>
                <th className="px-4 py-3 text-left font-mono text-xs font-normal text-text-muted">
                  Validator
                </th>
                <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">
                  Blocks
                </th>
                <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">
                  Proposed
                </th>
                <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">
                  Prepare
                </th>
                <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">
                  Commit
                </th>
                <th className="px-4 py-3 text-right font-mono text-xs font-normal text-text-muted">
                  Participation
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((validator, index) => (
                <ValidatorRow
                  key={validator.address}
                  validator={validator}
                  rank={index + 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

interface ValidatorRowProps {
  validator: ValidatorStats
  rank: number
}

const RANK_FIRST = 1
const RANK_SECOND = 2
const RANK_THIRD = 3

function ValidatorRow({ validator, rank }: ValidatorRowProps) {
  const getRankBadge = () => {
    if (rank === RANK_FIRST) {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 font-mono text-xs font-bold text-yellow-500">
          1
        </span>
      )
    }
    if (rank === RANK_SECOND) {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400/20 font-mono text-xs font-bold text-gray-400">
          2
        </span>
      )
    }
    if (rank === RANK_THIRD) {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600/20 font-mono text-xs font-bold text-orange-600">
          3
        </span>
      )
    }
    return (
      <span className="flex h-6 w-6 items-center justify-center font-mono text-xs text-text-muted">
        {rank}
      </span>
    )
  }

  const prepareRate =
    Number(validator.preparesSigned) /
    (Number(validator.preparesSigned) + Number(validator.preparesMissed)) * BLOCKCHAIN.PERCENTAGE_MULTIPLIER || 0
  const commitRate =
    Number(validator.commitsSigned) /
    (Number(validator.commitsSigned) + Number(validator.commitsMissed)) * BLOCKCHAIN.PERCENTAGE_MULTIPLIER || 0

  return (
    <tr className="border-b border-bg-tertiary hover:bg-bg-secondary">
      <td className="px-4 py-3">{getRankBadge()}</td>
      <td className="px-4 py-3">
        <Link
          href={`/validators/${validator.address}`}
          className="font-mono text-sm text-accent-blue hover:underline"
          title={validator.address}
        >
          {truncateAddress(validator.address)}
        </Link>
      </td>
      <td className="px-4 py-3 text-center font-mono text-sm text-text-secondary">
        {formatNumber(validator.totalBlocks)}
      </td>
      <td className="px-4 py-3 text-center font-mono text-sm text-accent-cyan">
        {formatNumber(validator.blocksProposed)}
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`font-mono text-sm ${
            prepareRate >= THRESHOLDS.PARTICIPATION_EXCELLENT
              ? 'text-accent-green'
              : prepareRate >= THRESHOLDS.PARTICIPATION_GOOD
                ? 'text-accent-cyan'
                : prepareRate >= THRESHOLDS.PARTICIPATION_MINIMUM
                  ? 'text-yellow-500'
                  : 'text-accent-red'
          }`}
        >
          {prepareRate.toFixed(1)}%
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`font-mono text-sm ${
            commitRate >= THRESHOLDS.PARTICIPATION_EXCELLENT
              ? 'text-accent-green'
              : commitRate >= THRESHOLDS.PARTICIPATION_GOOD
                ? 'text-accent-cyan'
                : commitRate >= THRESHOLDS.PARTICIPATION_MINIMUM
                  ? 'text-yellow-500'
                  : 'text-accent-red'
          }`}
        >
          {commitRate.toFixed(1)}%
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <ParticipationRate rate={validator.participationRate} size="sm" showBar={false} />
        </div>
      </td>
    </tr>
  )
}
