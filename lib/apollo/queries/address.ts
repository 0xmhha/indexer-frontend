/**
 * Address-related GraphQL Queries
 *
 * Note: Custom scalars (BigInt, Hash, Address, Bytes) are serialized as strings by the backend.
 * Therefore, all query variables use String types instead of custom scalar types.
 */

import { gql } from '@apollo/client'

/**
 * Get address balance (from indexed data)
 */
export const GET_ADDRESS_BALANCE = gql`
  query GetAddressBalance($address: String!, $blockNumber: String) {
    addressBalance(address: $address, blockNumber: $blockNumber)
  }
`

/**
 * Get comprehensive address overview (includes isContract flag)
 */
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

/**
 * Get live balance (real-time from chain RPC)
 */
export const GET_LIVE_BALANCE = gql`
  query GetLiveBalance($address: String!, $blockNumber: String) {
    liveBalance(address: $address, blockNumber: $blockNumber) {
      address
      balance
      blockNumber
    }
  }
`

/**
 * Get balance history
 */
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

/**
 * Get EIP-7702 SetCode delegation info for an address
 */
export const GET_ADDRESS_SETCODE_INFO = gql`
  query GetAddressSetCodeInfo($address: String!) {
    addressSetCodeInfo(address: $address) {
      address
      hasDelegation
      delegationTarget
      asAuthorityCount
      asTargetCount
      lastActivityBlock
      lastActivityTimestamp
    }
  }
`
