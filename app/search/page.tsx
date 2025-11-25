'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSearch } from '@/lib/hooks/useSearch'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatHash, formatNumber } from '@/lib/utils/format'
import type { SearchResult } from '@/lib/graphql/queries/search'

type SearchType = 'block' | 'transaction' | 'address' | 'contract' | 'log'

const TYPE_LABELS: Record<SearchType, string> = {
  block: 'Blocks',
  transaction: 'Transactions',
  address: 'Addresses',
  contract: 'Contracts',
  log: 'Event Logs',
}

const TYPE_ICONS: Record<SearchType, string> = {
  block: '▣',
  transaction: '⇄',
  address: '◈',
  contract: '⚙',
  log: '📋',
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
    let key = ''
    let label = ''

    // Type-specific rendering using discriminated union
    switch (result.type) {
      case 'block': {
        const block = result.block
        href = `/block/${block.number}`
        key = `block-${block.number}`
        label = `Block #${formatNumber(BigInt(block.number))}`

        return (
          <Link
            key={key}
            href={href}
            className="block border border-bg-tertiary bg-bg-secondary p-4 transition-colors hover:border-accent-blue hover:bg-bg-tertiary"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-text-muted" aria-hidden="true">
                    {TYPE_ICONS.block}
                  </span>
                  <span className="font-mono text-sm font-medium text-accent-blue">
                    {label}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="font-mono text-xs text-text-secondary">
                    Hash: {formatHash(block.hash)}
                  </div>
                  <div className="font-mono text-xs text-text-muted">
                    {block.transactionCount} transactions
                  </div>
                  {block.miner && (
                    <div className="font-mono text-xs text-text-muted">
                      Miner: {formatHash(block.miner)}
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-4 font-mono text-xs text-text-muted">→</div>
            </div>
          </Link>
        )
      }

      case 'transaction': {
        const tx = result.transaction
        href = `/tx/${tx.hash}`
        key = `transaction-${tx.hash}`
        label = `Transaction ${formatHash(tx.hash)}`

        return (
          <Link
            key={key}
            href={href}
            className="block border border-bg-tertiary bg-bg-secondary p-4 transition-colors hover:border-accent-blue hover:bg-bg-tertiary"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-text-muted" aria-hidden="true">
                    {TYPE_ICONS.transaction}
                  </span>
                  <span className="font-mono text-sm font-medium text-accent-blue">
                    {label}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="font-mono text-xs text-text-secondary">
                    From: {formatHash(tx.from)}
                  </div>
                  {tx.to ? (
                    <div className="font-mono text-xs text-text-secondary">
                      To: {formatHash(tx.to)}
                    </div>
                  ) : (
                    <div className="font-mono text-xs text-text-secondary">
                      To: <span className="text-accent-orange">Contract Creation</span>
                    </div>
                  )}
                  <div className="font-mono text-xs text-text-muted">
                    Value: {formatNumber(BigInt(tx.value))} wei
                  </div>
                  <div className="font-mono text-xs text-text-muted">
                    Block: #{formatNumber(BigInt(tx.blockNumber))}
                  </div>
                </div>
              </div>
              <div className="ml-4 font-mono text-xs text-text-muted">→</div>
            </div>
          </Link>
        )
      }

      case 'address': {
        href = `/address/${result.address}`
        key = `address-${result.address}`
        label = `Address ${formatHash(result.address)}`

        return (
          <Link
            key={key}
            href={href}
            className="block border border-bg-tertiary bg-bg-secondary p-4 transition-colors hover:border-accent-blue hover:bg-bg-tertiary"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-text-muted" aria-hidden="true">
                    {TYPE_ICONS.address}
                  </span>
                  <span className="font-mono text-sm font-medium text-accent-blue">
                    {label}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="font-mono text-xs text-text-secondary">
                    {formatHash(result.address)}
                  </div>
                  {result.transactionCount > 0 && (
                    <div className="font-mono text-xs text-text-muted">
                      {result.transactionCount} transactions
                    </div>
                  )}
                  {result.balance !== '0' && (
                    <div className="font-mono text-xs text-text-muted">
                      Balance: {formatNumber(BigInt(result.balance))} wei
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-4 font-mono text-xs text-text-muted">→</div>
            </div>
          </Link>
        )
      }

      case 'log': {
        const log = result.log
        href = `/tx/${log.transactionHash}`
        key = `log-${log.transactionHash}-${log.logIndex}`
        label = `Event Log #${log.logIndex}`

        return (
          <Link
            key={key}
            href={href}
            className="block border border-bg-tertiary bg-bg-secondary p-4 transition-colors hover:border-accent-blue hover:bg-bg-tertiary"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-text-muted" aria-hidden="true">
                    📋
                  </span>
                  <span className="font-mono text-sm font-medium text-accent-blue">
                    {label}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="font-mono text-xs text-text-secondary">
                    Contract: {formatHash(log.address)}
                  </div>
                  <div className="font-mono text-xs text-text-secondary">
                    Transaction: {formatHash(log.transactionHash)}
                  </div>
                  <div className="font-mono text-xs text-text-muted">
                    Block: #{formatNumber(BigInt(log.blockNumber))}
                  </div>
                </div>
              </div>
              <div className="ml-4 font-mono text-xs text-text-muted">→</div>
            </div>
          </Link>
        )
      }
    }
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
