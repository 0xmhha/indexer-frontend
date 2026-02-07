/**
 * Fee Delegation Analytics Queries
 *
 * Note: BigInt values are passed as String type (consistent with other queries in this project)
 */

import { gql } from '@apollo/client'

/**
 * Get Fee Delegation statistics
 * Returns overall metrics about fee delegation usage on the network
 */
export const GET_FEE_DELEGATION_STATS = gql`
  query GetFeeDelegationStats($fromBlock: String, $toBlock: String) {
    feeDelegationStats(fromBlock: $fromBlock, toBlock: $toBlock) {
      totalFeeDelegatedTxs
      totalFeesSaved
      adoptionRate
      avgFeeSaved
    }
  }
`

/**
 * Get Top Fee Payers
 * Returns the list of addresses that have paid the most fees for other users
 */
export const GET_TOP_FEE_PAYERS = gql`
  query GetTopFeePayers($limit: Int, $fromBlock: String, $toBlock: String) {
    topFeePayers(limit: $limit, fromBlock: $fromBlock, toBlock: $toBlock) {
      nodes {
        address
        txCount
        totalFeesPaid
        percentage
      }
      totalCount
    }
  }
`

/**
 * Get specific Fee Payer statistics
 * Returns detailed statistics for a specific fee payer address
 */
export const GET_FEE_PAYER_STATS = gql`
  query GetFeePayerStats($address: String!, $fromBlock: String, $toBlock: String) {
    feePayerStats(address: $address, fromBlock: $fromBlock, toBlock: $toBlock) {
      address
      txCount
      totalFeesPaid
      percentage
    }
  }
`
