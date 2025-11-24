import { gql } from '@apollo/client'

// ============================================================================
// Search Queries
// ============================================================================

/**
 * Unified search query for blocks, transactions, addresses, and contracts
 *
 * TODO: This query will be enabled when the backend implements the search API
 * For now, we use client-side search logic
 */
export const SEARCH = gql`
  query Search($query: String!, $types: [String!], $limit: Int = 10) {
    search(query: $query, types: $types, limit: $limit) {
      type
      value
      label
      metadata
    }
  }
`

/**
 * Search autocomplete for real-time suggestions
 *
 * TODO: This query will be enabled when the backend implements autocomplete API
 */
export const SEARCH_AUTOCOMPLETE = gql`
  query SearchAutocomplete($query: String!, $limit: Int = 5) {
    searchAutocomplete(query: $query, limit: $limit) {
      type
      value
      label
      metadata
    }
  }
`

// ============================================================================
// Search Result Types
// ============================================================================

export interface SearchResult {
  type: 'block' | 'transaction' | 'address' | 'contract'
  value: string
  label?: string
  metadata?: string // JSON string with additional info
}

export interface SearchResultMetadata {
  blockNumber?: string
  timestamp?: string
  from?: string
  to?: string
  value?: string
  contractName?: string
  verified?: boolean
  [key: string]: unknown
}

export interface SearchVariables {
  query: string
  types?: string[]
  limit?: number
}

export interface SearchData {
  search: SearchResult[]
}

export interface SearchAutocompleteVariables {
  query: string
  limit?: number
}

export interface SearchAutocompleteData {
  searchAutocomplete: SearchResult[]
}
