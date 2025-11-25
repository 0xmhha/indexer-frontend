import { gql } from '@apollo/client'

// ============================================================================
// Stats Queries
// ============================================================================

/**
 * Top Miners query with block range filtering
 *
 * ✅ Backend API implemented with enhanced fields (2025-11-24)
 * Supports historical analysis with fromBlock/toBlock
 *
 * @see Frontend API Integration Guide for full specification
 */
export const GET_TOP_MINERS = gql`
  query GetTopMiners($limit: Int, $fromBlock: String, $toBlock: String) {
    topMiners(limit: $limit, fromBlock: $fromBlock, toBlock: $toBlock) {
      address
      blockCount
      percentage
      totalRewards
      lastBlockNumber
      lastBlockTime
    }
  }
`

// ============================================================================
// Top Miners Types
// ============================================================================

/**
 * Miner statistics data structure
 */
export interface MinerStats {
  address: string
  blockCount: number
  percentage: number // Percentage of total blocks mined (0-100)
  totalRewards: string // Total rewards in Wei (BigInt as string)
  lastBlockNumber: string // Block number of last mined block
  lastBlockTime: string // Timestamp of last mined block (BigInt as string)
}

export interface GetTopMinersVariables {
  limit?: number
  fromBlock?: string // Block number as string
  toBlock?: string // Block number as string
}

export interface GetTopMinersData {
  topMiners: MinerStats[]
}

// ============================================================================
// Network Stats Query
// ============================================================================

/**
 * General network statistics
 */
export const GET_NETWORK_STATS = gql`
  query GetNetworkStats {
    networkStats {
      latestBlock
      totalTransactions
      totalAddresses
      avgBlockTime
      hashRate
    }
  }
`

export interface NetworkStats {
  latestBlock: string // Block number as string
  totalTransactions: string // Total transaction count as string
  totalAddresses: string // Total unique addresses as string
  avgBlockTime: number // Average block time in seconds
  hashRate?: string // Network hash rate (optional)
}

export interface GetNetworkStatsData {
  networkStats: NetworkStats
}
