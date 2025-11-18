/**
 * Extended GraphQL types for Phase 3
 */

import type { Block, Transaction, PageInfo } from './graphql'

export interface BlockConnection {
  nodes: Block[]
  totalCount: number
  pageInfo: PageInfo
}

export interface TransactionConnection {
  nodes: Transaction[]
  totalCount: number
  pageInfo: PageInfo
}

export interface BlockFilter {
  numberFrom?: string
  numberTo?: string
  miner?: string
}

export interface TransactionFilter {
  blockNumberFrom?: string
  blockNumberTo?: string
  from?: string
  to?: string
  type?: string
}

export interface NetworkStats {
  totalBlocks: number
  totalTransactions: number
  averageBlockTime: number
  averageGasPrice: string
  totalGasUsed: string
}

export interface BlocksOverTimeData {
  timestamp: string
  count: number
  averageGasUsed: string
}

export interface TopMiner {
  address: string
  blockCount: number
  totalGasUsed: string
}
