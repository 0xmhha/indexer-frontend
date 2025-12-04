'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useLatestEpochData, useEpochData, type EpochData } from '@/lib/hooks/useConsensus'
import { formatNumber } from '@/lib/utils/format'
import { UI } from '@/lib/config/constants'

/**
 * Epochs List Viewer Component
 *
 * Displays a list of epochs with navigation to view historical epochs.
 */
export function EpochsListViewer() {
  const { latestEpochData, loading, error } = useLatestEpochData()

  const currentEpochNumber = latestEpochData?.epochNumber
    ? parseInt(latestEpochData.epochNumber)
    : null

  // Generate list of recent epochs to display
  const epochNumbers = currentEpochNumber
    ? Array.from({ length: Math.min(10, currentEpochNumber + 1) }, (_, i) => currentEpochNumber - i)
    : []

  if (loading) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>EPOCH HISTORY</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>EPOCH HISTORY</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ErrorDisplay title="Failed to load epochs" message={error.message} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Epoch Highlight */}
      {latestEpochData && <CurrentEpochCard epochData={latestEpochData} />}

      {/* Epoch List */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>EPOCH HISTORY</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-bg-tertiary bg-bg-secondary">
                  <th className="px-4 py-3 text-left font-mono text-xs font-normal text-text-muted">
                    Epoch
                  </th>
                  <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">
                    Validators
                  </th>
                  <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">
                    Candidates
                  </th>
                  <th className="px-4 py-3 text-center font-mono text-xs font-normal text-text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-mono text-xs font-normal text-text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {epochNumbers.map((epochNum) => (
                  <EpochRow
                    key={epochNum}
                    epochNumber={epochNum}
                    isCurrent={epochNum === currentEpochNumber}
                    currentEpochData={
                      epochNum === currentEpochNumber ? latestEpochData ?? undefined : undefined
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface CurrentEpochCardProps {
  epochData: EpochData
}

function CurrentEpochCard({ epochData }: CurrentEpochCardProps) {
  return (
    <Card className="border-accent-blue/30 bg-accent-blue/5">
      <CardHeader className="border-b border-accent-blue/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded bg-accent-blue/20 px-2 py-1 font-mono text-xs text-accent-blue">
              CURRENT
            </span>
            <CardTitle className="text-accent-blue">EPOCH #{epochData.epochNumber}</CardTitle>
          </div>
          <Link
            href={`/epochs/${epochData.epochNumber}`}
            className="font-mono text-xs text-accent-blue hover:underline"
          >
            View Details →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
            <div className="font-mono text-xs text-text-muted">VALIDATORS</div>
            <div className="mt-1 font-mono text-2xl font-bold text-accent-green">
              {epochData.validatorCount}
            </div>
          </div>
          <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
            <div className="font-mono text-xs text-text-muted">CANDIDATES</div>
            <div className="mt-1 font-mono text-2xl font-bold text-accent-cyan">
              {epochData.candidateCount}
            </div>
          </div>
          <div className="col-span-2">
            <div className="font-mono text-xs text-text-muted">ACTIVE VALIDATORS (by index)</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {epochData.validators.slice(0, UI.EPOCH_PREVIEW_VALIDATORS).map((validatorIndex, idx) => (
                <span
                  key={`validator-${validatorIndex}-${idx}`}
                  className="rounded bg-bg-tertiary px-2 py-1 font-mono text-xs text-text-secondary"
                  title={`Validator Index: ${validatorIndex}`}
                >
                  #{validatorIndex}
                </span>
              ))}
              {epochData.validators.length > UI.EPOCH_PREVIEW_VALIDATORS && (
                <span className="rounded bg-bg-tertiary px-2 py-1 font-mono text-xs text-text-muted">
                  +{epochData.validators.length - UI.EPOCH_PREVIEW_VALIDATORS} more
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface EpochRowProps {
  epochNumber: number
  isCurrent: boolean
  currentEpochData?: EpochData | undefined
}

function EpochRow({ epochNumber, isCurrent, currentEpochData }: EpochRowProps) {
  // For current epoch, use the already fetched data
  // For other epochs, we'll show a placeholder and load on click
  const { epochData, loading } = useEpochData(
    isCurrent ? '' : epochNumber.toString()
  )

  const data = isCurrent ? currentEpochData : epochData

  return (
    <tr className="border-b border-bg-tertiary hover:bg-bg-secondary">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/epochs/${epochNumber}`}
            className="font-mono text-sm text-accent-blue hover:underline"
          >
            #{formatNumber(epochNumber)}
          </Link>
          {isCurrent && (
            <span className="rounded bg-accent-green/10 px-1.5 py-0.5 font-mono text-xs text-accent-green">
              Current
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center font-mono text-sm text-text-secondary">
        {loading ? (
          <span className="text-text-muted">...</span>
        ) : data ? (
          data.validatorCount
        ) : (
          '-'
        )}
      </td>
      <td className="px-4 py-3 text-center font-mono text-sm text-text-secondary">
        {loading ? (
          <span className="text-text-muted">...</span>
        ) : data ? (
          data.candidateCount
        ) : (
          '-'
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {isCurrent ? (
          <span className="rounded bg-accent-green/10 px-2 py-0.5 font-mono text-xs text-accent-green">
            Active
          </span>
        ) : (
          <span className="rounded bg-bg-tertiary px-2 py-0.5 font-mono text-xs text-text-muted">
            Historical
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/epochs/${epochNumber}`}
          className="font-mono text-xs text-accent-blue hover:underline"
        >
          View →
        </Link>
      </td>
    </tr>
  )
}
