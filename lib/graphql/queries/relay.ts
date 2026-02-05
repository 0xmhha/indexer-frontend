/**
 * GraphQL Queries for API Relay
 * Server-side queries for REST API endpoints
 */

import { gql } from '@apollo/client'

/**
 * Get native balance for an address
 */
export const GET_ADDRESS_BALANCE = gql`
  query GetAddressBalanceRelay($address: Address!) {
    addressBalance(address: $address)
  }
`

/**
 * Get token balances for an address
 */
export const GET_TOKEN_BALANCES = gql`
  query GetTokenBalancesRelay($address: Address!) {
    tokenBalances(address: $address) {
      address
      balance
      tokenId
      tokenType
    }
  }
`

/**
 * Get transactions for an address with pagination
 */
export const GET_TRANSACTIONS_BY_ADDRESS = gql`
  query GetTransactionsByAddressRelay(
    $address: Address!
    $limit: Int
    $offset: Int
  ) {
    transactionsByAddress(
      address: $address
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
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
        receipt {
          status
          gasUsed
          contractAddress
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`

/**
 * Get logs (token transfers) for an address with pagination
 */
export const GET_LOGS_BY_ADDRESS = gql`
  query GetLogsByAddressRelay(
    $address: Address
    $limit: Int
    $offset: Int
  ) {
    logs(
      filter: { address: $address }
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
        address
        topics
        data
        blockNumber
        blockHash
        transactionHash
        transactionIndex
        logIndex
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`

/**
 * Get block by number for timestamp lookup
 */
export const GET_BLOCK_TIMESTAMP = gql`
  query GetBlockTimestamp($number: BigInt!) {
    block(number: $number) {
      number
      timestamp
    }
  }
`

/**
 * Get latest block height
 */
export const GET_LATEST_HEIGHT = gql`
  query GetLatestHeightRelay {
    latestHeight
  }
`

// ============================================================================
// Contract Queries (Phase 2)
// ============================================================================

/**
 * Get contract creation info
 */
export const GET_CONTRACT_CREATION = gql`
  query GetContractCreationRelay($address: Address!) {
    contractCreation(address: $address) {
      contractAddress
      creator
      transactionHash
      blockNumber
      timestamp
    }
  }
`

/**
 * Get contract verification info (includes ABI and source)
 */
export const GET_CONTRACT_VERIFICATION = gql`
  query GetContractVerificationRelay($address: Address!) {
    contractVerification(address: $address) {
      address
      isVerified
      name
      compilerVersion
      optimizationEnabled
      optimizationRuns
      sourceCode
      abi
      constructorArguments
      verifiedAt
      licenseType
    }
  }
`

// ============================================================================
// Phase 3: Extended API Queries
// ============================================================================

/**
 * Get network statistics
 * NOTE: networkStats query not available in current schema
 * TODO: Implement when backend adds support
 */
// export const GET_NETWORK_STATS = gql`
//   query GetNetworkStatsRelay {
//     networkStats {
//       latestBlock
//       totalTransactions
//       totalAddresses
//       avgBlockTime
//       hashRate
//     }
//   }
// `

/**
 * Get active validators
 */
export const GET_ACTIVE_VALIDATORS = gql`
  query GetActiveValidatorsRelay {
    activeValidators {
      address
      isActive
    }
  }
`

// ============================================================================
// Additional Queries (Remaining APIs)
// ============================================================================

/**
 * Get block by number
 */
export const GET_BLOCK_BY_NUMBER = gql`
  query GetBlockByNumberRelay($number: BigInt!) {
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
    }
  }
`

/**
 * Get block by hash
 */
export const GET_BLOCK_BY_HASH = gql`
  query GetBlockByHashRelay($hash: Hash!) {
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
    }
  }
`

/**
 * Get transaction by hash
 */
export const GET_TRANSACTION = gql`
  query GetTransactionRelay($hash: Hash!) {
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

/**
 * Get account transaction count
 */
export const GET_ACCOUNT_TX_COUNT = gql`
  query GetAccountTxCountRelay($address: Address!) {
    transactionsByAddress(address: $address, pagination: { limit: 1 }) {
      totalCount
    }
  }
`

/**
 * Get recent transactions for gas estimation
 */
export const GET_RECENT_TRANSACTIONS = gql`
  query GetRecentTransactionsRelay($limit: Int!) {
    transactions(pagination: { limit: $limit }) {
      nodes {
        gasPrice
        receipt {
          gasUsed
        }
      }
    }
  }
`
