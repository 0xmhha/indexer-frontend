import { gql } from '@apollo/client'

// ============================================================================
// Search Queries
// ============================================================================

/**
 * Unified search query for blocks, transactions, addresses, and logs
 *
 * ✅ Backend API implemented with Union Types (2025-11-24)
 * Supports automatic type detection with structured data
 *
 * @see Frontend API Integration Guide for full specification
 */
export const SEARCH = gql`
  query Search($query: String!, $types: [String!], $limit: Int) {
    search(query: $query, types: $types, limit: $limit) {
      ... on BlockResult {
        type
        block {
          number
          hash
          timestamp
          parentHash
          miner
          gasUsed
          gasLimit
          transactionCount
        }
      }
      ... on TransactionResult {
        type
        transaction {
          hash
          from
          to
          value
          gas
          gasPrice
          nonce
          blockNumber
          blockHash
          transactionIndex
        }
      }
      ... on AddressResult {
        type
        address
        transactionCount
        balance
      }
      ... on LogResult {
        type
        log {
          address
          topics
          data
          blockNumber
          transactionHash
          logIndex
        }
      }
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
// Search Result Types (Union Type Structure)
// ============================================================================

/**
 * Block data structure from search results
 */
export interface BlockData {
  number: string // BigInt as string
  hash: string
  timestamp: string // BigInt as string
  parentHash: string
  miner: string
  gasUsed: string // BigInt as string
  gasLimit: string // BigInt as string
  transactionCount: number
}

/**
 * Transaction data structure from search results
 */
export interface TransactionData {
  hash: string
  from: string
  to: string // Empty string for contract creation
  value: string // Wei (BigInt as string)
  gas: string // BigInt as string
  gasPrice: string // BigInt as string
  nonce: string // BigInt as string
  blockNumber: string // BigInt as string
  blockHash: string
  transactionIndex: string // BigInt as string
}

/**
 * Log data structure from search results
 */
export interface LogData {
  address: string
  topics: string[]
  data: string
  blockNumber: string // BigInt as string
  transactionHash: string
  logIndex: number
}

/**
 * Union type results from search query
 */
export interface BlockResult {
  type: 'block'
  block: BlockData
}

export interface TransactionResult {
  type: 'transaction'
  transaction: TransactionData
}

export interface AddressResult {
  type: 'address'
  address: string
  transactionCount: number
  balance: string // Wei (BigInt as string)
}

export interface LogResult {
  type: 'log'
  log: LogData
}

/**
 * Search result union type
 */
export type SearchResult = BlockResult | TransactionResult | AddressResult | LogResult

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
