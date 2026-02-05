import { gql } from '@apollo/client'

/**
 * GraphQL Subscription Definitions
 *
 * Real-time subscriptions for blocks, transactions, and logs
 */

// ============================================================================
// Block Subscriptions
// ============================================================================

export const NEW_BLOCK_SUBSCRIPTION = gql`
  subscription OnNewBlock {
    newBlock {
      number
      hash
      parentHash
      timestamp
      miner
      gasLimit
      gasUsed
      difficulty
      totalDifficulty
      size
      transactionCount
      baseFeePerGas
      withdrawalsRoot
      blobGasUsed
      excessBlobGas
    }
  }
`

// ============================================================================
// Transaction Subscriptions
// ============================================================================

export const NEW_TRANSACTION_SUBSCRIPTION = gql`
  subscription OnNewTransaction($replayLast: Int) {
    newTransaction(replayLast: $replayLast) {
      hash
      from
      to
      value
      nonce
      gas
      gasPrice
      input
      type
      blockNumber
      blockHash
      transactionIndex
      maxFeePerGas
      maxPriorityFeePerGas
      feePayer
    }
  }
`

export const NEW_PENDING_TRANSACTION_SUBSCRIPTION = gql`
  subscription OnNewPendingTransactions($limit: Int) {
    newPendingTransactions(limit: $limit) {
      hash
      from
      to
      value
      nonce
      gas
      gasPrice
      input
      type
      maxFeePerGas
      maxPriorityFeePerGas
      feePayer
    }
  }
`

// ============================================================================
// Log Subscriptions
// ============================================================================

export const LOGS_SUBSCRIPTION = gql`
  subscription OnLogs($filter: LogFilter!, $replayLast: Int) {
    logs(filter: $filter, replayLast: $replayLast) {
      address
      topics
      data
      blockNumber
      transactionHash
      transactionIndex
      logIndex
      removed
    }
  }
`

export const LOGS_BY_ADDRESS_SUBSCRIPTION = gql`
  subscription OnLogsByAddress($address: Address!) {
    logs(filter: { address: $address }) {
      address
      topics
      data
      blockNumber
      transactionHash
      transactionIndex
      logIndex
      removed
    }
  }
`

export const LOGS_BY_TOPICS_SUBSCRIPTION = gql`
  subscription OnLogsByTopics($topics: [Hash!]) {
    logs(filter: { topics: $topics }) {
      address
      topics
      data
      blockNumber
      transactionHash
      transactionIndex
      logIndex
      removed
    }
  }
`
