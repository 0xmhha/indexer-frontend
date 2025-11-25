import { gql } from '@apollo/client'

// ============================================================================
// Contract Creation Queries
// ============================================================================

export const GET_CONTRACT_CREATION = gql`
  query GetContractCreation($address: String!) {
    contractCreation(address: $address) {
      contractAddress
      creator
      transactionHash
      blockNumber
      timestamp
    }
  }
`

export const GET_CONTRACTS_BY_CREATOR = gql`
  query GetContractsByCreator(
    $creator: String!
    $pagination: PaginationInput
  ) {
    contractsByCreator(creator: $creator, pagination: $pagination) {
      nodes {
        contractAddress
        creator
        transactionHash
        blockNumber
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
// Internal Transactions Queries
// ============================================================================

export const GET_INTERNAL_TRANSACTIONS = gql`
  query GetInternalTransactions($filter: InternalTransactionFilter!, $pagination: PaginationInput) {
    internalTransactions(filter: $filter, pagination: $pagination) {
      nodes {
        parentHash
        type
        from
        to
        value
        input
        output
        error
        blockNumber
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

export const GET_INTERNAL_TRANSACTIONS_BY_ADDRESS = gql`
  query GetInternalTransactionsByAddress(
    $address: String!
    $filter: InternalTransactionFilter
    $pagination: PaginationInput
  ) {
    internalTransactionsByAddress(address: $address, filter: $filter, pagination: $pagination) {
      nodes {
        parentHash
        type
        from
        to
        value
        input
        output
        error
        blockNumber
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
// ERC20 Token Transfer Queries
// ============================================================================

export const GET_ERC20_TRANSFER = gql`
  query GetERC20Transfer($transactionHash: Hash!, $logIndex: Int!) {
    erc20Transfer(transactionHash: $transactionHash, logIndex: $logIndex) {
      transactionHash
      logIndex
      tokenAddress
      from
      to
      value
      blockNumber
      timestamp
    }
  }
`

export const GET_ERC20_TRANSFERS_BY_TOKEN = gql`
  query GetERC20TransfersByToken(
    $tokenAddress: String!
    $filter: ERC20TransferFilter
    $pagination: PaginationInput
  ) {
    erc20TransfersByToken(tokenAddress: $tokenAddress, filter: $filter, pagination: $pagination) {
      nodes {
        transactionHash
        logIndex
        tokenAddress
        from
        to
        value
        blockNumber
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

export const GET_ERC20_TRANSFERS_BY_ADDRESS = gql`
  query GetERC20TransfersByAddress(
    $address: String!
    $filter: ERC20TransferFilter
    $pagination: PaginationInput
  ) {
    erc20TransfersByAddress(address: $address, filter: $filter, pagination: $pagination) {
      nodes {
        transactionHash
        logIndex
        tokenAddress
        from
        to
        value
        blockNumber
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
// ERC721 NFT Transfer Queries
// ============================================================================

export const GET_ERC721_TRANSFER = gql`
  query GetERC721Transfer($transactionHash: Hash!, $logIndex: Int!) {
    erc721Transfer(transactionHash: $transactionHash, logIndex: $logIndex) {
      transactionHash
      logIndex
      tokenAddress
      from
      to
      tokenId
      blockNumber
      timestamp
    }
  }
`

export const GET_ERC721_TRANSFERS_BY_TOKEN = gql`
  query GetERC721TransfersByToken(
    $tokenAddress: String!
    $filter: ERC721TransferFilter
    $pagination: PaginationInput
  ) {
    erc721TransfersByToken(tokenAddress: $tokenAddress, filter: $filter, pagination: $pagination) {
      nodes {
        transactionHash
        logIndex
        tokenAddress
        from
        to
        tokenId
        blockNumber
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

export const GET_ERC721_TRANSFERS_BY_ADDRESS = gql`
  query GetERC721TransfersByAddress(
    $address: String!
    $filter: ERC721TransferFilter
    $pagination: PaginationInput
  ) {
    erc721TransfersByAddress(address: $address, filter: $filter, pagination: $pagination) {
      nodes {
        transactionHash
        logIndex
        tokenAddress
        from
        to
        tokenId
        blockNumber
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

export const GET_ERC721_OWNER = gql`
  query GetERC721Owner($tokenAddress: String!, $tokenId: String!) {
    erc721Owner(tokenAddress: $tokenAddress, tokenId: $tokenId) {
      tokenAddress
      tokenId
      owner
    }
  }
`
