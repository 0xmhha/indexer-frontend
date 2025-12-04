'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useEpochSearch } from '@/lib/hooks/useEpochSearch'
import { FORMATTING } from '@/lib/config/constants'
import {
  EpochStatsGrid,
  EpochSearchForm,
  EpochInfoGrid,
  ValidatorsList,
} from '@/components/wbft/EpochComponents'
import type { ValidatorDisplayInfo } from '@/lib/hooks/useWBFT'

// ============================================================
// Epoch Details Card
// ============================================================

interface EpochDetailsCardProps {
  searchEpoch: string
  displayedEpoch: ReturnType<typeof useEpochSearch>['displayedEpoch']
  loading: boolean
  error: Error | null
  refetchCurrent: () => void
}

function EpochDetailsCard({
  searchEpoch,
  displayedEpoch,
  loading,
  error,
  refetchCurrent,
}: EpochDetailsCardProps) {
  // Transform validator indices + BLS keys into ValidatorDisplayInfo[]
  // Extract stable references to avoid React Compiler memoization issues
  const validators = displayedEpoch?.validators
  const blsPublicKeys = displayedEpoch?.blsPublicKeys

  const validatorDisplayInfos: ValidatorDisplayInfo[] = useMemo(() => {
    if (!validators) {return []}

    return validators.map((validatorIndex, i) => ({
      index: validatorIndex,
      // Backend doesn't provide addresses, use BLS key prefix or index as placeholder
      address: blsPublicKeys?.[i]?.slice(0, FORMATTING.ETH_ADDRESS_LENGTH) || `Validator #${validatorIndex}`,
      blsPubKey: blsPublicKeys?.[i] || '',
    }))
  }, [validators, blsPublicKeys])

  return (
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
          <div className="space-y-6 p-6">
            <EpochInfoGrid epoch={displayedEpoch} />
            {validatorDisplayInfos.length > 0 && (
              <ValidatorsList validators={validatorDisplayInfos} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================
// Main Component
// ============================================================

/**
 * Epoch Information Viewer (SRP: Orchestrates epoch display)
 */
export function EpochViewer() {
  const {
    searchInput,
    searchEpoch,
    setSearchInput,
    handleSearch,
    handleViewCurrent,
    displayedEpoch,
    currentEpoch,
    loading,
    error,
    currentLoading,
    refetchCurrent,
    isSupported,
  } = useEpochSearch()

  // If consensus operations are not supported, show a message
  if (!isSupported && !currentLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>EPOCH INFORMATION</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="font-mono text-sm text-text-muted">
              Epoch data is not available. The backend storage does not support consensus operations.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EpochStatsGrid currentEpoch={currentEpoch} currentLoading={currentLoading} />

      <EpochSearchForm
        searchInput={searchInput}
        searchEpoch={searchEpoch}
        onSearchInputChange={setSearchInput}
        onSearch={handleSearch}
        onViewCurrent={handleViewCurrent}
      />

      <EpochDetailsCard
        searchEpoch={searchEpoch}
        displayedEpoch={displayedEpoch}
        loading={loading}
        error={error}
        refetchCurrent={refetchCurrent}
      />
    </div>
  )
}
