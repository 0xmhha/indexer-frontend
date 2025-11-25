'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useEpochSearch } from '@/lib/hooks/useEpochSearch'
import {
  EpochStatsGrid,
  EpochSearchForm,
  EpochInfoGrid,
  ValidatorsList,
} from '@/components/wbft/EpochComponents'

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
            {displayedEpoch.validators && displayedEpoch.validators.length > 0 && (
              <ValidatorsList validators={displayedEpoch.validators} />
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
  } = useEpochSearch()

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
