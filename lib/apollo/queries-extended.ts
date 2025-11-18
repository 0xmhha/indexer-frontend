import { gql } from '@apollo/client'

// Existing queries...
export { GET_LATEST_HEIGHT, GET_BLOCK, GET_BLOCK_BY_HASH, GET_TRANSACTION, GET_TRANSACTIONS_BY_ADDRESS, GET_ADDRESS_BALANCE, GET_BALANCE_HISTORY, GET_LOGS } from './queries'

/**
 * Additional queries for Phase 3
 */

// Get blocks with pagination and filtering
export const GET_BLOCKS = gql`
  query GetBlocks(
    $limit: Int
    $offset: Int
    $numberFrom: BigInt
    $numberTo: BigInt
    $miner: Address
    $orderBy: String
    $orderDirection: String
  ) {
    blocks(
      pagination: { limit: $limit, offset: $offset }
      filter: {
        numberFrom: $numberFrom
        numberTo: $numberTo
        miner: $miner
      }
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      nodes {
        number
        hash
        timestamp
        miner
        gasUsed
        gasLimit
        size
        transactionCount
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// Get transactions with pagination and filtering
export const GET_TRANSACTIONS = gql`
  query GetTransactions(
    $limit: Int
    $offset: Int
    $blockNumberFrom: BigInt
    $blockNumberTo: BigInt
    $from: Address
    $to: Address
    $type: String
    $orderBy: String
    $orderDirection: String
  ) {
    transactions(
      pagination: { limit: $limit, offset: $offset }
      filter: {
        blockNumberFrom: $blockNumberFrom
        blockNumberTo: $blockNumberTo
        from: $from
        to: $to
        type: $type
      }
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      nodes {
        hash
        blockNumber
        from
        to
        value
        gas
        gasPrice
        type
        timestamp
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// Get network statistics
export const GET_NETWORK_STATS = gql`
  query GetNetworkStats {
    networkStats {
      totalBlocks
      totalTransactions
      averageBlockTime
      averageGasPrice
      totalGasUsed
    }
  }
`

// Get blocks over time for charts
export const GET_BLOCKS_OVER_TIME = gql`
  query GetBlocksOverTime($from: BigInt!, $to: BigInt!, $interval: String!) {
    blocksOverTime(from: $from, to: $to, interval: $interval) {
      timestamp
      count
      averageGasUsed
    }
  }
`

// Get top miners
export const GET_TOP_MINERS = gql`
  query GetTopMiners($limit: Int) {
    topMiners(limit: $limit) {
      address
      blockCount
      totalGasUsed
    }
  }
`
