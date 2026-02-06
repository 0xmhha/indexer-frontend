'use client'

import { useConsensusBlockSubscription } from '@/lib/hooks/useConsensus'
import { formatNumber, truncateAddress } from '@/lib/utils/format'
import { getParticipationColor, getParticipationBgColor } from '@/types/consensus'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

/**
 * Real-time block card component
 * Displays the latest consensus block data from WebSocket subscription
 */
export function RealTimeBlockCard() {
  const { latestBlock, loading, error } = useConsensusBlockSubscription()

  if (loading && !latestBlock) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>LATEST BLOCK</CardTitle>
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
          <CardTitle>LATEST BLOCK</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4">
            <p className="font-mono text-sm text-red-400">Connection Error: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!latestBlock) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>LATEST BLOCK</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="font-mono text-sm text-text-muted">Waiting for blocks...</p>
        </CardContent>
      </Card>
    )
  }

  const participationColor = getParticipationColor(latestBlock.participationRate)
  const participationBgColor = getParticipationBgColor(latestBlock.participationRate)

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>LATEST BLOCK</CardTitle>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-accent-green" />
            <span className="font-mono text-xs text-accent-green">LIVE</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Block Number & Hash */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-mono text-2xl font-bold text-text-primary">
            #{formatNumber(latestBlock.blockNumber)}
          </h3>
          {latestBlock.isEpochBoundary && (
            <span className="rounded-full bg-purple-600/20 px-3 py-1 font-mono text-sm font-semibold text-purple-400">
              Epoch #{latestBlock.epochNumber}
            </span>
          )}
        </div>

        {/* Round Change Warning */}
        {latestBlock.roundChanged && (
          <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-3">
            <span className="font-mono text-sm text-yellow-400">
              Round Changed: {latestBlock.prevRound} → {latestBlock.round}
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-3">
            <p className="font-mono text-xs text-text-muted">Proposer</p>
            <p className="font-mono text-sm text-text-primary" title={latestBlock.proposer}>
              {truncateAddress(latestBlock.proposer)}
            </p>
          </div>
          <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-3">
            <p className="font-mono text-xs text-text-muted">Round</p>
            <p className="font-mono text-sm text-text-primary">
              {latestBlock.round === 0 ? 'First Try' : `Round ${latestBlock.round}`}
            </p>
          </div>
          <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-3">
            <p className="font-mono text-xs text-text-muted">Validators</p>
            <p className="font-mono text-sm text-text-primary">
              {latestBlock.commitCount} / {latestBlock.validatorCount}
            </p>
          </div>
          <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-3">
            <p className="font-mono text-xs text-text-muted">Participation</p>
            <p className={`font-mono text-xl font-bold ${participationColor}`}>
              {latestBlock.participationRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Participation Progress Bar */}
        <div className="mb-2">
          <div className="mb-1 flex justify-between font-mono text-xs text-text-muted">
            <span>Validator Participation</span>
            <span>
              {latestBlock.commitCount}/{latestBlock.validatorCount}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-bg-tertiary">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${participationBgColor}`}
              style={{ width: `${latestBlock.participationRate}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-bg-tertiary pt-3 font-mono text-xs text-text-muted">
          {latestBlock.receivedAt
            ? `Received ${new Date(latestBlock.receivedAt).toLocaleTimeString()}`
            : `Block time: ${new Date(latestBlock.timestamp * 1000).toLocaleTimeString()}`}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact version of the real-time block card
 * For use in sidebar or smaller layouts
 */
export function RealTimeBlockCardCompact() {
  const { latestBlock, loading } = useConsensusBlockSubscription()

  if (loading && !latestBlock) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-bg-tertiary bg-bg-secondary p-4">
        <LoadingSpinner size="sm" />
      </div>
    )
  }

  if (!latestBlock) {
    return (
      <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-4">
        <p className="font-mono text-xs text-text-muted">Waiting...</p>
      </div>
    )
  }

  const participationColor = getParticipationColor(latestBlock.participationRate)

  return (
    <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-text-muted">Latest Block</p>
          <p className="font-mono text-lg font-bold text-text-primary">
            #{formatNumber(latestBlock.blockNumber)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-text-muted">Participation</p>
          <p className={`font-mono text-lg font-bold ${participationColor}`}>
            {latestBlock.participationRate.toFixed(1)}%
          </p>
        </div>
      </div>
      {latestBlock.roundChanged && (
        <p className="mt-2 font-mono text-xs text-yellow-400">Round changed to {latestBlock.round}</p>
      )}
    </div>
  )
}
