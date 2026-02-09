/**
 * Gas Tracker GraphQL Queries
 *
 * Queries for fetching gas-related data from recent blocks
 */

import { gql } from '@apollo/client'

/**
 * Get recent blocks with gas data for gas tracker calculation
 * Fetches baseFeePerGas and transaction gas prices
 */
export const GET_RECENT_BLOCKS_FOR_GAS = gql`
  query GetRecentBlocksForGas($limit: Int!) {
    blocks(pagination: { limit: $limit, orderBy: "number", orderDirection: "desc" }) {
      nodes {
        number
        hash
        timestamp
        baseFeePerGas
        gasUsed
        gasLimit
        transactionCount
        transactions {
          hash
          gasPrice
          maxFeePerGas
          maxPriorityFeePerGas
          type
        }
      }
      totalCount
    }
  }
`

/**
 * Get latest block for current gas state
 */
export const GET_LATEST_BLOCK_GAS = gql`
  query GetLatestBlockGas {
    latestHeight
  }
`

/**
 * Subscribe to new blocks for real-time gas updates
 */
export const SUBSCRIBE_NEW_BLOCK_GAS = gql`
  subscription NewBlockGas {
    newBlock {
      number
      hash
      timestamp
      transactionCount
    }
  }
`
