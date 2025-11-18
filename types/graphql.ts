/**
 * GraphQL type definitions
 * These will be replaced by auto-generated types from codegen
 */

export interface Block {
  number: string
  hash: string
  parentHash: string
  timestamp: string
  miner: string
  gasUsed: string
  gasLimit: string
  size: string
  transactionCount: number
  transactions?: Transaction[]
}

export interface Transaction {
  hash: string
  blockNumber: string
  blockHash: string
  transactionIndex: number
  from: string
  to: string | null
  value: string
  gas: string
  gasPrice: string
  maxFeePerGas?: string | null
  maxPriorityFeePerGas?: string | null
  type: string
  input: string
  nonce: string
  v?: string
  r?: string
  s?: string
  chainId?: string
  receipt?: TransactionReceipt
  gasUsed?: string
}

export interface TransactionReceipt {
  status: string
  gasUsed: string
  cumulativeGasUsed: string
  effectiveGasPrice: string
  contractAddress?: string | null
  logs?: Log[]
}

export interface Log {
  address: string
  topics: string[]
  data: string
  blockNumber: string
  transactionHash: string
  logIndex: number
}

export interface AddressBalance {
  balance: string
}

export interface PaginationInput {
  limit?: number
  offset?: number
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface TransactionConnection {
  nodes: Transaction[]
  totalCount: number
  pageInfo: PageInfo
}
