'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import type { SearchResult, SearchResultType } from '@/lib/graphql/queries/search'
import { SearchResultCard, TYPE_LABELS, TYPE_ICONS } from '@/components/search/SearchResultCard'

// ============================================================
// Types
// ============================================================

interface SearchResultsListProps {
  results: SearchResult[]
  loading: boolean
  error: Error | null
  query: string
  onRetry: () => void
}

type GroupedResults = Record<SearchResultType, SearchResult[]>

// ============================================================
// Helper Functions
// ============================================================

/**
 * Group results by type
 */
function groupResultsByType(results: SearchResult[]): GroupedResults {
  return results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = []
      }
      acc[result.type].push(result)
      return acc
    },
    {} as GroupedResults
  )
}

// ============================================================
// State Display Components
// ============================================================

/**
 * No query state
 */
function NoQueryState() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="font-mono text-text-muted">
          Enter a search query to find blocks, transactions, addresses, or contracts
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading state
 */
function LoadingState() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="font-mono text-text-muted">Searching...</div>
      </CardContent>
    </Card>
  )
}

/**
 * No results state
 */
function NoResultsState() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="mb-2 font-mono text-lg text-text-secondary">No Results Found</div>
        <div className="font-mono text-sm text-text-muted">
          Try searching for a block number, transaction hash, or address
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Results Group Component
// ============================================================

/**
 * Single type results group
 */
function ResultsGroup({ type, results }: { type: SearchResultType; results: SearchResult[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {TYPE_ICONS[type]} {TYPE_LABELS[type]} ({results.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {results.map((result) => (
            <SearchResultCard key={`${result.type}-${result.value}`} result={result} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Main Component
// ============================================================

/**
 * Search results list (SRP: Only displays search results)
 */
export function SearchResultsList({
  results,
  loading,
  error,
  query,
  onRetry,
}: SearchResultsListProps) {
  const groupedResults = useMemo(() => groupResultsByType(results), [results])

  if (!query) {
    return <NoQueryState />
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorDisplay title="Search Failed" message={error.message} onRetry={onRetry} />
  }

  if (results.length === 0) {
    return <NoResultsState />
  }

  const typesWithResults = (Object.keys(groupedResults) as SearchResultType[]).filter(
    (type) => groupedResults[type]?.length > 0
  )

  return (
    <div className="space-y-8">
      {typesWithResults.map((type) => (
        <ResultsGroup key={type} type={type} results={groupedResults[type]} />
      ))}
    </div>
  )
}

// ============================================================
// Search Tips Component
// ============================================================

/**
 * Search tips card
 */
export function SearchTipsCard() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Search Tips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 font-mono text-sm text-text-secondary">
          <div>
            <span className="text-accent-blue">Block Number:</span> e.g., 12345 or 0x3039
          </div>
          <div>
            <span className="text-accent-blue">Transaction Hash:</span> 0x followed by 64 hex
            characters
          </div>
          <div>
            <span className="text-accent-blue">Address:</span> 0x followed by 40 hex characters
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
