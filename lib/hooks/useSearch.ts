'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLazyQuery } from '@apollo/client'
import { SEARCH, SearchResult, SearchVariables, SearchData } from '@/lib/graphql/queries/search'
import { GET_BLOCK, GET_BLOCK_BY_HASH } from '@/lib/apollo/queries'
import { GET_TRANSACTION } from '@/lib/apollo/queries'
import { detectInputType } from '@/lib/utils/validation'
import { formatHash, formatNumber } from '@/lib/utils/format'

// Feature flag to enable/disable backend search API
// TODO: Set to true when backend search API is ready
const USE_BACKEND_SEARCH_API = false

interface UseSearchOptions {
  types?: Array<'block' | 'transaction' | 'address' | 'contract'>
  limit?: number
  debounce?: number
}

interface UseSearchResult {
  results: SearchResult[]
  loading: boolean
  error: Error | null
  search: (query: string) => void
  clear: () => void
}

/**
 * Hook for unified search across blocks, transactions, addresses, and contracts
 *
 * Currently uses client-side search with existing queries until backend implements
 * the unified search API. When backend is ready, set USE_BACKEND_SEARCH_API to true.
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
  const { types, limit = 10, debounce = 300 } = options

  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Backend search query (for when API is ready)
  const [executeBackendSearch] = useLazyQuery<SearchData, SearchVariables>(SEARCH)

  // Client-side search queries
  const [getBlock] = useLazyQuery(GET_BLOCK)
  const [getBlockByHash] = useLazyQuery(GET_BLOCK_BY_HASH)
  const [getTransaction] = useLazyQuery(GET_TRANSACTION)

  // Debounce the search query
  const search = useCallback((query: string) => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setError(null)
      return
    }

    setDebouncedQuery(trimmed)
  }, [])

  const clear = useCallback(() => {
    setResults([])
    setError(null)
    setDebouncedQuery('')
  }, [])

  // Execute search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      if (USE_BACKEND_SEARCH_API) {
        performBackendSearch(debouncedQuery)
      } else {
        performClientSearch(debouncedQuery)
      }
    }, debounce)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  /**
   * Backend API search (when available)
   */
  const performBackendSearch = async (query: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: queryError } = await executeBackendSearch({
        variables: {
          query,
          ...(types ? { types: types.map((t) => t.toString()) } : {}),
          limit,
        },
      })

      if (queryError) {
        throw queryError
      }

      setResults(data?.search ?? [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'))
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Client-side search implementation (current)
   * Searches across blocks, transactions, and addresses using existing queries
   */
  const performClientSearch = async (query: string) => {
    setLoading(true)
    setError(null)

    try {
      const searchResults: SearchResult[] = []
      const inputType = detectInputType(query)

      // Filter types based on options
      const searchTypes = types ?? ['block', 'transaction', 'address', 'contract']

      // Search blocks
      if (searchTypes.includes('block') && (inputType === 'blockNumber' || inputType === 'hash')) {
        try {
          if (inputType === 'blockNumber') {
            const { data } = await getBlock({ variables: { number: query } })
            if (data?.block) {
              const block = data.block
              searchResults.push({
                type: 'block',
                value: block.number.toString(),
                label: `Block #${formatNumber(BigInt(block.number))}`,
                metadata: JSON.stringify({
                  hash: block.hash,
                  timestamp: block.timestamp,
                  transactionCount: block.transactionCount,
                }),
              })
            }
          } else if (inputType === 'hash') {
            const { data } = await getBlockByHash({ variables: { hash: query } })
            if (data?.blockByHash) {
              const block = data.blockByHash
              searchResults.push({
                type: 'block',
                value: block.hash,
                label: `Block #${formatNumber(BigInt(block.number))}`,
                metadata: JSON.stringify({
                  number: block.number,
                  hash: block.hash,
                  timestamp: block.timestamp,
                  transactionCount: block.transactionCount,
                }),
              })
            }
          }
        } catch {
          // Ignore errors for individual queries
        }
      }

      // Search transactions
      if (searchTypes.includes('transaction') && inputType === 'hash') {
        try {
          const { data } = await getTransaction({ variables: { hash: query } })
          if (data?.transaction) {
            const tx = data.transaction
            searchResults.push({
              type: 'transaction',
              value: tx.hash,
              label: `Transaction ${formatHash(tx.hash)}`,
              metadata: JSON.stringify({
                from: tx.from,
                to: tx.to,
                value: tx.value,
                blockNumber: tx.blockNumber,
                timestamp: tx.timestamp,
              }),
            })
          }
        } catch {
          // Ignore errors for individual queries
        }
      }

      // Search addresses
      if (searchTypes.includes('address') && inputType === 'address') {
        // For addresses, we just validate the format and return it as a result
        // Actual address data will be loaded when navigating to the address page
        searchResults.push({
          type: 'address',
          value: query,
          label: `Address ${formatHash(query)}`,
          metadata: JSON.stringify({
            address: query,
          }),
        })
      }

      // Limit results
      const limitedResults = searchResults.slice(0, limit)
      setResults(limitedResults)

      if (limitedResults.length === 0 && inputType) {
        // No results found but input is valid
        setError(new Error(`No results found for ${inputType}`))
      } else if (!inputType && query.length > 0) {
        // Invalid input format
        setError(new Error('Invalid search format. Enter block number, hash, or address.'))
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'))
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return {
    results,
    loading,
    error,
    search,
    clear,
  }
}

/**
 * Hook for search autocomplete suggestions
 *
 * Provides real-time search suggestions as user types
 */
export function useSearchAutocomplete(limit = 5): UseSearchResult {
  return useSearch({ limit, debounce: 150 })
}
