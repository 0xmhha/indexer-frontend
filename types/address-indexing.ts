/**
 * Address Indexing TypeScript Types
 *
 * Types for contract creation tracking, internal transactions,
 * and ERC20/ERC721 token transfers
 */

// ============================================================================
// Contract Creation & Tracking
// ============================================================================

export interface ContractCreation {
  contractAddress: string
  creator: string
  transactionHash: string
  blockNumber: bigint
  timestamp: bigint
}

export interface ContractCreationFilter {
  address?: string
  creator?: string
  fromBlock?: bigint
  toBlock?: bigint
}

export interface ContractCreationsResponse {
  nodes: ContractCreation[]
  totalCount: number
  pageInfo: PageInfo
}

// ============================================================================
// Internal Transactions
// ============================================================================

export interface InternalTransaction {
  parentHash: string
  type: string
  from: string
  to: string | null
  value: bigint
  input: string
  output: string
  error: string | null
  blockNumber: bigint
  timestamp: bigint
}

export interface InternalTransactionFilter {
  address?: string
  fromBlock?: bigint
  toBlock?: bigint
}

export interface InternalTransactionsResponse {
  nodes: InternalTransaction[]
  totalCount: number
  pageInfo: PageInfo
}

// ============================================================================
// ERC20 Token Transfers
// ============================================================================

export interface ERC20Transfer {
  transactionHash: string
  logIndex: number
  tokenAddress: string
  from: string
  to: string
  value: bigint
  blockNumber: bigint
  timestamp: bigint
}

export interface ERC20TransferFilter {
  tokenAddress?: string
  fromAddress?: string
  toAddress?: string
  fromBlock?: bigint
  toBlock?: bigint
}

export interface ERC20TransfersResponse {
  nodes: ERC20Transfer[]
  totalCount: number
  pageInfo: PageInfo
}

// ============================================================================
// ERC721 NFT Transfers
// ============================================================================

export interface ERC721Transfer {
  transactionHash: string
  logIndex: number
  tokenAddress: string
  from: string
  to: string
  tokenId: bigint
  blockNumber: bigint
  timestamp: bigint
}

export interface ERC721TransferFilter {
  tokenAddress?: string
  fromAddress?: string
  toAddress?: string
  tokenId?: bigint
  fromBlock?: bigint
  toBlock?: bigint
}

export interface ERC721TransfersResponse {
  nodes: ERC721Transfer[]
  totalCount: number
  pageInfo: PageInfo
}

export interface ERC721Owner {
  tokenAddress: string
  tokenId: bigint
  owner: string
}

// ============================================================================
// Common Types
// ============================================================================

export interface PaginationInput {
  limit: number
  offset: number
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// ============================================================================
// GraphQL Response Types (Raw - strings from API)
// ============================================================================

export interface RawContractCreation {
  contractAddress: string
  creator: string
  transactionHash: string
  blockNumber: string
  timestamp: string
}

export interface RawInternalTransaction {
  parentHash: string
  type: string
  from: string
  to: string | null
  value: string
  input: string
  output: string
  error: string | null
  blockNumber: string
  timestamp: string
}

export interface RawERC20Transfer {
  transactionHash: string
  logIndex: number
  tokenAddress: string
  from: string
  to: string
  value: string
  blockNumber: string
  timestamp: string
}

export interface RawERC721Transfer {
  transactionHash: string
  logIndex: number
  tokenAddress: string
  from: string
  to: string
  tokenId: string
  blockNumber: string
  timestamp: string
}

export interface RawERC721Owner {
  tokenAddress: string
  tokenId: string
  owner: string
}
