import { gql } from '@apollo/client'

/**
 * GraphQL Queries for Blockchain Explorer
 *
 * Note: Custom scalars (BigInt, Hash, Address, Bytes) are serialized as strings by the backend.
 * Therefore, all query variables use String types instead of custom scalar types.
 */

// Get latest indexed block height
export const GET_LATEST_HEIGHT = gql`
  query GetLatestHeight {
    latestHeight
  }
`

// Get block by number
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
        value
        gas
        gasPrice
        type
        nonce
      }
    }
  }
`

// Get block by hash
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
        value
      }
    }
  }
`

// Get transaction by hash
export const GET_TRANSACTION = gql`
  query GetTransaction($hash: String!) {
    transaction(hash: $hash) {
      hash
      blockNumber
      blockHash
      transactionIndex
      from
      to
      value
      gas
      gasPrice
      maxFeePerGas
      maxPriorityFeePerGas
      type
      input
      nonce
      v
      r
      s
      chainId
      feePayer
      feePayerSignatures {
        v
        r
        s
      }
      receipt {
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
        }
      }
    }
  }
`

// Get transactions by address
export const GET_TRANSACTIONS_BY_ADDRESS = gql`
  query GetTransactionsByAddress($address: String!, $limit: Int, $offset: Int) {
    transactionsByAddress(address: $address, pagination: { limit: $limit, offset: $offset }) {
      nodes {
        hash
        blockNumber
        from
        to
        value
        gas
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// Get address balance
export const GET_ADDRESS_BALANCE = gql`
  query GetAddressBalance($address: String!, $blockNumber: String) {
    addressBalance(address: $address, blockNumber: $blockNumber)
  }
`

// Get balance history
export const GET_BALANCE_HISTORY = gql`
  query GetBalanceHistory(
    $address: String!
    $fromBlock: String!
    $toBlock: String!
    $limit: Int
    $offset: Int
  ) {
    balanceHistory(
      address: $address
      fromBlock: $fromBlock
      toBlock: $toBlock
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
        blockNumber
        balance
        delta
        transactionHash
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

// Get logs with filtering
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

// Get blocks by time range for analytics
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

// Get block count and transaction count
export const GET_NETWORK_METRICS = gql`
  query GetNetworkMetrics {
    blockCount
    transactionCount
  }
`

// ============================================================================
// Subscriptions
// ============================================================================

/**
 * Subscribe to new blocks in real-time
 */
export const SUBSCRIBE_NEW_BLOCK = gql`
  subscription NewBlock {
    newBlock {
      number
      hash
      parentHash
      timestamp
      miner
      txCount
    }
  }
`

/**
 * Subscribe to new confirmed transactions in real-time
 */
export const SUBSCRIBE_NEW_TRANSACTION = gql`
  subscription NewTransaction {
    newTransaction {
      hash
      from
      to
      value
      nonce
      gas
      type
      gasPrice
      maxFeePerGas
      maxPriorityFeePerGas
      blockNumber
      blockHash
      transactionIndex
      feePayer
    }
  }
`

/**
 * Subscribe to new pending transactions in real-time
 */
export const SUBSCRIBE_PENDING_TRANSACTIONS = gql`
  subscription NewPendingTransactions {
    newPendingTransactions {
      hash
      from
      to
      value
      nonce
      gas
      type
      gasPrice
      maxFeePerGas
      maxPriorityFeePerGas
      feePayer
    }
  }
`

/**
 * Subscribe to logs with filtering
 * Variables must be passed as { filter: LogFilterInput }
 * Note: filter argument is required by backend (non-null)
 */
export const SUBSCRIBE_LOGS = gql`
  subscription Logs($filter: LogFilterInput!) {
    logs(filter: $filter) {
      address
      topics
      data
      blockNumber
      blockHash
      transactionHash
      logIndex
      removed
    }
  }
`

/**
 * Get token balances for an address
 * Supports filtering by tokenType (ERC-20, ERC-721, ERC-1155)
 */
export const GET_TOKEN_BALANCES = gql`
  query GetTokenBalances($address: String!, $tokenType: String) {
    tokenBalances(address: $address, tokenType: $tokenType) {
      contractAddress
      tokenType
      balance
      tokenId
      name
      symbol
      decimals
      metadata
    }
  }
`
