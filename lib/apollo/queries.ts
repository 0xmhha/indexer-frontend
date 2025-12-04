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

// Get block count (efficient root query)
export const GET_BLOCK_COUNT = gql`
  query GetBlockCount {
    blockCount
  }
`

// Get transaction count (efficient root query)
export const GET_TRANSACTION_COUNT = gql`
  query GetTransactionCount {
    transactionCount
  }
`

// ============================================================================
// Transaction Receipt Queries
// ============================================================================

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
      }
    }
  }
`

// ============================================================================
// Subscriptions
// ============================================================================

/**
 * Subscribe to new blocks in real-time
 * Note: Backend uses transactionCount (not txCount)
 */
export const SUBSCRIBE_NEW_BLOCK = gql`
  subscription NewBlock {
    newBlock {
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
 * Variables must be passed as { filter: LogFilter }
 * Note: filter argument is required by backend (non-null)
 */
export const SUBSCRIBE_LOGS = gql`
  subscription Logs($filter: LogFilter!) {
    logs(filter: $filter) {
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
 */
export const SUBSCRIBE_CHAIN_CONFIG = gql`
  subscription ChainConfig {
    chainConfig {
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
 */
export const SUBSCRIBE_VALIDATOR_SET = gql`
  subscription ValidatorSet {
    validatorSet {
      blockNumber
      blockHash
      changeType
      validator
      validatorSetSize
      validatorInfo
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

// ============================================================================
// Consensus Event Subscriptions (Phase B - Real-time WBFT Monitoring)
// ============================================================================

/**
 * Subscribe to real-time consensus block finalization events
 * Provides WBFT consensus data including round info, participation metrics, and epoch data
 */
export const SUBSCRIBE_CONSENSUS_BLOCK = gql`
  subscription OnConsensusBlock {
    consensusBlock {
      blockNumber
      blockHash
      timestamp
      round
      prevRound
      roundChanged
      proposer
      validatorCount
      prepareCount
      commitCount
      participationRate
      missedValidatorRate
      isEpochBoundary
      epochNumber
      epochValidators
    }
  }
`

/**
 * Subscribe to chain fork detection and resolution events
 * Monitors for chain splits and tracks which chain wins
 */
export const SUBSCRIBE_CONSENSUS_FORK = gql`
  subscription OnConsensusFork {
    consensusFork {
      forkBlockNumber
      forkBlockHash
      chain1Hash
      chain1Height
      chain1Weight
      chain2Hash
      chain2Height
      chain2Weight
      resolved
      winningChain
      detectedAt
      detectionLag
    }
  }
`

/**
 * Subscribe to validator set changes at epoch boundaries
 * Tracks when validators are added or removed from the active set
 */
export const SUBSCRIBE_CONSENSUS_VALIDATOR_CHANGE = gql`
  subscription OnValidatorChange {
    consensusValidatorChange {
      blockNumber
      blockHash
      timestamp
      epochNumber
      isEpochBoundary
      changeType
      previousValidatorCount
      newValidatorCount
      addedValidators
      removedValidators
      validatorSet
      additionalInfo
    }
  }
`

/**
 * Subscribe to consensus errors and anomalies
 * Monitors for round changes, missed validators, low participation, etc.
 *
 * Error Types:
 * - round_change: Round change occurred (normal but monitored)
 * - missed_validators: Validators failed to sign
 * - low_participation: Participation below threshold (<66.7%)
 * - proposer_failure: Proposer failed to create block
 * - signature_failure: Signature verification failed
 *
 * Severity Levels:
 * - critical: Consensus at risk, immediate action required
 * - high: Significant issue, requires attention
 * - medium: Notable anomaly, monitor closely
 * - low: Minor issue, informational
 */
export const SUBSCRIBE_CONSENSUS_ERROR = gql`
  subscription OnConsensusError {
    consensusError {
      blockNumber
      blockHash
      timestamp
      errorType
      severity
      errorMessage
      round
      expectedValidators
      actualSigners
      participationRate
      missedValidators
      consensusImpacted
      recoveryTime
      errorDetails
    }
  }
`
