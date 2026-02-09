/**
 * Transaction-related GraphQL Queries
 *
 * Note: Custom scalars (BigInt, Hash, Address, Bytes) are serialized as strings by the backend.
 * Therefore, all query variables use String types instead of custom scalar types.
 */

import { gql } from '@apollo/client'

/**
 * Get transaction by hash
 */
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
      authorizationList {
        chainId
        address
        nonce
        yParity
        r
        s
        authority
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

/**
 * Get transactions by address
 * Note: Including receipt for contractAddress (contract creation transactions)
 */
export const GET_TRANSACTIONS_BY_ADDRESS = gql`
  query GetTransactionsByAddress($address: String!, $limit: Int, $offset: Int) {
    transactionsByAddress(address: $address, pagination: { limit: $limit, offset: $offset }) {
      nodes {
        hash
        blockNumber
        from
        to
        contractAddress
        value
        gas
        gasPrice
        type
        receipt {
          status
          contractAddress
        }
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
 * Get transaction count (efficient root query)
 */
export const GET_TRANSACTION_COUNT = gql`
  query GetTransactionCount {
    transactionCount
  }
`

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
