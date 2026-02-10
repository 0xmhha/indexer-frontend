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
// Network Metrics Query
// ============================================================================

/**
 * Network metrics with time-range filtering
 * Backend query: networkMetrics(fromTime, toTime)
 */
export const GET_NETWORK_METRICS = gql`
  query GetNetworkMetrics($fromTime: String!, $toTime: String!) {
    networkMetrics(fromTime: $fromTime, toTime: $toTime) {
      tps
      blockTime
      totalBlocks
      totalTransactions
      averageBlockSize
      timePeriod
    }
  }
`

export interface NetworkMetrics {
  tps: number
  blockTime: number
  totalBlocks: string
  totalTransactions: string
  averageBlockSize: string
  timePeriod: string
}

export interface GetNetworkMetricsVariables {
  fromTime: string
  toTime: string
}

export interface GetNetworkMetricsData {
  networkMetrics: NetworkMetrics | null
}

/**
 * @deprecated Use GET_NETWORK_METRICS instead. Kept for backward compatibility.
 */
export const GET_NETWORK_STATS = GET_NETWORK_METRICS
export type NetworkStats = NetworkMetrics
export type GetNetworkStatsData = GetNetworkMetricsData
