/**
 * Block-related GraphQL Queries
 *
 * Note: Custom scalars (BigInt, Hash, Address, Bytes) are serialized as strings by the backend.
 * Therefore, all query variables use String types instead of custom scalar types.
 */

import { gql } from '@apollo/client'

/**
 * Get latest indexed block height
 */
export const GET_LATEST_HEIGHT = gql`
  query GetLatestHeight {
    latestHeight
  }
`

/**
 * Get block by number
 */
export const GET_BLOCK = gql`
  query GetBlock($number: String!) {
    block(number: $number) {
      number
      hash
      parentHash
      timestamp
      miner
      gasUsed
      gasLimit
      size
      transactionCount
      baseFeePerGas
      withdrawalsRoot
      blobGasUsed
      excessBlobGas
      transactions {
        hash
        from
        to
        contractAddress
        value
        gas
        gasPrice
        type
        nonce
      }
    }
  }
`

/**
 * Get block by hash
 */
export const GET_BLOCK_BY_HASH = gql`
  query GetBlockByHash($hash: String!) {
    blockByHash(hash: $hash) {
      number
      hash
      parentHash
      timestamp
      miner
      gasUsed
      gasLimit
      size
      transactionCount
      baseFeePerGas
      withdrawalsRoot
      blobGasUsed
      excessBlobGas
      transactions {
        hash
        from
        to
        contractAddress
        value
        gas
        gasPrice
        type
        nonce
      }
    }
  }
`

/**
 * Get blocks by time range for analytics
 */
export const GET_BLOCKS_BY_TIME_RANGE = gql`
  query GetBlocksByTimeRange($fromTime: String!, $toTime: String!, $limit: Int) {
    blocksByTimeRange(
      fromTime: $fromTime
      toTime: $toTime
      pagination: { limit: $limit }
    ) {
      nodes {
        number
        hash
        timestamp
        miner
        gasUsed
        gasLimit
        transactionCount
      }
      totalCount
    }
  }
`

/**
 * Get block count (efficient root query)
 */
export const GET_BLOCK_COUNT = gql`
  query GetBlockCount {
    blockCount
  }
`
