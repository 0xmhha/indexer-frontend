/**
 * API Relay Type Definitions
 * TypeScript interfaces for REST API responses and GraphQL data
 */

// ============================================================================
// GraphQL Response Types
// ============================================================================

/**
 * Native balance query response
 */
export interface AddressBalanceResponse {
  addressBalance: string
}

/**
 * Token balance item from GraphQL
 */
export interface TokenBalanceItem {
  contractAddress: string
  balance: string
  tokenId?: string | null
  tokenType: string
}

/**
 * Token balances query response
 */
export interface TokenBalancesResponse {
  tokenBalances: TokenBalanceItem[]
}

/**
 * Transaction node from GraphQL
 */
export interface TransactionNode {
  hash: string
  blockNumber: string
  blockHash: string
  transactionIndex: number
  from: string
  to: string | null
  value: string
  gas: string
  gasPrice: string | null
  maxFeePerGas?: string | null
  maxPriorityFeePerGas?: string | null
  type: number
  input: string
  nonce: string
  receipt?: {
    status: number
    gasUsed: string
    contractAddress?: string | null
  } | null
}

/**
 * Transactions connection response
 */
export interface TransactionsResponse {
  transactionsByAddress: {
    nodes: TransactionNode[]
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
    totalCount: number
  }
}

/**
 * Logs query response
 */
export interface LogsResponse {
  logs: {
    nodes: Array<{
      address: string
      topics: string[]
      data: string
      blockNumber: string
      blockHash: string
      transactionHash: string
      transactionIndex: number
      logIndex: number
    }>
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
    totalCount: number
  }
}

// ============================================================================
// REST API Response Types
// ============================================================================

/**
 * Base API response
 */
export interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  error?: {
    message: string
    code: string
  }
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  status: 'success'
  data: {
    items: T[]
    pagination: {
      page: number
      limit: number
      total: number
      hasMore: boolean
    }
  }
}

/**
 * Native token info in balance response
 */
export interface NativeBalance {
  balance: string
  symbol: string
  decimals: number
}

/**
 * ERC20 token in balance response
 */
export interface TokenInBalance {
  contractAddress: string
  name: string | null
  symbol: string | null
  decimals: number | null
  balance: string
  type: 'ERC20' | 'ERC721' | 'ERC1155'
}

/**
 * Account balances response data
 */
export interface AccountBalancesData {
  address: string
  native: NativeBalance
  tokens: TokenInBalance[]
}

/**
 * Transaction in list response
 */
export interface TransactionInList {
  hash: string
  blockNumber: number
  timestamp: string | null
  from: string
  to: string | null
  value: string
  gasUsed: string | null
  gasPrice: string | null
  status: 'success' | 'failed' | 'pending'
  type: number
  method: string | null
}

/**
 * Token transfer in list response
 */
export interface TokenTransferInList {
  hash: string
  blockNumber: number
  timestamp: string | null
  from: string
  to: string
  contractAddress: string
  tokenName: string | null
  tokenSymbol: string | null
  tokenDecimals: number | null
  value: string
  tokenId: string | null
  type: 'ERC20' | 'ERC721' | 'ERC1155'
}

/**
 * Token info response data
 */
export interface TokenInfoData {
  address: string
  name: string | null
  symbol: string | null
  decimals: number | null
  totalSupply: string | null
  type: 'ERC20' | 'ERC721' | 'ERC1155'
  holdersCount: number | null
  transfersCount: number | null
  verified: boolean
  logoUrl: string | null
}

// ============================================================================
// Query Parameter Types
// ============================================================================

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

/**
 * Transaction filter parameters
 */
export interface TransactionFilterParams extends PaginationParams {
  sort?: 'asc' | 'desc'
  filter?: 'all' | 'in' | 'out' | 'self'
}

/**
 * Transfer filter parameters
 */
export interface TransferFilterParams extends PaginationParams {
  type?: 'ERC20' | 'ERC721' | 'ERC1155' | 'all'
  token?: string
}

// ============================================================================
// Contract Types (Phase 2)
// ============================================================================

/**
 * Contract creation GraphQL response
 */
export interface ContractCreationResponse {
  contractCreation: {
    contractAddress: string
    creator: string
    transactionHash: string
    blockNumber: string
    timestamp: string | null
  } | null
}

/**
 * Contract verification GraphQL response
 */
export interface ContractVerificationResponse {
  contractVerification: {
    address: string
    isVerified: boolean
    name: string | null
    compilerVersion: string | null
    optimizationEnabled: boolean | null
    optimizationRuns: number | null
    evmVersion: string | null
    sourceCode: string | null
    abi: string | null
    constructorArguments: string | null
    verifiedAt: string | null
    licenseType: string | null
  } | null
}

/**
 * Contract info REST API response data
 */
export interface ContractInfoData {
  address: string
  creator: string | null
  creationTxHash: string | null
  createdAt: string | null
  verified: boolean
  name: string | null
  compilerVersion: string | null
  optimizationEnabled: boolean | null
  optimizationRuns: number | null
  evmVersion: string | null
  licenseType: string | null
}

/**
 * Contract ABI REST API response data
 */
export interface ContractAbiData {
  address: string
  verified: boolean
  abi: unknown[] | null
}

/**
 * Contract source code REST API response data
 */
export interface ContractSourceData {
  address: string
  verified: boolean
  name: string | null
  sourceCode: string | null
  abi: unknown[] | null
  compilerVersion: string | null
  constructorArguments: string | null
}

// ============================================================================
// Phase 3: Extended API Types
// ============================================================================

/**
 * NFT item in account NFT list
 */
export interface NftItem {
  contractAddress: string
  name: string | null
  symbol: string | null
  tokenId: string
  type: 'ERC721' | 'ERC1155'
  balance: string
  tokenUri: string | null
  metadata: NftMetadata | null
}

/**
 * NFT metadata
 */
export interface NftMetadata {
  name?: string
  description?: string
  image?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
}

/**
 * Network stats GraphQL response
 */
export interface NetworkStatsResponse {
  networkStats: {
    latestBlock: string
    totalTransactions: string
    totalAddresses: string
    avgBlockTime: number
    hashRate?: string
  } | null
}

/**
 * Latest height GraphQL response
 */
export interface LatestHeightResponse {
  latestHeight: string
}

/**
 * Network stats REST API response data
 */
export interface NetworkStatsData {
  latestBlock: number
  totalTransactions: number
  totalAddresses: number
  totalContracts: number | null
  avgBlockTime: number
  tps: number | null
}

/**
 * Active validators GraphQL response
 */
export interface ActiveValidatorsResponse {
  activeValidators: Array<{
    address: string
    isActive: boolean
  }>
}

/**
 * Validator item in list
 */
export interface ValidatorItem {
  address: string
  isActive: boolean
  name: string | null
  commission: number | null
  totalStaked: string | null
  delegatorsCount: number | null
}

// ============================================================================
// Additional API Types (Remaining APIs)
// ============================================================================

/**
 * Account summary data
 */
export interface AccountSummaryData {
  address: string
  balance: string
  transactionCount: number
  isContract: boolean
  firstSeen: string | null
  lastSeen: string | null
}

/**
 * Block data from GraphQL
 */
export interface BlockResponse {
  block: {
    number: string
    hash: string
    parentHash: string
    timestamp: string
    miner: string
    gasUsed: string
    gasLimit: string
    size: string
    transactionCount: number
    baseFeePerGas: string | null
  } | null
}

/**
 * Block data for REST API
 */
export interface BlockData {
  number: number
  hash: string
  parentHash: string
  timestamp: string
  miner: string
  gasUsed: string
  gasLimit: string
  transactionCount: number
  baseFeePerGas: string | null
}

/**
 * Transaction data from GraphQL
 */
export interface TransactionResponse {
  transaction: {
    hash: string
    blockNumber: string
    blockHash: string
    transactionIndex: number
    from: string
    to: string | null
    value: string
    gas: string
    gasPrice: string | null
    maxFeePerGas: string | null
    maxPriorityFeePerGas: string | null
    type: number
    input: string
    nonce: string
    receipt: {
      status: number
      gasUsed: string
      cumulativeGasUsed: string
      effectiveGasPrice: string
      contractAddress: string | null
      logs: Array<{
        address: string
        topics: string[]
        data: string
        logIndex: number
      }>
    } | null
  } | null
}

/**
 * Transaction data for REST API
 */
export interface TransactionData {
  hash: string
  blockNumber: number
  blockHash: string
  timestamp: string | null
  from: string
  to: string | null
  value: string
  gas: string
  gasPrice: string | null
  gasUsed: string | null
  nonce: number
  transactionIndex: number
  status: 'success' | 'failed' | 'pending'
  type: number
  input: string
  decodedInput: {
    method: string | null
    params: unknown[] | null
  } | null
}

/**
 * Transaction log for REST API
 */
export interface TransactionLogData {
  address: string
  topics: string[]
  data: string
  logIndex: number
  decoded: {
    name: string | null
    params: unknown[] | null
  } | null
}

/**
 * Gas price estimates for REST API
 */
export interface GasPriceData {
  slow: {
    gasPrice: string
    estimatedTime: string
  }
  standard: {
    gasPrice: string
    estimatedTime: string
  }
  fast: {
    gasPrice: string
    estimatedTime: string
  }
}

/**
 * Token holder item
 */
export interface TokenHolderItem {
  address: string
  balance: string
  percentage: number
}

/**
 * Token transfer item (for token transfers endpoint)
 */
export interface TokenTransferItem {
  hash: string
  blockNumber: number
  timestamp: string | null
  from: string
  to: string
  value: string
  tokenId: string | null
}
