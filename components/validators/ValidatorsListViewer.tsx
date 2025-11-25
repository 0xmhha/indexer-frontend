'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useValidators, type Validator } from '@/lib/hooks/useWBFT'
import { formatNumber, truncateAddress } from '@/lib/utils/format'
import { UI } from '@/lib/config/constants'

interface ValidatorsListViewerProps {
  maxValidators?: number
  epochNumber?: string
}

/**
 * Validators List Viewer
 *
 * Displays list of validators with their stake, voting power, and status.
 * Allows filtering by epoch and active status.
 */
export function ValidatorsListViewer({ maxValidators = UI.MAX_VIEWER_ITEMS, epochNumber }: ValidatorsListViewerProps) {
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  const {
    validators,
    totalCount,
    loading,
    error,
    refetch,
  } = useValidators({
    limit: maxValidators,
    ...(epochNumber && { epochNumber }),
  })

  // Filter for active validators if toggle is on
  const displayedValidators = showActiveOnly ? validators.filter((v) => v.isActive) : validators

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>
            VALIDATORS {epochNumber && `(EPOCH ${epochNumber})`}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-text-muted">Total:</span>
              <span className="font-mono text-xs text-text-secondary">{formatNumber(totalCount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-bg-tertiary bg-bg-primary text-accent-blue focus:ring-2 focus:ring-accent-blue"
                />
                <span className="font-mono text-xs text-text-secondary">Active Only</span>
              </label>
            </div>
            <button
              onClick={() => refetch()}
              className="rounded border border-bg-tertiary bg-bg-secondary px-3 py-1 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue"
              aria-label="Refresh validators"
            >
              ↻
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorDisplay title="Failed to load validators" message={error.message} />
          </div>
        ) : displayedValidators.length === 0 ? (
          <div className="flex h-96 items-center justify-center">
            <p className="font-mono text-sm text-text-muted">
              {showActiveOnly ? 'No active validators found' : 'No validators found'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-bg-tertiary">
            {displayedValidators.map((validator, idx) => (
              <ValidatorCard key={`${validator.address}-${idx}`} validator={validator} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ValidatorCard({ validator }: { validator: Validator }) {
  return (
    <div className="p-4 transition-colors hover:bg-bg-secondary">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Validator Address */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${validator.isActive ? 'bg-accent-green' : 'bg-text-muted'}`} />
            <span className="font-mono text-xs text-text-muted">Validator</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-text-primary" title={validator.address}>
              {truncateAddress(validator.address)}
            </span>
            {validator.isActive && (
              <span className="rounded border border-accent-green bg-accent-green/10 px-2 py-0.5 font-mono text-xs text-accent-green">
                ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Stake */}
        <div className="space-y-1">
          <div className="font-mono text-xs text-text-muted">Stake</div>
          <div className="font-mono text-sm text-text-secondary">
            {formatNumber(BigInt(validator.stake))} tokens
          </div>
        </div>

        {/* Voting Power */}
        <div className="space-y-1">
          <div className="font-mono text-xs text-text-muted">Voting Power</div>
          <div className="font-mono text-sm text-text-secondary">{validator.votingPower}%</div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-bg-tertiary">
            <div
              className="h-full bg-accent-blue transition-all"
              style={{ width: `${Math.min(validator.votingPower, 100)}%` }}
            />
          </div>
        </div>

        {/* Epochs */}
        <div className="space-y-1">
          <div className="font-mono text-xs text-text-muted">Epochs</div>
          <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
            <span>Joined: {validator.joinedEpoch}</span>
            <span>•</span>
            <span>Last: {validator.lastActiveEpoch}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
