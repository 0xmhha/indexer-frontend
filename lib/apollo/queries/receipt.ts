/**
 * Transaction Receipt GraphQL Queries
 *
 * Note: Custom scalars (BigInt, Hash, Address, Bytes) are serialized as strings by the backend.
 * Therefore, all query variables use String types instead of custom scalar types.
 */

import { gql } from '@apollo/client'

/**
 * Get transaction receipt by hash
 * Returns detailed receipt information including status, gas usage, and logs
 */
export const GET_RECEIPT = gql`
  query GetReceipt($txHash: String!) {
    receipt(transactionHash: $txHash) {
      transactionHash
      blockNumber
      blockHash
      transactionIndex
      status
      gasUsed
      cumulativeGasUsed
      effectiveGasPrice
      contractAddress
      logs {
        address
        topics
        data
        logIndex
        blockNumber
        transactionHash
        decoded {
          eventName
          eventSignature
          params {
            name
            type
            value
            indexed
          }
        }
      }
      logsBloom
    }
  }
`

/**
 * Get all receipts for a specific block
 * Useful for block-level analysis and monitoring
 */
export const GET_RECEIPTS_BY_BLOCK = gql`
  query GetReceiptsByBlock($blockNumber: String!) {
    receiptsByBlock(blockNumber: $blockNumber) {
      transactionHash
      blockNumber
      blockHash
      transactionIndex
      status
      gasUsed
      cumulativeGasUsed
      effectiveGasPrice
      contractAddress
      logs {
        address
        topics
        data
        logIndex
        decoded {
          eventName
          eventSignature
          params {
            name
            type
            value
            indexed
          }
        }
      }
    }
  }
`

/**
 * Get logs with filtering
 */
export const GET_LOGS = gql`
  query GetLogs(
    $address: String
    $topics: [String!]
    $blockNumberFrom: String
    $blockNumberTo: String
    $limit: Int
    $offset: Int
  ) {
    logs(
      filter: {
        address: $address
        topics: $topics
        blockNumberFrom: $blockNumberFrom
        blockNumberTo: $blockNumberTo
      }
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
        address
        topics
        data
        blockNumber
        transactionHash
        logIndex
      }
      totalCount
    }
  }
`
