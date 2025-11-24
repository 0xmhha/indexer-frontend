'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSearch } from '@/lib/hooks/useSearch'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatHash, formatNumber } from '@/lib/utils/format'
import type { SearchResult } from '@/lib/graphql/queries/search'

type SearchType = 'block' | 'transaction' | 'address' | 'contract'

const TYPE_LABELS: Record<SearchType, string> = {
  block: 'Blocks',
  transaction: 'Transactions',
  address: 'Addresses',
  contract: 'Contracts',
}

const TYPE_ICONS: Record<SearchType, string> = {
  block: '▣',
  transaction: '⇄',
  address: '◈',
  contract: '⚙',
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [selectedTypes, setSelectedTypes] = useState<SearchType[]>([])

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

  // Group results by type
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = []
      }
      acc[result.type].push(result)
      return acc
    },
    {} as Record<SearchType, SearchResult[]>
  )

  const handleTypeToggle = (type: SearchType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type)
      }
      return [...prev, type]
    })
  }

  const handleClearFilters = () => {
    setSelectedTypes([])
  }

  const renderSearchResult = (result: SearchResult) => {
    let href = ''
    let metadata: Record<string, unknown> = {}

    try {
      metadata = result.metadata ? JSON.parse(result.metadata) : {}
    } catch {
      // Ignore parse errors
    }

    switch (result.type) {
      case 'block':
        href = `/block/${result.value}`
        break
      case 'transaction':
        href = `/tx/${result.value}`
        break
      case 'address':
        href = `/address/${result.value}`
        break
      case 'contract':
        href = `/address/${result.value}`
        break
    }

    return (
      <Link
        key={`${result.type}-${result.value}`}
        href={href}
        className="block border border-bg-tertiary bg-bg-secondary p-4 transition-colors hover:border-accent-blue hover:bg-bg-tertiary"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-text-muted" aria-hidden="true">
                {TYPE_ICONS[result.type]}
              </span>
              <span className="font-mono text-sm font-medium text-accent-blue">
                {result.label || result.value}
              </span>
            </div>

            {/* Metadata */}
            <div className="mt-2 space-y-1">
              {result.type === 'block' && (
                <>
                  {metadata.hash ? (
                    <div className="font-mono text-xs text-text-secondary">
                      Hash: {formatHash(String(metadata.hash))}
                    </div>
                  ) : null}
                  {metadata.transactionCount !== undefined ? (
                    <div className="font-mono text-xs text-text-muted">
                      {String(metadata.transactionCount)} transactions
                    </div>
                  ) : null}
                </>
              )}

              {result.type === 'transaction' && (
                <>
                  {metadata.from ? (
                    <div className="font-mono text-xs text-text-secondary">
                      From: {formatHash(String(metadata.from))}
                    </div>
                  ) : null}
                  {metadata.to ? (
                    <div className="font-mono text-xs text-text-secondary">
                      To: {formatHash(String(metadata.to))}
                    </div>
                  ) : null}
                  {metadata.value ? (
                    <div className="font-mono text-xs text-text-muted">
                      Value: {formatNumber(BigInt(String(metadata.value)))} wei
                    </div>
                  ) : null}
                </>
              )}

              {result.type === 'address' ? (
                <div className="font-mono text-xs text-text-secondary">
                  {formatHash(result.value)}
                </div>
              ) : null}
            </div>
          </div>

          <div className="ml-4 font-mono text-xs text-text-muted">→</div>
        </div>
      </Link>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">SEARCH</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">
          SEARCH RESULTS
        </h1>
        {query && (
          <div className="font-mono text-sm text-text-secondary">
            Showing results for: <span className="text-accent-blue">&quot;{query}&quot;</span>
          </div>
        )}
      </div>

      {/* Type Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_LABELS) as SearchType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`
                  border px-4 py-2 font-mono text-sm transition-colors
                  ${
                    selectedTypes.includes(type)
                      ? 'border-accent-blue bg-accent-blue text-bg-primary'
                      : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-blue hover:bg-bg-tertiary'
                  }
                `}
                aria-pressed={selectedTypes.includes(type)}
              >
                {TYPE_ICONS[type]} {TYPE_LABELS[type]}
              </button>
            ))}
            {selectedTypes.length > 0 && (
              <button
                onClick={handleClearFilters}
                className="border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-sm text-text-muted transition-colors hover:border-error hover:text-error"
              >
                Clear Filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {!query ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="font-mono text-text-muted">
              Enter a search query to find blocks, transactions, addresses, or contracts
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="font-mono text-text-muted">Searching...</div>
          </CardContent>
        </Card>
      ) : error ? (
        <ErrorDisplay
          title="Search Failed"
          message={error.message}
          onRetry={() => search(query)}
        />
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mb-2 font-mono text-lg text-text-secondary">No Results Found</div>
            <div className="font-mono text-sm text-text-muted">
              Try searching for a block number, transaction hash, or address
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {(Object.keys(groupedResults) as SearchType[])
            .filter((type) => {
              const typeResults = groupedResults[type]
              return typeResults && typeResults.length > 0
            })
            .map((type) => {
              const typeResults = groupedResults[type]
              if (!typeResults) return null

              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle>
                      {TYPE_ICONS[type]} {TYPE_LABELS[type]} ({typeResults.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {typeResults.map((result) => renderSearchResult(result))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}

      {/* Search Tips */}
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
    </div>
  )
}

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
