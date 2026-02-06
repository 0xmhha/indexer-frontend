'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useValidators, type Validator } from '@/lib/hooks/useWBFT'
import { formatNumber, truncateAddress } from '@/lib/utils/format'

/**
 * Validators List Viewer
 *
 * Displays list of active validators with their address and status.
 * Allows filtering by active status.
 * Note: Backend returns all validators without pagination.
 */
export function ValidatorsListViewer() {
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  const {
    validators,
    totalCount,
    loading,
    error,
    refetch,
  } = useValidators()

  // Filter for active validators if toggle is on
  const displayedValidators = showActiveOnly ? validators.filter((v) => v.isActive) : validators

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>VALIDATORS</CardTitle>
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
      <div className="flex items-center justify-between">
        {/* Validator Address */}
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${validator.isActive ? 'bg-accent-green' : 'bg-text-muted'}`} />
          <span className="font-mono text-sm font-bold text-text-primary" title={validator.address}>
            {truncateAddress(validator.address)}
          </span>
        </div>

        {/* Status Badge */}
        <div>
          {validator.isActive ? (
            <span className="rounded border border-accent-green bg-accent-green/10 px-3 py-1 font-mono text-xs text-accent-green">
              ACTIVE
            </span>
          ) : (
            <span className="rounded border border-text-muted bg-text-muted/10 px-3 py-1 font-mono text-xs text-text-muted">
              INACTIVE
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
