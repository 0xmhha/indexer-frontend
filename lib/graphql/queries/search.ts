import { gql } from '@apollo/client'

// ============================================================================
// Search Queries
// ============================================================================

/**
 * Unified search query for blocks, transactions, addresses, and contracts
 *
 * ✅ Backend API implemented with Simple Format (2025-11-25)
 * Returns standardized SearchResult with type, value, label, metadata
 *
 * @example
 * ```graphql
 * # Search for a block by number
 * search(query: "12345") → { type: "block", value: "12345", label: "Block #12345" }
 *
 * # Search for transaction by hash
 * search(query: "0xabc...") → { type: "transaction", value: "0xabc...", label: "0xabc..." }
 * ```
 *
 * @see Frontend API Integration Guide for full specification
 */
export const SEARCH = gql`
  query Search($query: String!, $types: [String], $limit: Int = 10) {
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
 * Uses the same simple format as the main search query
 */
export const SEARCH_AUTOCOMPLETE = gql`
  query SearchAutocomplete($query: String!, $limit: Int = 5) {
    search(query: $query, limit: $limit) {
      type
      value
      label
      metadata
    }
  }
`

// ============================================================================
// Search Result Types (Simple Format)
// ============================================================================

/**
 * Search result type enumeration
 */
export type SearchResultType = 'block' | 'transaction' | 'address' | 'contract'

/**
 * Simple search result format from backend API
 *
 * @example
 * ```typescript
 * // Block result
 * { type: "block", value: "12345", label: "Block #12345", metadata: null }
 *
 * // Transaction result
 * { type: "transaction", value: "0xabc...", label: "0xabc...", metadata: '{"from":"0x...","to":"0x..."}' }
 *
 * // Address result
 * { type: "address", value: "0x123...", label: "0x123...", metadata: '{"balance":"1000000"}' }
 * ```
 */
export interface SearchResult {
  /** Result type: "block" | "transaction" | "address" | "contract" */
  type: SearchResultType
  /** Primary identifier (block number, tx hash, address) */
  value: string
  /** Human-readable label (optional, may be null) */
  label: string | null
  /** Additional JSON data (optional, may be null) */
  metadata: string | null
}

/**
 * Parsed metadata from search result
 */
export interface SearchResultMetadata {
  // Block metadata
  timestamp?: string
  miner?: string
  transactionCount?: number
  // Transaction metadata
  from?: string
  to?: string
  blockNumber?: string
  // Address metadata
  balance?: string
  isContract?: boolean
}

/**
 * Parse metadata JSON string to object
 */
export function parseSearchMetadata(metadata: string | null): SearchResultMetadata | null {
  if (!metadata) return null
  try {
    return JSON.parse(metadata) as SearchResultMetadata
  } catch {
    return null
  }
}

export interface SearchVariables {
  query: string
  types?: string[] | null
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
  search: SearchResult[]
}
