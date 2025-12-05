'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSubscription, useQuery } from '@apollo/client'
import {
  SUBSCRIBE_LOGS,
  SUBSCRIBE_CHAIN_CONFIG,
  SUBSCRIBE_VALIDATOR_SET,
  GET_LATEST_HEIGHT,
} from '@/lib/apollo/queries'
import {
  transformBlock,
  transformTransaction,
  transformChainConfigChange,
  transformValidatorSetChange,
} from '@/lib/utils/graphql-transforms'
import type {
  RawBlock,
  Block,
  RawTransaction,
  RawLog,
  Log,
  RawChainConfigChange,
  ChainConfigChange,
  RawValidatorSetChange,
  ValidatorSetChange,
} from '@/types/graphql'
import { env } from '@/lib/config/env'
import { REALTIME, REPLAY } from '@/lib/config/constants'
import {
  useRealtimeStore,
  selectRecentBlocks,
  selectLatestBlock,
  selectRecentTransactions,
  selectPendingTransactions,
  selectIsConnected,
} from '@/stores/realtimeStore'

/**
 * Log filter options for subscription
 */
export interface LogFilter {
  address?: string
  addresses?: string[]
  topics?: (string | string[] | null)[]
  fromBlock?: string
  toBlock?: string
}

/**
 * Hook to get pending transactions from centralized store
 * Real-time updates come from RealtimeProvider (single subscription source)
 *
 * @param maxTransactions - Maximum number of transactions to return (default: 50)
 * @returns Object containing pending transactions array, loading state, and connection status
 *
 * @example
 * ```tsx
 * const { pendingTransactions, loading } = usePendingTransactions(100)
 * ```
 */
export function usePendingTransactions(maxTransactions: number = REALTIME.MAX_PENDING_TRANSACTIONS) {
  // Read from centralized store instead of subscribing directly
  const allPending = useRealtimeStore(selectPendingTransactions)
  const isConnected = useRealtimeStore(selectIsConnected)

  // Transform and limit the transactions
  const pendingTransactions = useMemo(() => {
    return allPending.slice(0, maxTransactions).map((tx) => transformTransaction(tx as RawTransaction))
  }, [allPending, maxTransactions])

  return {
    pendingTransactions,
    loading: !isConnected && pendingTransactions.length === 0,
    error: null,
  }
}

/**
 * Options for useLogs hook
 */
export interface UseLogsOptions {
  /** Maximum number of logs to keep in memory (default: 100) */
  maxLogs?: number
  /** Number of recent logs to replay on subscription (default: REPLAY.LOGS_DEFAULT) */
  replayLast?: number
}

/**
 * Hook to subscribe to logs with filtering
 *
 * @param filter - Filter for logs (address, topics, block range). All fields are optional but filter object is required.
 * @param options - Configuration options including maxLogs and replayLast
 * @returns Object containing logs array, loading state, and error
 *
 * @example
 * ```tsx
 * // Subscribe to all Transfer events from a specific contract with replay
 * const { logs, loading, error } = useLogs({
 *   address: '0x...',
 *   topics: ['0xddf252ad...'] // Transfer event signature
 * }, { replayLast: 20 })
 *
 * // Subscribe to all logs (empty filter) with default replay
 * const { logs, loading, error } = useLogs({})
 * ```
 */
export function useLogs(filter: LogFilter = {}, options: UseLogsOptions = {}) {
  const { maxLogs = REALTIME.MAX_LOGS, replayLast = REPLAY.LOGS_DEFAULT } = options
  const [logs, setLogs] = useState<Log[]>([])

  // Memoize filter to prevent infinite re-subscription
  // Normalize filter values for stable comparison
  const stableFilter = useMemo(
    () => ({
      address: filter.address?.toLowerCase(),
      addresses: filter.addresses?.map((a) => a.toLowerCase()),
      topics: filter.topics,
      fromBlock: filter.fromBlock,
      toBlock: filter.toBlock,
    }),
    [filter.address, filter.addresses, filter.topics, filter.fromBlock, filter.toBlock]
  )

  // Memoize variables to prevent re-subscription
  const variables = useMemo(
    () => ({ filter: stableFilter, replayLast }),
    [stableFilter, replayLast]
  )

  // Store current filter in ref for use in effect (not during render)
  const filterRef = useRef(filter)
  useEffect(() => {
    filterRef.current = filter
  }, [filter])

  const { data, loading, error } = useSubscription(SUBSCRIBE_LOGS, {
    fetchPolicy: 'no-cache',
    variables,
    onError: (error) => {
      console.error('[Logs Subscription Error]:', error)
    },
  })

  useEffect(() => {
    if (data?.logs) {
      const rawLog = data.logs as RawLog
      const transformedLog: Log = {
        address: rawLog.address,
        topics: rawLog.topics,
        data: rawLog.data,
        blockNumber: BigInt(rawLog.blockNumber),
        blockHash: rawLog.blockHash,
        transactionHash: rawLog.transactionHash,
        transactionIndex: rawLog.transactionIndex,
        logIndex: rawLog.logIndex,
        removed: rawLog.removed,
      }

      // Legitimate use case: updating state from external subscription data
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogs((prev) => {
        // Add new log at the beginning
        const updated = [transformedLog, ...prev]
        // Keep only the most recent maxLogs
        return updated.slice(0, maxLogs)
      })
    }
  }, [data, maxLogs])

  /**
   * Clear all accumulated logs
   */
  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
    logs,
    loading,
    error,
    clearLogs,
  }
}

/**
 * Hook to get blocks from centralized store with initial data loading
 * Real-time updates come from RealtimeProvider (single subscription source)
 *
 * @param maxBlocks - Maximum number of blocks to return (default: 20)
 * @returns Object containing blocks array, loading state, error, and latest block
 *
 * @example
 * ```tsx
 * const { blocks, latestBlock, loading, error } = useNewBlocks(50)
 * ```
 */
export function useNewBlocks(maxBlocks: number = REALTIME.MAX_BLOCKS) {
  const [initialBlocks, setInitialBlocks] = useState<Block[]>([])
  const [initialized, setInitialized] = useState(false)

  // Get real-time data from centralized store
  const realtimeBlocks = useRealtimeStore(selectRecentBlocks)
  const realtimeLatestBlock = useRealtimeStore(selectLatestBlock)
  const isConnected = useRealtimeStore(selectIsConnected)

  // Get latest height for initial data loading
  const { data: heightData } = useQuery(GET_LATEST_HEIGHT, {
    fetchPolicy: 'cache-first',
  })

  // Load initial blocks when we have the latest height (only once)
  useEffect(() => {
    if (heightData?.latestHeight && !initialized) {
      // Required to prevent double fetch
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialized(true)

      const latestHeight = BigInt(heightData.latestHeight)
      const blocksToFetch: bigint[] = []

      for (let i = 0; i < maxBlocks; i++) {
        const blockNum = latestHeight - BigInt(i)
        if (blockNum >= BigInt(0)) {
          blocksToFetch.push(blockNum)
        }
      }

      Promise.all(
        blocksToFetch.map(async (blockNum) => {
          try {
            const response = await fetch(env.graphqlEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                  query GetBlock($number: String!) {
                    block(number: $number) {
                      number
                      hash
                      parentHash
                      timestamp
                      miner
                      gasUsed
                      gasLimit
                      size
                      transactionCount
                    }
                  }
                `,
                variables: { number: blockNum.toString() },
              }),
            })
            const result = await response.json()
            return result.data?.block ? transformBlock(result.data.block as RawBlock) : null
          } catch (err) {
            console.error('[useNewBlocks] Failed to fetch block', blockNum, err)
            return null
          }
        })
      ).then((fetchedBlocks) => {
        const validBlocks = fetchedBlocks.filter((b): b is Block => b !== null)
        if (validBlocks.length > 0) {
          setInitialBlocks(validBlocks)
        }
      })
    }
  }, [heightData, initialized, maxBlocks])

  // Merge initial blocks with realtime blocks
  const blocks = useMemo(() => {
    const realtimeTransformed = realtimeBlocks.map((b) => transformBlock(b as unknown as RawBlock))
    const merged = [...realtimeTransformed]

    // Add initial blocks that aren't in realtime
    initialBlocks.forEach((block) => {
      if (!merged.some((b) => b.hash === block.hash)) {
        merged.push(block)
      }
    })

    // Sort by block number descending and limit
    return merged
      .sort((a, b) => (b.number > a.number ? 1 : -1))
      .slice(0, maxBlocks)
  }, [realtimeBlocks, initialBlocks, maxBlocks])

  const latestBlock = useMemo(() => {
    if (realtimeLatestBlock) {
      return transformBlock(realtimeLatestBlock as unknown as RawBlock)
    }
    return blocks[0] ?? null
  }, [realtimeLatestBlock, blocks])

  const clearBlocks = useCallback(() => {
    setInitialBlocks([])
    setInitialized(false)
  }, [])

  return {
    blocks,
    latestBlock,
    loading: !initialized && !isConnected,
    error: null,
    clearBlocks,
  }
}

/**
 * Hook to get confirmed transactions from centralized store
 * Real-time updates come from RealtimeProvider (single subscription source)
 *
 * @param maxTransactions - Maximum number of transactions to return (default: 50)
 * @returns Object containing transactions array, loading state, and connection status
 *
 * @example
 * ```tsx
 * const { transactions, loading } = useNewTransactions(100)
 * ```
 */
export function useNewTransactions(maxTransactions: number = REALTIME.MAX_TRANSACTIONS) {
  // Read from centralized store instead of subscribing directly
  const realtimeTransactions = useRealtimeStore(selectRecentTransactions)
  const isConnected = useRealtimeStore(selectIsConnected)

  // Transform and limit the transactions
  const transactions = useMemo(() => {
    return realtimeTransactions
      .slice(0, maxTransactions)
      .map((tx) => transformTransaction(tx as RawTransaction))
  }, [realtimeTransactions, maxTransactions])

  const clearTransactions = useCallback(() => {
    // No-op for now - store manages its own state
  }, [])

  return {
    transactions,
    loading: !isConnected && transactions.length === 0,
    error: null,
    clearTransactions,
  }
}

/**
 * Options for useChainConfig hook
 */
export interface UseChainConfigOptions {
  /** Maximum number of events to keep in memory (default: 50) */
  maxEvents?: number
  /** Number of recent config changes to replay on subscription (default: REPLAY.CHAIN_CONFIG_DEFAULT) */
  replayLast?: number
}

/**
 * Hook to subscribe to chain configuration changes in real-time
 *
 * @param options - Configuration options including maxEvents and replayLast
 * @returns Object containing config changes array, latest change, loading state, and error
 *
 * @example
 * ```tsx
 * const { configChanges, latestChange, loading, error } = useChainConfig({ maxEvents: 100, replayLast: 10 })
 * ```
 */
export function useChainConfig(options: UseChainConfigOptions = {}) {
  const { maxEvents = 50, replayLast = REPLAY.CHAIN_CONFIG_DEFAULT } = options
  const [configChanges, setConfigChanges] = useState<ChainConfigChange[]>([])
  const [latestChange, setLatestChange] = useState<ChainConfigChange | null>(null)

  // Memoize variables to prevent re-subscription
  const variables = useMemo(() => ({ replayLast }), [replayLast])

  const { data, loading, error } = useSubscription(SUBSCRIBE_CHAIN_CONFIG, {
    variables,
    fetchPolicy: 'no-cache',
    onError: (error) => {
      console.error('[Chain Config Subscription Error]:', error)
    },
  })

  useEffect(() => {
    if (data?.chainConfig) {
      const rawChange = data.chainConfig as RawChainConfigChange
      const transformedChange = transformChainConfigChange(rawChange)

      // Legitimate use case: updating state from external subscription data
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLatestChange(transformedChange)
      setConfigChanges((prev) => {
        const updated = [transformedChange, ...prev]
        return updated.slice(0, maxEvents)
      })
    }
  }, [data, maxEvents])

  /**
   * Clear all accumulated config changes
   */
  const clearConfigChanges = useCallback(() => {
    setConfigChanges([])
    setLatestChange(null)
  }, [])

  return {
    configChanges,
    latestChange,
    loading,
    error,
    clearConfigChanges,
  }
}

/**
 * Options for useValidatorSet hook
 */
export interface UseValidatorSetOptions {
  /** Maximum number of events to keep in memory (default: 50) */
  maxEvents?: number
  /** Number of recent validator changes to replay on subscription (default: REPLAY.VALIDATOR_SET_DEFAULT) */
  replayLast?: number
}

/**
 * Hook to subscribe to validator set changes in real-time
 *
 * @param options - Configuration options including maxEvents and replayLast
 * @returns Object containing validator changes array, latest change, loading state, and error
 *
 * @example
 * ```tsx
 * const { validatorChanges, latestChange, loading, error } = useValidatorSet({ maxEvents: 100, replayLast: 10 })
 * ```
 */
export function useValidatorSet(options: UseValidatorSetOptions = {}) {
  const { maxEvents = 50, replayLast = REPLAY.VALIDATOR_SET_DEFAULT } = options
  const [validatorChanges, setValidatorChanges] = useState<ValidatorSetChange[]>([])
  const [latestChange, setLatestChange] = useState<ValidatorSetChange | null>(null)

  // Memoize variables to prevent re-subscription
  const variables = useMemo(() => ({ replayLast }), [replayLast])

  const { data, loading, error } = useSubscription(SUBSCRIBE_VALIDATOR_SET, {
    variables,
    fetchPolicy: 'no-cache',
    onError: (error) => {
      console.error('[Validator Set Subscription Error]:', error)
    },
  })

  useEffect(() => {
    if (data?.validatorSet) {
      const rawChange = data.validatorSet as RawValidatorSetChange
      const transformedChange = transformValidatorSetChange(rawChange)

      // Legitimate use case: updating state from external subscription data
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLatestChange(transformedChange)
      setValidatorChanges((prev) => {
        const updated = [transformedChange, ...prev]
        return updated.slice(0, maxEvents)
      })
    }
  }, [data, maxEvents])

  /**
   * Clear all accumulated validator changes
   */
  const clearValidatorChanges = useCallback(() => {
    setValidatorChanges([])
    setLatestChange(null)
  }, [])

  return {
    validatorChanges,
    latestChange,
    loading,
    error,
    clearValidatorChanges,
  }
}

/**
 * Transaction filter options for subscription
 */
export interface TransactionFilter {
  from?: string
  to?: string
}

/**
 * Hook to get filtered transactions from centralized store
 * Real-time updates come from RealtimeProvider (single subscription source)
 *
 * @param filter - Filter for transactions by from/to address
 * @param maxTransactions - Maximum number of transactions to return (default: 50)
 * @returns Object containing transactions array, loading state, and connection status
 *
 * @example
 * ```tsx
 * // Get transactions from a specific address
 * const { transactions, loading } = useFilteredTransactions({ from: '0x...' })
 *
 * // Get transactions to a specific address
 * const { transactions, loading } = useFilteredTransactions({ to: '0x...' })
 * ```
 */
export function useFilteredNewTransactions(
  filter: TransactionFilter = {},
  maxTransactions: number = REALTIME.MAX_TRANSACTIONS
) {
  // Read from centralized store instead of subscribing directly
  const realtimeTransactions = useRealtimeStore(selectRecentTransactions)
  const isConnected = useRealtimeStore(selectIsConnected)

  // Transform and filter transactions
  const transactions = useMemo(() => {
    const transformed = realtimeTransactions.map((tx) =>
      transformTransaction(tx as RawTransaction)
    )

    // Apply filters
    const filtered = transformed.filter((tx) => {
      if (filter.from && tx.from.toLowerCase() !== filter.from.toLowerCase()) {
        return false
      }
      if (filter.to && tx.to?.toLowerCase() !== filter.to.toLowerCase()) {
        return false
      }
      return true
    })

    return filtered.slice(0, maxTransactions)
  }, [realtimeTransactions, filter.from, filter.to, maxTransactions])

  const clearFilteredTransactions = useCallback(() => {
    // No-op for now - store manages its own state
  }, [])

  return {
    transactions,
    loading: !isConnected && transactions.length === 0,
    error: null,
    clearTransactions: clearFilteredTransactions,
  }
}
