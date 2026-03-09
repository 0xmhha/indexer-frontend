/**
 * Account Abstraction (EIP-4337) GraphQL Queries
 *
 * Matches the actual indexer-go backend schema (event-only approach).
 * Backend does NOT have unified filter queries - separate queries per dimension.
 */

import { gql } from '@apollo/client'

// ============================================================================
// UserOperation Queries
// ============================================================================

/** Get single UserOperation by hash */
export const GET_USER_OP = gql`
  query GetUserOp($hash: String!) {
    userOp(userOpHash: $hash) {
      userOpHash
      txHash
      blockNumber
      blockHash
      txIndex
      logIndex
      sender
      paymaster
      nonce
      success
      actualGasCost
      actualUserOpFeePerGas
      bundler
      entryPoint
      timestamp
    }
  }
`

/** Get UserOperations by sender (paginated) */
export const GET_USER_OPS_BY_SENDER = gql`
  query GetUserOpsBySender($sender: String!, $limit: Int, $offset: Int) {
    userOpsBySender(sender: $sender, pagination: { limit: $limit, offset: $offset }) {
      nodes {
        userOpHash
        txHash
        blockNumber
        sender
        paymaster
        nonce
        success
        actualGasCost
        actualUserOpFeePerGas
        bundler
        entryPoint
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

/** Get UserOperations by bundler (paginated) */
export const GET_USER_OPS_BY_BUNDLER = gql`
  query GetUserOpsByBundler($bundler: String!, $limit: Int, $offset: Int) {
    userOpsByBundler(bundler: $bundler, pagination: { limit: $limit, offset: $offset }) {
      nodes {
        userOpHash
        txHash
        blockNumber
        sender
        paymaster
        success
        actualGasCost
        bundler
        entryPoint
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

/** Get UserOperations by paymaster (paginated) */
export const GET_USER_OPS_BY_PAYMASTER = gql`
  query GetUserOpsByPaymaster($paymaster: String!, $limit: Int, $offset: Int) {
    userOpsByPaymaster(paymaster: $paymaster, pagination: { limit: $limit, offset: $offset }) {
      nodes {
        userOpHash
        txHash
        blockNumber
        sender
        paymaster
        success
        actualGasCost
        bundler
        entryPoint
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

/** Get all UserOperations in a transaction (bundle view) */
export const GET_USER_OPS_BY_TX = gql`
  query GetUserOpsByTx($txHash: String!) {
    userOpsByTx(txHash: $txHash) {
      userOpHash
      sender
      paymaster
      success
      actualGasCost
      bundler
      entryPoint
    }
  }
`

/** Get UserOperations in a block */
export const GET_USER_OPS_BY_BLOCK = gql`
  query GetUserOpsByBlock($blockNumber: String!) {
    userOpsByBlock(blockNumber: $blockNumber) {
      userOpHash
      txHash
      sender
      paymaster
      success
      actualGasCost
      bundler
      entryPoint
      timestamp
    }
  }
`

/** Get most recent UserOperations */
export const GET_RECENT_USER_OPS = gql`
  query GetRecentUserOps($limit: Int) {
    recentUserOps(limit: $limit) {
      userOpHash
      txHash
      blockNumber
      sender
      paymaster
      success
      actualGasCost
      bundler
      entryPoint
      timestamp
    }
  }
`

/** Get total UserOperation count */
export const GET_USER_OP_COUNT = gql`
  query GetUserOpCount {
    userOpCount
  }
`

// ============================================================================
// Bundler / Paymaster Stats (Single Address Only)
// ============================================================================

/** Get stats for a single bundler address */
export const GET_BUNDLER_STATS = gql`
  query GetBundlerStats($address: String!) {
    bundlerStats(bundler: $address) {
      address
      totalOps
      successfulOps
      failedOps
      totalGasSponsored
      lastActivityBlock
      lastActivityTime
    }
  }
`

/** Get stats for a single paymaster address */
export const GET_PAYMASTER_STATS = gql`
  query GetPaymasterStats($address: String!) {
    paymasterStats(paymaster: $address) {
      address
      totalOps
      successfulOps
      failedOps
      totalGasSponsored
      lastActivityBlock
      lastActivityTime
    }
  }
`

// ============================================================================
// Account Deployment Queries
// ============================================================================

/** Get deployment info by UserOp hash */
export const GET_ACCOUNT_DEPLOYMENT = gql`
  query GetAccountDeployment($hash: String!) {
    accountDeployment(userOpHash: $hash) {
      userOpHash
      sender
      factory
      paymaster
      txHash
      blockNumber
      logIndex
      timestamp
    }
  }
`

/** Get deployments by factory address */
export const GET_DEPLOYMENTS_BY_FACTORY = gql`
  query GetDeploymentsByFactory($factory: String!, $limit: Int, $offset: Int) {
    accountDeploymentsByFactory(factory: $factory, pagination: { limit: $limit, offset: $offset }) {
      userOpHash
      sender
      factory
      paymaster
      txHash
      blockNumber
      logIndex
      timestamp
    }
  }
`

// ============================================================================
// Revert Reason
// ============================================================================

/** Get revert reason for a failed UserOperation */
export const GET_USER_OP_REVERT = gql`
  query GetUserOpRevert($hash: String!) {
    userOpRevert(userOpHash: $hash) {
      userOpHash
      sender
      nonce
      revertReason
      txHash
      blockNumber
      logIndex
      revertType
      timestamp
    }
  }
`
