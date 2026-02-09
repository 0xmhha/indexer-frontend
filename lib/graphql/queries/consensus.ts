import { gql } from '@apollo/client'

/**
 * GraphQL Queries for WBFT Consensus and Validator Signing
 *
 * Centralized queries for consensus-related data.
 * Used by: useWBFT.ts, useConsensus.ts
 */

// ============================================================================
// WBFT Block Extra Queries
// ============================================================================

/**
 * Get WBFT block consensus data by block number
 * Returns consensus metadata including round, seals, and epoch info
 */
export const GET_WBFT_BLOCK_EXTRA = gql`
  query GetWbftBlockExtra($blockNumber: String!) {
    wbftBlockExtra(blockNumber: $blockNumber) {
      blockNumber
      blockHash
      randaoReveal
      prevRound
      round
      preparedSeal {
        sealers
        signature
      }
      committedSeal {
        sealers
        signature
      }
      gasTip
      epochInfo {
        epochNumber
        blockNumber
        candidates {
          address
          diligence
        }
        validators
        blsPublicKeys
      }
      timestamp
    }
  }
`

/**
 * Get WBFT block consensus data by block hash
 */
export const GET_WBFT_BLOCK_EXTRA_BY_HASH = gql`
  query GetWbftBlockExtraByHash($blockHash: String!) {
    wbftBlockExtraByHash(blockHash: $blockHash) {
      blockNumber
      blockHash
      randaoReveal
      prevRound
      round
      preparedSeal {
        sealers
        signature
      }
      committedSeal {
        sealers
        signature
      }
      gasTip
      epochInfo {
        epochNumber
        blockNumber
        candidates {
          address
          diligence
        }
        validators
        blsPublicKeys
      }
      timestamp
    }
  }
`

// ============================================================================
// Epoch Info Queries
// ============================================================================

/**
 * Get epoch information by epoch number
 */
export const GET_EPOCH_INFO = gql`
  query GetEpochInfo($epochNumber: String!) {
    epochInfo(epochNumber: $epochNumber) {
      epochNumber
      blockNumber
      candidates {
        address
        diligence
      }
      validators
      blsPublicKeys
    }
  }
`

/**
 * Get latest epoch information
 */
export const GET_LATEST_EPOCH_INFO = gql`
  query GetLatestEpochInfo {
    latestEpochInfo {
      epochNumber
      blockNumber
      candidates {
        address
        diligence
      }
      validators
      blsPublicKeys
    }
  }
`

// ============================================================================
// Validator Signing Statistics Queries
// ============================================================================

/**
 * Get signing statistics for a specific validator
 */
export const GET_VALIDATOR_SIGNING_STATS = gql`
  query GetValidatorSigningStats(
    $validatorAddress: String!
    $fromBlock: String!
    $toBlock: String!
  ) {
    validatorSigningStats(
      validatorAddress: $validatorAddress
      fromBlock: $fromBlock
      toBlock: $toBlock
    ) {
      validatorAddress
      validatorIndex
      prepareSignCount
      prepareMissCount
      commitSignCount
      commitMissCount
      fromBlock
      toBlock
      signingRate
    }
  }
`

/**
 * Get signing statistics for all validators in a block range
 */
export const GET_ALL_VALIDATORS_SIGNING_STATS = gql`
  query GetAllValidatorsSigningStats(
    $fromBlock: String!
    $toBlock: String!
    $limit: Int
    $offset: Int
  ) {
    allValidatorsSigningStats(
      fromBlock: $fromBlock
      toBlock: $toBlock
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
        validatorAddress
        validatorIndex
        prepareSignCount
        prepareMissCount
        commitSignCount
        commitMissCount
        fromBlock
        toBlock
        signingRate
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

/**
 * Get detailed signing activity for a specific validator
 */
export const GET_VALIDATOR_SIGNING_ACTIVITY = gql`
  query GetValidatorSigningActivity(
    $validatorAddress: String!
    $fromBlock: String!
    $toBlock: String!
    $limit: Int
    $offset: Int
  ) {
    validatorSigningActivity(
      validatorAddress: $validatorAddress
      fromBlock: $fromBlock
      toBlock: $toBlock
      pagination: { limit: $limit, offset: $offset }
    ) {
      nodes {
        blockNumber
        blockHash
        validatorAddress
        validatorIndex
        signedPrepare
        signedCommit
        round
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

// ============================================================================
// Block Signers Query
// ============================================================================

/**
 * Get block signers (preparers and committers) for a specific block
 */
export const GET_BLOCK_SIGNERS = gql`
  query GetBlockSigners($blockNumber: String!) {
    blockSigners(blockNumber: $blockNumber) {
      blockNumber
      preparers
      committers
    }
  }
`
