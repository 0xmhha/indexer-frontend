'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useQuery, useSubscription } from '@apollo/client'
import { GET_RECENT_BLOCKS_FOR_GAS, SUBSCRIBE_NEW_BLOCK_GAS } from '@/lib/apollo/queries/gas'
import { weiToGwei } from '@/lib/utils/gas'
import { BLOCKCHAIN, GAS } from '@/lib/config/constants'

/**
 * Gas price tier for recommendations
 */
export type GasPriceTier = 'economy' | 'standard' | 'priority'

/**
 * Gas price level with recommendation data
 */
export interface GasPriceLevel {
  tier: GasPriceTier
  label: string
  icon: string
  maxFeePerGas: bigint
  maxPriorityFee: bigint
  estimatedSeconds: number
  displayLabel: string
}

/**
 * Network gas metrics
 */
export interface NetworkGasMetrics {
  baseFee: bigint
  baseFeeGwei: number
  priceLevels: GasPriceLevel[]
  networkUtilization: number
  pendingCount: number
  lastBlockGasUsed: bigint
  lastBlockGasLimit: bigint
  lastBlockNumber: number
  lastBlockTimestamp: number
  updatedAt: Date
}

/**
 * Gas price history point
 */
export interface GasPriceHistoryPoint {
  blockNumber: number
  timestamp: number
  baseFee: bigint
  baseFeeGwei: number
  utilization: number
  txCount: number
}

interface UseGasTrackerOptions {
  /** Number of blocks to analyze for gas recommendations */
  blockCount?: number
  /** Enable real-time subscription updates */
  enableSubscription?: boolean
}

interface BlockData {
  number: string
  hash: string
  timestamp: string
  baseFeePerGas: string | null
  gasUsed: string
  gasLimit: string
  transactionCount: number
  transactions: Array<{
    hash: string
    gasPrice: string | null
    maxFeePerGas: string | null
    maxPriorityFeePerGas: string | null
    type: number
  }>
}

/**
 * Calculate percentile from sorted array
 */
function percentile(arr: bigint[], p: number): bigint {
  if (arr.length === 0) {return BLOCKCHAIN.ZERO_BIGINT}
  const index = Math.ceil((p / BLOCKCHAIN.PERCENTAGE_MULTIPLIER) * arr.length) - 1
  const safeIndex = Math.max(0, Math.min(index, arr.length - 1))
  return arr[safeIndex] ?? BLOCKCHAIN.ZERO_BIGINT
}

/**
 * Extract priority fees from blocks
 */
function extractPriorityFees(blocks: BlockData[]): bigint[] {
  const fees: bigint[] = []

  for (const block of blocks) {
    const baseFee = block.baseFeePerGas ? BigInt(block.baseFeePerGas) : BLOCKCHAIN.ZERO_BIGINT

    for (const tx of block.transactions) {
      // For EIP-1559 transactions (type 2)
      if (tx.type === 2 && tx.maxPriorityFeePerGas) {
        fees.push(BigInt(tx.maxPriorityFeePerGas))
      }
      // For legacy transactions, estimate priority fee
      else if (tx.gasPrice && baseFee > BLOCKCHAIN.ZERO_BIGINT) {
        const gasPrice = BigInt(tx.gasPrice)
        if (gasPrice > baseFee) {
          fees.push(gasPrice - baseFee)
        }
      }
    }
  }

  return fees.sort((a, b) => {
    if (a < b) {return -1}
    if (a > b) {return 1}
    return 0
  })
}

/**
 * Estimate confirmation time based on priority fee percentile
 */
function estimateConfirmationTime(tier: GasPriceTier): number {
  switch (tier) {
    case 'economy':
      return GAS.CONFIRMATION_ECONOMY_SECONDS
    case 'standard':
      return GAS.CONFIRMATION_STANDARD_SECONDS
    case 'priority':
      return GAS.CONFIRMATION_PRIORITY_SECONDS
    default:
      return GAS.CONFIRMATION_STANDARD_SECONDS
  }
}

/**
 * Format estimated time for display
 */
function formatEstimatedTime(seconds: number): string {
  if (seconds < BLOCKCHAIN.SECONDS_PER_MINUTE) {
    return `~${seconds}s`
  }
  const minutes = Math.round(seconds / BLOCKCHAIN.SECONDS_PER_MINUTE)
  return `~${minutes}m`
}

/**
 * Hook for real-time gas tracking with price recommendations
 *
 * Analyzes recent blocks to calculate gas price recommendations
 * and network utilization metrics.
 */
export function useGasTracker(options: UseGasTrackerOptions = {}) {
  const { blockCount = 20, enableSubscription = true } = options

  const lastBlockHashRef = useRef<string | null>(null)

  // Fetch recent blocks
  const { data, loading, error, refetch } = useQuery(GET_RECENT_BLOCKS_FOR_GAS, {
    variables: { limit: blockCount },
    pollInterval: enableSubscription ? 0 : GAS.BLOCK_TIME_POLL_MS,
    fetchPolicy: 'cache-and-network',
  })

  // Subscribe to new blocks
  const { data: subscriptionData } = useSubscription(SUBSCRIBE_NEW_BLOCK_GAS, {
    skip: !enableSubscription,
    fetchPolicy: 'no-cache',
  })

  // Refetch when new block arrives
  useEffect(() => {
    if (subscriptionData?.newBlock) {
      const newBlockHash = subscriptionData.newBlock.hash
      if (newBlockHash !== lastBlockHashRef.current) {
        lastBlockHashRef.current = newBlockHash
        refetch()
      }
    }
  }, [subscriptionData, refetch])

  // Calculate gas metrics from block data
  const metrics = useMemo<NetworkGasMetrics | null>(() => {
    if (!data?.blocks?.nodes?.length) {return null}

    const blocks: BlockData[] = data.blocks.nodes
    const latestBlock = blocks[0]

    // Guard against empty blocks array (TypeScript narrowing)
    if (!latestBlock) {return null}

    // Get base fee from latest block
    const baseFee = latestBlock.baseFeePerGas ? BigInt(latestBlock.baseFeePerGas) : BLOCKCHAIN.ZERO_BIGINT
    const baseFeeGwei = weiToGwei(baseFee)

    // Calculate network utilization
    const gasUsed = BigInt(latestBlock.gasUsed)
    const gasLimit = BigInt(latestBlock.gasLimit)
    const networkUtilization = gasLimit > BLOCKCHAIN.ZERO_BIGINT ? Number((gasUsed * BLOCKCHAIN.HUNDRED_BIGINT) / gasLimit) : 0

    // Extract and analyze priority fees
    const priorityFees = extractPriorityFees(blocks)

    // Calculate percentiles for recommendations
    const p25 = priorityFees.length > 0 ? percentile(priorityFees, BLOCKCHAIN.PERCENTAGE_QUARTER) : BigInt(GAS.GWEI_1_WEI)
    const p50 = priorityFees.length > 0 ? percentile(priorityFees, BLOCKCHAIN.PERCENTAGE_HALF) : BigInt(GAS.GWEI_2_WEI)
    const p75 = priorityFees.length > 0 ? percentile(priorityFees, BLOCKCHAIN.PERCENTAGE_THREE_QUARTERS) : BigInt(GAS.GWEI_3_WEI)

    // Ensure minimum priority fees
    const minPriority = BigInt(GAS.GWEI_1_WEI)
    const economyPriority = p25 > minPriority ? p25 : minPriority
    const standardPriority = p50 > economyPriority ? p50 : economyPriority + BigInt(GAS.GWEI_1_WEI)
    const priorityPriority = p75 > standardPriority ? p75 : standardPriority + BigInt(GAS.GWEI_1_WEI)

    // Build price levels
    const priceLevels: GasPriceLevel[] = [
      {
        tier: 'economy',
        label: 'Economy',
        icon: '🐢',
        maxFeePerGas: baseFee + economyPriority + BigInt(GAS.GWEI_5_WEI),
        maxPriorityFee: economyPriority,
        estimatedSeconds: estimateConfirmationTime('economy'),
        displayLabel: formatEstimatedTime(estimateConfirmationTime('economy')),
      },
      {
        tier: 'standard',
        label: 'Standard',
        icon: '🚗',
        maxFeePerGas: baseFee + standardPriority + BigInt(GAS.GWEI_10_WEI),
        maxPriorityFee: standardPriority,
        estimatedSeconds: estimateConfirmationTime('standard'),
        displayLabel: formatEstimatedTime(estimateConfirmationTime('standard')),
      },
      {
        tier: 'priority',
        label: 'Priority',
        icon: '🚀',
        maxFeePerGas: baseFee + priorityPriority + BigInt(GAS.GWEI_15_WEI),
        maxPriorityFee: priorityPriority,
        estimatedSeconds: estimateConfirmationTime('priority'),
        displayLabel: formatEstimatedTime(estimateConfirmationTime('priority')),
      },
    ]

    return {
      baseFee,
      baseFeeGwei,
      priceLevels,
      networkUtilization,
      pendingCount: 0, // Would need mempool data
      lastBlockGasUsed: gasUsed,
      lastBlockGasLimit: gasLimit,
      lastBlockNumber: Number(latestBlock.number),
      lastBlockTimestamp: Number(latestBlock.timestamp),
      updatedAt: new Date(),
    }
  }, [data])

  // Calculate gas history for chart
  const history = useMemo<GasPriceHistoryPoint[]>(() => {
    if (!data?.blocks?.nodes?.length) {return []}

    return data.blocks.nodes
      .map((block: BlockData) => {
        const baseFee = block.baseFeePerGas ? BigInt(block.baseFeePerGas) : BLOCKCHAIN.ZERO_BIGINT
        const gasUsed = BigInt(block.gasUsed)
        const gasLimit = BigInt(block.gasLimit)

        return {
          blockNumber: Number(block.number),
          timestamp: Number(block.timestamp),
          baseFee,
          baseFeeGwei: weiToGwei(baseFee),
          utilization: gasLimit > BLOCKCHAIN.ZERO_BIGINT ? Number((gasUsed * BLOCKCHAIN.HUNDRED_BIGINT) / gasLimit) : 0,
          txCount: block.transactionCount,
        }
      })
      .reverse() // Oldest first for chart
  }, [data])

  return {
    metrics,
    history,
    loading,
    error,
    refetch,
  }
}
