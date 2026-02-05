import { gql } from '@apollo/client'

// ============================================================================
// Contract Creation Queries
// ============================================================================

export const GET_CONTRACT_CREATION = gql`
  query GetContractCreation($address: String!) {
    contractCreation(address: $address) {
      contractAddress
      name
      creator
      transactionHash
      blockNumber
      timestamp
      bytecodeSize
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
        name
        creator
        transactionHash
        blockNumber
        timestamp
        bytecodeSize
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
// Contracts List Query (전체 배포된 컨트랙트 목록)
// ============================================================================

export const GET_CONTRACTS = gql`
  query GetContracts($pagination: PaginationInput) {
    contracts(pagination: $pagination) {
      nodes {
        contractAddress
        name
        creator
        transactionHash
        blockNumber
        timestamp
        bytecodeSize
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

/**
 * Get internal transactions by address
 * @param address - The address to query (from or to)
 * @param isFrom - true to get transactions FROM this address, false to get transactions TO this address
 * @param pagination - Pagination options (limit, offset)
 */
export const GET_INTERNAL_TRANSACTIONS_BY_ADDRESS = gql`
  query GetInternalTransactionsByAddress(
    $address: String!
    $isFrom: Boolean!
    $pagination: PaginationInput
  ) {
    internalTransactionsByAddress(address: $address, isFrom: $isFrom, pagination: $pagination) {
      nodes {
        transactionHash
        type
        from
        to
        value
        input
        output
        error
        blockNumber
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
  query GetERC20Transfer($txHash: Hash!, $logIndex: Int!) {
    erc20Transfer(txHash: $txHash, logIndex: $logIndex) {
      transactionHash
      logIndex
      contractAddress
      from
      to
      value
      blockNumber
    }
  }
`

export const GET_ERC20_TRANSFERS_BY_TOKEN = gql`
  query GetERC20TransfersByToken(
    $token: Address!
    $pagination: PaginationInput
  ) {
    erc20TransfersByToken(token: $token, pagination: $pagination) {
      nodes {
        transactionHash
        logIndex
        contractAddress
        from
        to
        value
        blockNumber
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
    $isFrom: Boolean!
    $pagination: PaginationInput
  ) {
    erc20TransfersByAddress(address: $address, isFrom: $isFrom, pagination: $pagination) {
      nodes {
        transactionHash
        logIndex
        contractAddress
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
  query GetERC721Transfer($txHash: Hash!, $logIndex: Int!) {
    erc721Transfer(txHash: $txHash, logIndex: $logIndex) {
      transactionHash
      logIndex
      contractAddress
      from
      to
      tokenId
      blockNumber
    }
  }
`

export const GET_ERC721_TRANSFERS_BY_TOKEN = gql`
  query GetERC721TransfersByToken(
    $token: Address!
    $pagination: PaginationInput
  ) {
    erc721TransfersByToken(token: $token, pagination: $pagination) {
      nodes {
        transactionHash
        logIndex
        contractAddress
        from
        to
        tokenId
        blockNumber
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
    $isFrom: Boolean!
    $pagination: PaginationInput
  ) {
    erc721TransfersByAddress(address: $address, isFrom: $isFrom, pagination: $pagination) {
      nodes {
        transactionHash
        logIndex
        contractAddress
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
  query GetERC721Owner($token: Address!, $tokenId: BigInt!) {
    erc721Owner(token: $token, tokenId: $tokenId)
  }
`
