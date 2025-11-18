import { gql } from '@apollo/client'

/**
 * GraphQL Queries for Blockchain Explorer
 */

// Get latest indexed block height
export const GET_LATEST_HEIGHT = gql`
  query GetLatestHeight {
    latestHeight
  }
`

// Get block by number
export const GET_BLOCK = gql`
  query GetBlock($number: BigInt!) {
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
  query GetBlockByHash($hash: Hash!) {
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
  query GetTransaction($hash: Hash!) {
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
  query GetTransactionsByAddress($address: Address!, $limit: Int, $offset: Int) {
    transactionsByAddress(address: $address, pagination: { limit: $limit, offset: $offset }) {
      nodes {
        hash
        blockNumber
        from
        to
        value
        gasUsed
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
  query GetAddressBalance($address: Address!, $blockNumber: BigInt) {
    addressBalance(address: $address, blockNumber: $blockNumber)
  }
`

// Get balance history
export const GET_BALANCE_HISTORY = gql`
  query GetBalanceHistory(
    $address: Address!
    $fromBlock: BigInt!
    $toBlock: BigInt!
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
    $address: Address
    $topics: [Hash!]
    $blockNumberFrom: BigInt
    $blockNumberTo: BigInt
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
