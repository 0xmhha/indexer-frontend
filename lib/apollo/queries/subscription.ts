/**
 * GraphQL Subscriptions for Real-time Updates
 *
 * Note: Custom scalars (BigInt, Hash, Address, Bytes) are serialized as strings by the backend.
 * Therefore, all query variables use String types instead of custom scalar types.
 */

import { gql } from '@apollo/client'

/**
 * Subscribe to new blocks in real-time
 * Note: Backend uses transactionCount (not txCount)
 *
 * @param replayLast - Number of recent blocks to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_NEW_BLOCK = gql`
  subscription NewBlock($replayLast: Int) {
    newBlock(replayLast: $replayLast) {
      number
      hash
      parentHash
      timestamp
      miner
      transactionCount
    }
  }
`

/**
 * Subscribe to new confirmed transactions in real-time
 *
 * @param replayLast - Number of recent transactions to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_NEW_TRANSACTION = gql`
  subscription NewTransaction($replayLast: Int) {
    newTransaction(replayLast: $replayLast) {
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
 *
 * Note: This subscription does NOT support replayLast parameter.
 * Pending transactions are ephemeral and not stored for replay.
 *
 * @param limit - Maximum number of pending transactions to receive per batch
 */
export const SUBSCRIBE_PENDING_TRANSACTIONS = gql`
  subscription NewPendingTransactions($limit: Int) {
    newPendingTransactions(limit: $limit) {
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
 * Variables must be passed as { filter: LogFilter }
 * Note: filter argument is required by backend (non-null)
 *
 * @param filter - Log filter criteria (address, topics, block range)
 * @param replayLast - Number of recent logs to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_LOGS = gql`
  subscription Logs($filter: LogFilter!, $replayLast: Int) {
    logs(filter: $filter, replayLast: $replayLast) {
      address
      topics
      data
      blockNumber
      blockHash
      transactionHash
      transactionIndex
      logIndex
      removed
    }
  }
`

/**
 * Subscribe to chain configuration changes in real-time
 * Emitted when chain parameters like gasLimit, chainId are updated
 *
 * @param replayLast - Number of recent config changes to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_CHAIN_CONFIG = gql`
  subscription ChainConfig($replayLast: Int) {
    chainConfig(replayLast: $replayLast) {
      blockNumber
      blockHash
      parameter
      oldValue
      newValue
    }
  }
`

/**
 * Subscribe to validator set changes in real-time
 * Emitted when validators are added, removed, or updated
 *
 * @param replayLast - Number of recent validator changes to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_VALIDATOR_SET = gql`
  subscription ValidatorSet($replayLast: Int) {
    validatorSet(replayLast: $replayLast) {
      blockNumber
      blockHash
      changeType
      validator
      validatorSetSize
      validatorInfo
    }
  }
`
