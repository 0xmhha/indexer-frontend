'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSearch } from '@/lib/hooks/useSearch'
import { Card, CardContent } from '@/components/ui/card'
import { TypeFilter } from '@/components/search/TypeFilter'
import { SearchResultsList, SearchTipsCard } from '@/components/search/SearchResultsList'
import type { SearchResultType } from '@/lib/graphql/queries/search'

// ============================================================
// Sub-Components
// ============================================================

/**
 * Search page header
 */
function SearchHeader({ query }: { query: string }) {
  return (
    <div className="mb-8">
      <div className="annotation mb-2">SEARCH</div>
      <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">SEARCH RESULTS</h1>
      {query && (
        <div className="font-mono text-sm text-text-secondary">
          Showing results for: <span className="text-accent-blue">&quot;{query}&quot;</span>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Main Content Component
// ============================================================

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [selectedTypes, setSelectedTypes] = useState<SearchResultType[]>([])

  const { results, loading, error, search } = useSearch({
    ...(selectedTypes.length > 0 ? { types: selectedTypes } : {}),
    limit: 50,
  })

  // Execute search when query changes
  useEffect(() => {
    if (query) {
      search(query)
    }
  }, [query, search])

  const handleTypeToggle = useCallback((type: SearchResultType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type)
      }
      return [...prev, type]
    })
  }, [])

  const handleClearFilters = useCallback(() => {
    setSelectedTypes([])
  }, [])

  const handleRetry = useCallback(() => {
    search(query)
  }, [search, query])

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchHeader query={query} />

      <TypeFilter
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
        onClearFilters={handleClearFilters}
      />

      <SearchResultsList
        results={results}
        loading={loading}
        error={error}
        query={query}
        onRetry={handleRetry}
      />

      <SearchTipsCard />
    </div>
  )
}

// ============================================================
// Page Export
// ============================================================

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="font-mono text-text-muted">Loading search...</div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
