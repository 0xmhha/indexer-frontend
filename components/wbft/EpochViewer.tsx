'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useCurrentEpoch, useEpochByNumber, type ValidatorInEpoch } from '@/lib/hooks/useWBFT'
import { formatNumber, formatDateTime, truncateAddress } from '@/lib/utils/format'

/**
 * Epoch Information Viewer
 *
 * Displays current epoch information and allows searching for specific epochs.
 * Shows epoch details, validators, and their voting power distribution.
 */
export function EpochViewer() {
  const [searchEpoch, setSearchEpoch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { currentEpoch, loading: currentLoading, error: currentError, refetch: refetchCurrent } = useCurrentEpoch()
  const { epoch: searchedEpoch, loading: searchLoading, error: searchError } = useEpochByNumber(searchEpoch)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchEpoch(searchInput.trim())
    }
  }

  const handleViewCurrent = () => {
    setSearchEpoch('')
    setSearchInput('')
  }

  const displayedEpoch = searchEpoch ? searchedEpoch : currentEpoch
  const loading = searchEpoch ? searchLoading : currentLoading
  const error = searchEpoch ? searchError : currentError

  return (
    <div className="space-y-6">
      {/* Current Epoch Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="CURRENT EPOCH"
          value={currentLoading ? '...' : currentEpoch?.epochNumber || 'N/A'}
          icon="📅"
          color="text-accent-blue"
        />
        <StatCard
          label="VALIDATORS"
          value={currentLoading ? '...' : currentEpoch?.validatorCount.toString() || 'N/A'}
          icon="⚡"
          color="text-accent-green"
        />
        <StatCard
          label="TOTAL STAKE"
          value={
            currentLoading
              ? '...'
              : currentEpoch
                ? formatNumber(BigInt(currentEpoch.totalStake))
                : 'N/A'
          }
          icon="💰"
          color="text-accent-cyan"
        />
        <StatCard
          label="STATUS"
          value={currentLoading ? '...' : currentEpoch?.status || 'N/A'}
          icon="🔄"
          color="text-accent-purple"
        />
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>EPOCH SEARCH</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter epoch number..."
              className="flex-1 rounded border border-bg-tertiary bg-bg-primary px-4 py-2 font-mono text-sm text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
            />
            <button
              type="submit"
              className="rounded border border-accent-blue bg-accent-blue/10 px-6 py-2 font-mono text-sm text-accent-blue transition-colors hover:bg-accent-blue/20"
            >
              SEARCH
            </button>
            {searchEpoch && (
              <button
                type="button"
                onClick={handleViewCurrent}
                className="rounded border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue"
              >
                VIEW CURRENT
              </button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Epoch Details */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <div className="flex items-center justify-between">
            <CardTitle>
              {searchEpoch ? `EPOCH #${searchEpoch}` : 'CURRENT EPOCH'}
              {displayedEpoch && ` - #${displayedEpoch.epochNumber}`}
            </CardTitle>
            {!searchEpoch && (
              <button
                onClick={() => refetchCurrent()}
                className="rounded border border-bg-tertiary bg-bg-secondary px-3 py-1 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue"
                aria-label="Refresh epoch data"
              >
                ↻
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorDisplay title="Failed to load epoch data" message={error.message} />
            </div>
          ) : !displayedEpoch ? (
            <div className="flex h-64 items-center justify-center">
              <p className="font-mono text-sm text-text-muted">No epoch data available</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Epoch Information */}
              <div>
                <h3 className="mb-3 font-mono text-sm font-bold text-text-primary">EPOCH INFORMATION</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoItem label="Epoch Number" value={displayedEpoch.epochNumber} />
                  <InfoItem label="Start Block" value={formatNumber(BigInt(displayedEpoch.startBlock))} />
                  <InfoItem label="End Block" value={formatNumber(BigInt(displayedEpoch.endBlock))} />
                  <InfoItem label="Start Time" value={formatDateTime(displayedEpoch.startTime)} />
                  {displayedEpoch.endTime && (
                    <InfoItem label="End Time" value={formatDateTime(displayedEpoch.endTime)} />
                  )}
                  <InfoItem label="Status" value={displayedEpoch.status.toUpperCase()} />
                  <InfoItem label="Validator Count" value={displayedEpoch.validatorCount.toString()} />
                  <InfoItem label="Total Stake" value={formatNumber(BigInt(displayedEpoch.totalStake))} />
                </div>
              </div>

              {/* Validators */}
              {displayedEpoch.validators && displayedEpoch.validators.length > 0 && (
                <div>
                  <h3 className="mb-3 font-mono text-sm font-bold text-text-primary">
                    VALIDATORS ({displayedEpoch.validators.length})
                  </h3>
                  <div className="divide-y divide-bg-tertiary rounded border border-bg-tertiary">
                    {displayedEpoch.validators.map((validator, idx) => (
                      <ValidatorItem key={`${validator.address}-${idx}`} validator={validator} rank={idx + 1} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="annotation mb-2">{label}</div>
            <div className="font-mono text-2xl font-bold text-accent-blue">{value}</div>
          </div>
          <div className={`font-mono text-3xl ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-xs text-text-muted">{label}</div>
      <div className="font-mono text-sm text-text-secondary">{value}</div>
    </div>
  )
}

function ValidatorItem({ validator, rank }: { validator: ValidatorInEpoch; rank: number }) {
  return (
    <div className="p-4 transition-colors hover:bg-bg-secondary">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent-blue bg-accent-blue/10">
            <span className="font-mono text-xs font-bold text-accent-blue">{rank}</span>
          </div>
          <div>
            <div className="font-mono text-xs text-text-muted">Address</div>
            <div className="font-mono text-sm text-text-secondary" title={validator.address}>
              {truncateAddress(validator.address)}
            </div>
          </div>
        </div>
        <div>
          <div className="font-mono text-xs text-text-muted">Stake</div>
          <div className="font-mono text-sm text-text-secondary">{formatNumber(BigInt(validator.stake))}</div>
        </div>
        <div>
          <div className="font-mono text-xs text-text-muted">Voting Power</div>
          <div className="flex items-center gap-2">
            <div className="font-mono text-sm text-text-secondary">{validator.votingPower}%</div>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-tertiary">
              <div
                className="h-full bg-accent-green transition-all"
                style={{ width: `${Math.min(validator.votingPower, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
