'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLazyQuery } from '@apollo/client'
import {
  SEARCH,
  SearchResult,
  SearchResultType,
  SearchVariables,
  SearchData,
} from '@/lib/graphql/queries/search'
import { GET_BLOCK, GET_BLOCK_BY_HASH } from '@/lib/apollo/queries'
import { GET_TRANSACTION } from '@/lib/apollo/queries'
import { detectInputType } from '@/lib/utils/validation'
import { PAGINATION, TIMING } from '@/lib/config/constants'

// Feature flag to enable/disable backend search API
// ✅ Backend search API is ready (2025-11-25)
const USE_BACKEND_SEARCH_API = true

interface UseSearchOptions {
  types?: Array<SearchResultType>
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

// ============================================================
// Search Result Builders (SRP: Single responsibility for each type)
// ============================================================

/**
 * Build a block search result from block data
 */
function buildBlockResult(block: {
  number: string | number
  hash: string
  timestamp?: string | number
  miner?: string
  transactionCount?: number
}): SearchResult {
  return {
    type: 'block',
    value: block.number.toString(),
    label: `Block #${block.number}`,
    metadata: JSON.stringify({
      hash: block.hash,
      timestamp: block.timestamp?.toString(),
      miner: block.miner || '',
      transactionCount: block.transactionCount || 0,
    }),
  }
}

/**
 * Build a transaction search result from transaction data
 */
function buildTransactionResult(tx: {
  hash: string
  from: string
  to?: string | null
  blockNumber?: string | number
}): SearchResult {
  return {
    type: 'transaction',
    value: tx.hash,
    label: tx.hash,
    metadata: JSON.stringify({
      from: tx.from,
      to: tx.to || '',
      blockNumber: tx.blockNumber?.toString() || '0',
    }),
  }
}

/**
 * Build an address search result
 */
function buildAddressResult(address: string): SearchResult {
  return {
    type: 'address',
    value: address,
    label: address,
    metadata: null,
  }
}

// ============================================================
// Error Handling (SRP: Centralized error message generation)
// ============================================================

/**
 * Create user-friendly error message for search
 */
function createSearchError(
  inputType: string | null,
  query: string
): Error | null {
  if (!inputType && query.length > 0) {
    return new Error('Invalid search format. Enter block number, hash, or address.')
  }
  if (inputType) {
    return new Error(`No results found for ${inputType}`)
  }
  return null
}

/**
 * Handle backend API errors with user-friendly messages
 */
function handleBackendError(errorMessage: string): Error {
  if (errorMessage.includes('storage does not support')) {
    return new Error('Search functionality is temporarily unavailable. Please try again later.')
  }
  return new Error(errorMessage || 'Search failed')
}

// ============================================================
// Main Hook
// ============================================================

/**
 * Hook for unified search across blocks, transactions, addresses, and contracts
 *
 * ✅ Now using backend Search API with Simple Format (implemented 2025-11-25)
 * Returns standardized results with { type, value, label, metadata }
 * Falls back to client-side search if backend API is disabled.
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
  const {
    types,
    limit = PAGINATION.SEARCH_LIMIT,
    debounce = TIMING.SEARCH_DEBOUNCE,
  } = options

  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // GraphQL queries
  const [executeBackendSearch] = useLazyQuery<SearchData, SearchVariables>(SEARCH)
  const [getBlock] = useLazyQuery(GET_BLOCK)
  const [getBlockByHash] = useLazyQuery(GET_BLOCK_BY_HASH)
  const [getTransaction] = useLazyQuery(GET_TRANSACTION)

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

  // Backend search handler
  const performBackendSearch = useCallback(
    async (query: string) => {
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
          throw handleBackendError(queryError.message)
        }

        const searchResults = data?.search ?? []
        setResults(searchResults)

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
    },
    [executeBackendSearch, types, limit]
  )

  // Search block by number
  const searchBlockByNumber = useCallback(
    async (query: string): Promise<SearchResult | null> => {
      try {
        const { data } = await getBlock({ variables: { number: query } })
        return data?.block ? buildBlockResult(data.block) : null
      } catch {
        return null
      }
    },
    [getBlock]
  )

  // Search block by hash
  const searchBlockByHash = useCallback(
    async (query: string): Promise<SearchResult | null> => {
      try {
        const { data } = await getBlockByHash({ variables: { hash: query } })
        return data?.blockByHash ? buildBlockResult(data.blockByHash) : null
      } catch {
        return null
      }
    },
    [getBlockByHash]
  )

  // Search transaction by hash
  const searchTransaction = useCallback(
    async (query: string): Promise<SearchResult | null> => {
      try {
        const { data } = await getTransaction({ variables: { hash: query } })
        return data?.transaction ? buildTransactionResult(data.transaction) : null
      } catch {
        return null
      }
    },
    [getTransaction]
  )

  // Client-side search handler
  const performClientSearch = useCallback(
    async (query: string) => {
      setLoading(true)
      setError(null)

      try {
        const searchResults: SearchResult[] = []
        const inputType = detectInputType(query)
        const searchTypes = types ?? ['block', 'transaction', 'address', 'contract']

        // Search blocks
        if (searchTypes.includes('block')) {
          if (inputType === 'blockNumber') {
            const result = await searchBlockByNumber(query)
            if (result) {searchResults.push(result)}
          } else if (inputType === 'hash') {
            const result = await searchBlockByHash(query)
            if (result) {searchResults.push(result)}
          }
        }

        // Search transactions
        if (searchTypes.includes('transaction') && inputType === 'hash') {
          const result = await searchTransaction(query)
          if (result) {searchResults.push(result)}
        }

        // Search addresses
        if (searchTypes.includes('address') && inputType === 'address') {
          searchResults.push(buildAddressResult(query))
        }

        const limitedResults = searchResults.slice(0, limit)
        setResults(limitedResults)

        if (limitedResults.length === 0) {
          setError(createSearchError(inputType, query))
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'))
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [types, limit, searchBlockByNumber, searchBlockByHash, searchTransaction]
  )

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
  }, [debouncedQuery, debounce, performBackendSearch, performClientSearch])

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
 */
export function useSearchAutocomplete(limit = PAGINATION.AUTOCOMPLETE_LIMIT): UseSearchResult {
  return useSearch({ limit, debounce: 150 })
}
