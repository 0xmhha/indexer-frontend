'use client'

/**
 * Event Subscription Hooks
 * Hooks for log, chain config, and validator set subscriptions
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSubscription } from '@apollo/client'
import {
  SUBSCRIBE_LOGS,
  SUBSCRIBE_CHAIN_CONFIG,
  SUBSCRIBE_VALIDATOR_SET,
} from '@/lib/apollo/queries'
import {
  transformChainConfigChange,
  transformValidatorSetChange,
} from '@/lib/utils/graphql-transforms'
import type {
  RawLog,
  Log,
  RawChainConfigChange,
  ChainConfigChange,
  RawValidatorSetChange,
  ValidatorSetChange,
} from '@/types/graphql'
import { REALTIME, REPLAY } from '@/lib/config/constants'
import { errorLogger } from '@/lib/errors/logger'

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
 */
export function useLogs(filter: LogFilter = {}, options: UseLogsOptions = {}) {
  const { maxLogs = REALTIME.MAX_LOGS, replayLast = REPLAY.LOGS_DEFAULT } = options
  const [logs, setLogs] = useState<Log[]>([])

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

  const variables = useMemo(
    () => ({ filter: stableFilter, replayLast }),
    [stableFilter, replayLast]
  )

  const filterRef = useRef(filter)
  useEffect(() => {
    filterRef.current = filter
  }, [filter])

  const { data, loading, error } = useSubscription(SUBSCRIBE_LOGS, {
    fetchPolicy: 'no-cache',
    variables,
    onError: (error) => {
      errorLogger.error(error, { component: 'useSubscriptions', action: 'logs-subscription' })
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

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogs((prev) => {
        const updated = [transformedLog, ...prev]
        return updated.slice(0, maxLogs)
      })
    }
  }, [data, maxLogs])

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
 */
export function useChainConfig(options: UseChainConfigOptions = {}) {
  const { maxEvents = 50, replayLast = REPLAY.CHAIN_CONFIG_DEFAULT } = options
  const [configChanges, setConfigChanges] = useState<ChainConfigChange[]>([])
  const [latestChange, setLatestChange] = useState<ChainConfigChange | null>(null)

  const variables = useMemo(() => ({ replayLast }), [replayLast])

  const { data, loading, error } = useSubscription(SUBSCRIBE_CHAIN_CONFIG, {
    variables,
    fetchPolicy: 'no-cache',
    onError: (error) => {
      errorLogger.error(error, { component: 'useSubscriptions', action: 'chain-config-subscription' })
    },
  })

  useEffect(() => {
    if (data?.chainConfig) {
      const rawChange = data.chainConfig as RawChainConfigChange
      const transformedChange = transformChainConfigChange(rawChange)

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLatestChange(transformedChange)
      setConfigChanges((prev) => {
        const updated = [transformedChange, ...prev]
        return updated.slice(0, maxEvents)
      })
    }
  }, [data, maxEvents])

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
 */
export function useValidatorSet(options: UseValidatorSetOptions = {}) {
  const { maxEvents = 50, replayLast = REPLAY.VALIDATOR_SET_DEFAULT } = options
  const [validatorChanges, setValidatorChanges] = useState<ValidatorSetChange[]>([])
  const [latestChange, setLatestChange] = useState<ValidatorSetChange | null>(null)

  const variables = useMemo(() => ({ replayLast }), [replayLast])

  const { data, loading, error } = useSubscription(SUBSCRIBE_VALIDATOR_SET, {
    variables,
    fetchPolicy: 'no-cache',
    onError: (error) => {
      errorLogger.error(error, { component: 'useSubscriptions', action: 'validator-set-subscription' })
    },
  })

  useEffect(() => {
    if (data?.validatorSet) {
      const rawChange = data.validatorSet as RawValidatorSetChange
      const transformedChange = transformValidatorSetChange(rawChange)

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLatestChange(transformedChange)
      setValidatorChanges((prev) => {
        const updated = [transformedChange, ...prev]
        return updated.slice(0, maxEvents)
      })
    }
  }, [data, maxEvents])

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
