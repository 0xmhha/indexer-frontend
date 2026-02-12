'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useEpochData, useLatestEpochData } from '@/lib/hooks/useConsensus'
import { truncateAddress } from '@/lib/utils/format'
import { FORMATTING, BLOCKCHAIN, THRESHOLDS } from '@/lib/config/constants'

interface EpochDetailProps {
  epochNumber: string
}

/**
 * Epoch Detail Component
 *
 * Displays comprehensive epoch information including:
 * - Epoch overview stats
 * - Full validator list with BLS public keys
 * - Candidate list with diligence scores
 */
export function EpochDetail({ epochNumber }: EpochDetailProps) {
  const { epochData, loading, error } = useEpochData(epochNumber)
  const { latestEpochData } = useLatestEpochData()

  const isCurrent = latestEpochData?.epochNumber === epochNumber
  const epochNum = parseInt(epochNumber)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/epochs"
            className="font-mono text-sm text-text-muted hover:text-accent-blue"
          >
            ← Epochs
          </Link>
        </div>
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/epochs"
            className="font-mono text-sm text-text-muted hover:text-accent-blue"
          >
            ← Epochs
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <ErrorDisplay title="Failed to load epoch" message={error.message} />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!epochData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/epochs"
            className="font-mono text-sm text-text-muted hover:text-accent-blue"
          >
            ← Epochs
          </Link>
        </div>
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <p className="font-mono text-sm text-text-muted">Epoch not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with Navigation */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href="/epochs"
              className="font-mono text-sm text-text-muted hover:text-accent-blue"
            >
              ← Epochs
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-text-primary">
              EPOCH #{epochNumber}
            </h1>
            {isCurrent && (
              <span className="rounded bg-accent-green/10 px-2 py-1 font-mono text-xs text-accent-green">
                CURRENT
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          {epochNum > 0 && (
            <Link
              href={`/epochs/${epochNum - 1}`}
              className="rounded border border-bg-tertiary px-3 py-1.5 font-mono text-xs text-text-secondary hover:border-accent-blue hover:text-accent-blue"
            >
              ← Previous
            </Link>
          )}
          {!isCurrent && (
            <Link
              href={`/epochs/${epochNum + 1}`}
              className="rounded border border-bg-tertiary px-3 py-1.5 font-mono text-xs text-text-secondary hover:border-accent-blue hover:text-accent-blue"
            >
              Next →
            </Link>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="font-mono text-xs text-text-muted">EPOCH NUMBER</div>
            <div className="mt-1 font-mono text-2xl font-bold text-accent-blue">
              {epochData.epochNumber}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-mono text-xs text-text-muted">VALIDATORS</div>
            <div className="mt-1 font-mono text-2xl font-bold text-accent-green">
              {epochData.validatorCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-mono text-xs text-text-muted">CANDIDATES</div>
            <div className="mt-1 font-mono text-2xl font-bold text-accent-cyan">
              {epochData.candidateCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-mono text-xs text-text-muted">STATUS</div>
            <div className="mt-1">
              {isCurrent ? (
                <span className="rounded bg-accent-green/10 px-2 py-1 font-mono text-sm text-accent-green">
                  Active
                </span>
              ) : (
                <span className="rounded bg-bg-tertiary px-2 py-1 font-mono text-sm text-text-muted">
                  Historical
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validators Table */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>VALIDATORS ({epochData.validators.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-bg-tertiary bg-bg-secondary">
                  <th className="px-4 py-3 text-left font-mono text-xs font-normal text-text-muted">
                    #
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-xs font-normal text-text-muted">
                    Validator Index
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-xs font-normal text-text-muted">
                    BLS Public Key
                  </th>
                </tr>
              </thead>
              <tbody>
                {epochData.validators.map((validatorIndex, idx) => (
                  <ValidatorRow
                    key={`validator-${validatorIndex}-${idx}`}
                    index={idx + 1}
                    validatorIndex={validatorIndex}
                    blsPubKey={epochData.blsPublicKeys?.[idx]}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      {epochData.candidates.length > 0 && (
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>CANDIDATES ({epochData.candidates.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-bg-tertiary bg-bg-secondary">
                    <th className="px-4 py-3 text-left font-mono text-xs font-normal text-text-muted">
                      Address
                    </th>
                    <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">
                      Diligence
                    </th>
                    <th className="px-4 py-3 text-right font-mono text-xs font-normal text-text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {epochData.candidates.map((candidate) => (
                    <CandidateRow key={candidate.address} candidate={candidate} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const ValidatorRow = memo(function ValidatorRow({
  index,
  validatorIndex,
  blsPubKey,
}: {
  index: number
  validatorIndex: number
  blsPubKey?: string | undefined
}) {
  return (
    <tr className="border-b border-bg-tertiary hover:bg-bg-secondary">
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-text-muted">{index}</span>
      </td>
      <td className="px-4 py-3">
        <span className="rounded bg-bg-tertiary px-2 py-0.5 font-mono text-sm text-text-primary">
          {validatorIndex}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-text-secondary" title={blsPubKey}>
          {blsPubKey
            ? `${blsPubKey.slice(0, FORMATTING.BLS_KEY_START_CHARS)}...${blsPubKey.slice(-FORMATTING.BLS_KEY_END_CHARS)}`
            : '-'}
        </span>
      </td>
    </tr>
  )
})

const CandidateRow = memo(function CandidateRow({
  candidate,
}: {
  candidate: { address: string; diligence: string }
}) {
  const diligence = parseFloat(candidate.diligence) * BLOCKCHAIN.PERCENTAGE_MULTIPLIER

  return (
    <tr className="border-b border-bg-tertiary hover:bg-bg-secondary">
      <td className="px-4 py-3">
        <Link
          href={`/address/${candidate.address}`}
          className="font-mono text-sm text-accent-blue hover:underline"
          title={candidate.address}
        >
          {truncateAddress(candidate.address)}
        </Link>
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`font-mono text-sm ${
            diligence >= THRESHOLDS.PARTICIPATION_EXCELLENT
              ? 'text-accent-green'
              : diligence >= THRESHOLDS.PARTICIPATION_GOOD
                ? 'text-accent-cyan'
                : diligence >= THRESHOLDS.PARTICIPATION_MINIMUM
                  ? 'text-yellow-500'
                  : 'text-accent-red'
          }`}
        >
          {diligence.toFixed(2)}%
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/address/${candidate.address}`}
          className="font-mono text-xs text-accent-blue hover:underline"
        >
          View Address →
        </Link>
      </td>
    </tr>
  )
})
