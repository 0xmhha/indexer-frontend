/* eslint-disable max-lines */
// Grouped GraphQL queries for maintainability - logical sections with clear markers
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

// Get address balance (from indexed data)
export const GET_ADDRESS_BALANCE = gql`
  query GetAddressBalance($address: String!, $blockNumber: String) {
    addressBalance(address: $address, blockNumber: $blockNumber)
  }
`

// Get comprehensive address overview (includes isContract flag)
export const GET_ADDRESS_OVERVIEW = gql`
  query GetAddressOverview($address: String!) {
    addressOverview(address: $address) {
      address
      isContract
      balance
      transactionCount
      sentCount
      receivedCount
      internalTxCount
      erc20TokenCount
      erc721TokenCount
      firstSeen
      lastSeen
    }
  }
`

// Get live balance (real-time from chain RPC)
export const GET_LIVE_BALANCE = gql`
  query GetLiveBalance($address: String!, $blockNumber: String) {
    liveBalance(address: $address, blockNumber: $blockNumber) {
      address
      balance
      blockNumber
    }
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

// ============================================================================
// Subscriptions
// ============================================================================

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

/**
 * Get token balances for an address
 * Supports filtering by tokenType (ERC-20, ERC-721, ERC-1155)
 */
export const GET_TOKEN_BALANCES = gql`
  query GetTokenBalances($address: String!, $tokenType: String) {
    tokenBalances(address: $address, tokenType: $tokenType) {
      address
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
 *
 * @param replayLast - Number of recent consensus blocks to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_CONSENSUS_BLOCK = gql`
  subscription OnConsensusBlock($replayLast: Int) {
    consensusBlock(replayLast: $replayLast) {
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
 *
 * @param replayLast - Number of recent fork events to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_CONSENSUS_FORK = gql`
  subscription OnConsensusFork($replayLast: Int) {
    consensusFork(replayLast: $replayLast) {
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
 *
 * @param replayLast - Number of recent validator changes to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_CONSENSUS_VALIDATOR_CHANGE = gql`
  subscription OnValidatorChange($replayLast: Int) {
    consensusValidatorChange(replayLast: $replayLast) {
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
 *
 * @param replayLast - Number of recent errors to receive immediately on subscription (max 100)
 */
export const SUBSCRIBE_CONSENSUS_ERROR = gql`
  subscription OnConsensusError($replayLast: Int) {
    consensusError(replayLast: $replayLast) {
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

// ============================================================================
// Fee Delegation Analytics Queries
// ============================================================================
// Note: BigInt values are passed as String type (consistent with other queries in this project)

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

// ============================================================================
// EIP-7702 SetCode Queries
// ============================================================================

/**
 * Get SetCode (type 4) transactions for an address
 * Used to find EIP-7702 SetCode transactions where the address is involved.
 * Note: authorizationList is not available in transactionsByAddress query.
 * For full authorization details, use GET_TRANSACTION with individual tx hash.
 */
export const GET_SETCODE_TRANSACTIONS = gql`
  query GetSetCodeTransactions($address: String!, $limit: Int, $offset: Int) {
    transactionsByAddress(address: $address, pagination: { limit: $limit, offset: $offset }) {
      nodes {
        hash
        blockNumber
        from
        to
        type
      }
      totalCount
    }
  }
`
