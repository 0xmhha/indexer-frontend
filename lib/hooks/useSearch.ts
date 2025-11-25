'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLazyQuery } from '@apollo/client'
import { SEARCH, SearchResult, SearchVariables, SearchData } from '@/lib/graphql/queries/search'
import { GET_BLOCK, GET_BLOCK_BY_HASH } from '@/lib/apollo/queries'
import { GET_TRANSACTION } from '@/lib/apollo/queries'
import { detectInputType } from '@/lib/utils/validation'
import { PAGINATION, TIMING } from '@/lib/config/constants'

// Feature flag to enable/disable backend search API
// ✅ Backend search API is ready (2025-11-24)
const USE_BACKEND_SEARCH_API = true

interface UseSearchOptions {
  types?: Array<'block' | 'transaction' | 'address' | 'contract' | 'log'>
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
 * ✅ Now using backend Search API (implemented 2025-11-24)
 * Falls back to client-side search if backend API is disabled.
 *
 * @param options Search options including types filter, result limit, and debounce delay
 * @returns Search results, loading state, error state, and search/clear functions
 *
 * @example
 * ```tsx
 * const { results, loading, error, search } = useSearch({
 *   types: ['block', 'transaction'],
 *   limit: 10
 * })
 *
 * // Execute search
 * search('0x1234...')
 * ```
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
  const { types, limit = PAGINATION.SEARCH_LIMIT, debounce = TIMING.SEARCH_DEBOUNCE } = options

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
        // Handle specific backend errors as per backend documentation
        const errorMessage = queryError.message || ''

        if (errorMessage.includes('storage does not support')) {
          throw new Error('Search functionality is temporarily unavailable. Please try again later.')
        }

        throw queryError
      }

      const searchResults = data?.search ?? []
      setResults(searchResults)

      // Show friendly message if no results found
      if (searchResults.length === 0 && query.trim()) {
        setError(new Error('No results found for your search query.'))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setError(new Error(errorMessage))
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Client-side search implementation (fallback)
   * Searches across blocks, transactions, and addresses using existing queries
   * Returns Union Type results to match backend API structure
   */
  const performClientSearch = async (query: string) => {
    setLoading(true)
    setError(null)

    try {
      const searchResults: SearchResult[] = []
      const inputType = detectInputType(query)

      // Filter types based on options
      const searchTypes = types ?? ['block', 'transaction', 'address', 'contract', 'log']

      // Search blocks
      if (searchTypes.includes('block') && (inputType === 'blockNumber' || inputType === 'hash')) {
        try {
          if (inputType === 'blockNumber') {
            const { data } = await getBlock({ variables: { number: query } })
            if (data?.block) {
              const block = data.block
              searchResults.push({
                type: 'block',
                block: {
                  number: block.number.toString(),
                  hash: block.hash,
                  timestamp: block.timestamp.toString(),
                  parentHash: block.parentHash,
                  miner: block.miner || '',
                  gasUsed: block.gasUsed?.toString() || '0',
                  gasLimit: block.gasLimit?.toString() || '0',
                  transactionCount: block.transactionCount || 0,
                },
              })
            }
          } else if (inputType === 'hash') {
            const { data } = await getBlockByHash({ variables: { hash: query } })
            if (data?.blockByHash) {
              const block = data.blockByHash
              searchResults.push({
                type: 'block',
                block: {
                  number: block.number.toString(),
                  hash: block.hash,
                  timestamp: block.timestamp.toString(),
                  parentHash: block.parentHash,
                  miner: block.miner || '',
                  gasUsed: block.gasUsed?.toString() || '0',
                  gasLimit: block.gasLimit?.toString() || '0',
                  transactionCount: block.transactionCount || 0,
                },
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
              transaction: {
                hash: tx.hash,
                from: tx.from,
                to: tx.to || '',
                value: tx.value?.toString() || '0',
                gas: tx.gas?.toString() || '0',
                gasPrice: tx.gasPrice?.toString() || '0',
                nonce: tx.nonce?.toString() || '0',
                blockNumber: tx.blockNumber?.toString() || '0',
                blockHash: tx.blockHash || '',
                transactionIndex: tx.transactionIndex?.toString() || '0',
              },
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
          address: query,
          transactionCount: 0, // Will be loaded on address page
          balance: '0', // Will be loaded on address page
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
export function useSearchAutocomplete(limit = PAGINATION.AUTOCOMPLETE_LIMIT): UseSearchResult {
  return useSearch({ limit, debounce: 150 }) // Faster debounce for autocomplete
}
