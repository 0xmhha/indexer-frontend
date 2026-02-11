'use client'

import { useQuery, useLazyQuery } from '@apollo/client'
import {
  CONTRACT_CALL,
  TRANSACTION_STATUS,
  INTERNAL_TRANSACTIONS_RPC,
  RPC_PROXY_METRICS,
} from '@/lib/graphql/queries/rpcProxy'
import { GET_LIVE_BALANCE } from '@/lib/apollo/queries'

// ============================================================================
// Types
// ============================================================================

export interface ContractCallResult {
  result: string | null
  rawResult: string
  decoded: boolean
}

export interface TransactionStatusResult {
  txHash: string
  status: 'pending' | 'success' | 'failed' | 'confirmed' | 'not_found'
  blockNumber?: string
  blockHash?: string
  confirmations: string
  gasUsed?: string
}

export interface InternalTransactionRPC {
  type: 'CALL' | 'CREATE' | 'DELEGATECALL' | 'STATICCALL' | 'CALLCODE'
  from: string
  to: string
  value: string
  gas: string
  gasUsed: string
  input?: string
  output?: string
  error?: string
  depth: number
  traceAddress: number[]
}

export interface InternalTransactionsRPCResult {
  txHash: string
  internalTransactions: InternalTransactionRPC[]
  totalCount: number
}

export interface RPCProxyMetrics {
  totalRequests: string
  successfulRequests: string
  failedRequests: string
  cacheHits: string
  cacheMisses: string
  averageLatencyMs: string
  queueDepth: number
  activeWorkers: number
  circuitState: 'closed' | 'open' | 'half-open'
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for read-only contract calls via RPC Proxy
 * Automatically caches results based on TTL
 */
export function useContractCall(
  address: string,
  method: string,
  params?: unknown[],
  abi?: string
) {
  const { data, loading, error, refetch } = useQuery<{
    contractCall: ContractCallResult
  }>(CONTRACT_CALL, {
    variables: {
      address,
      method,
      params: params ? JSON.stringify(params) : undefined,
      abi,
    },
    skip: !address || !method,
    errorPolicy: 'all',
  })

  const parseResult = <T = unknown>(): T | null => {
    if (!data?.contractCall?.decoded || !data.contractCall.result) {
      return null
    }
    try {
      return JSON.parse(data.contractCall.result) as T
    } catch {
      return data.contractCall.result as T
    }
  }

  return {
    result: data?.contractCall,
    parsedResult: parseResult(),
    loading,
    error,
    refetch,
  }
}

/**
 * Lazy version of useContractCall for on-demand calls
 */
export function useContractCallLazy() {
  const [execute, { data, loading, error }] = useLazyQuery<{
    contractCall: ContractCallResult
  }>(CONTRACT_CALL, {
    errorPolicy: 'all',
  })

  const call = async (
    address: string,
    method: string,
    params?: unknown[],
    abi?: string
  ): Promise<ContractCallResult | null> => {
    const result = await execute({
      variables: {
        address,
        method,
        params: params ? JSON.stringify(params) : undefined,
        abi,
      },
    })
    return result.data?.contractCall ?? null
  }

  return { call, data: data?.contractCall, loading, error }
}

/**
 * Hook for real-time transaction status via RPC Proxy
 * Supports polling for pending transactions
 */
export function useTransactionStatus(txHash: string, pollInterval?: number) {
  const { data, loading, error, startPolling, stopPolling } = useQuery<{
    transactionStatus: TransactionStatusResult
  }>(TRANSACTION_STATUS, {
    variables: { txHash },
    skip: !txHash,
    ...(pollInterval !== undefined && { pollInterval }),
    errorPolicy: 'all',
  })

  const status = data?.transactionStatus

  return {
    status,
    loading,
    error,
    isPending: status?.status === 'pending',
    isSuccess: status?.status === 'success',
    isFailed: status?.status === 'failed',
    isConfirmed: status?.status === 'confirmed',
    isNotFound: status?.status === 'not_found',
    startPolling,
    stopPolling,
  }
}

/**
 * Hook for internal transactions via debug_traceTransaction RPC
 * Uses RPC Proxy for caching and rate limiting
 */
export function useInternalTransactionsRPC(txHash: string) {
  const { data, loading, error, refetch } = useQuery<{
    internalTransactionsRPC: InternalTransactionsRPCResult
  }>(INTERNAL_TRANSACTIONS_RPC, {
    variables: { txHash },
    skip: !txHash,
    errorPolicy: 'all',
  })

  return {
    result: data?.internalTransactionsRPC,
    internalTransactions: data?.internalTransactionsRPC?.internalTransactions ?? [],
    totalCount: data?.internalTransactionsRPC?.totalCount ?? 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Lazy version of useInternalTransactionsRPC
 */
export function useInternalTransactionsRPCLazy() {
  const [execute, { data, loading, error }] = useLazyQuery<{
    internalTransactionsRPC: InternalTransactionsRPCResult
  }>(INTERNAL_TRANSACTIONS_RPC, {
    errorPolicy: 'all',
  })

  const loadTrace = async (txHash: string) => {
    const result = await execute({ variables: { txHash } })
    return result.data?.internalTransactionsRPC ?? null
  }

  return {
    loadTrace,
    result: data?.internalTransactionsRPC,
    internalTransactions: data?.internalTransactionsRPC?.internalTransactions ?? [],
    totalCount: data?.internalTransactionsRPC?.totalCount ?? 0,
    loading,
    error,
  }
}

/**
 * Hook for RPC Proxy service metrics
 */
export function useRPCProxyMetrics() {
  const { data, loading, error, refetch } = useQuery<{
    rpcProxyMetrics: RPCProxyMetrics
  }>(RPC_PROXY_METRICS, {
    pollInterval: 5000, // Refresh every 5 seconds
    errorPolicy: 'all',
  })

  return {
    metrics: data?.rpcProxyMetrics,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching token information (name, symbol, decimals, totalSupply)
 */
export function useTokenInfo(tokenAddress: string) {
  const { result: nameResult, loading: nameLoading } = useContractCall(tokenAddress, 'name')
  const { result: symbolResult, loading: symbolLoading } = useContractCall(tokenAddress, 'symbol')
  const { result: decimalsResult, loading: decimalsLoading } = useContractCall(tokenAddress, 'decimals')
  const { result: totalSupplyResult, loading: totalSupplyLoading } = useContractCall(tokenAddress, 'totalSupply')

  const parseResult = (result: ContractCallResult | undefined): string | null => {
    if (!result?.decoded || !result.result) { return null }
    try {
      return JSON.parse(result.result)
    } catch {
      return result.result
    }
  }

  return {
    name: parseResult(nameResult),
    symbol: parseResult(symbolResult),
    decimals: parseResult(decimalsResult),
    totalSupply: parseResult(totalSupplyResult),
    loading: nameLoading || symbolLoading || decimalsLoading || totalSupplyLoading,
  }
}

/**
 * Hook for fetching token balance via balanceOf call
 * Uses the NativeCoinAdapter (0x1000) for native WKRC balance
 */
export function useTokenBalance(tokenAddress: string, walletAddress: string) {
  const { result, loading, error, refetch } = useContractCall(
    tokenAddress,
    'balanceOf',
    [walletAddress]
  )

  const balance = result?.decoded && result.result
    ? BigInt(JSON.parse(result.result))
    : null

  return {
    balance,
    rawResult: result?.rawResult,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching native coin balance via eth_getBalance RPC
 * Queries the blockchain directly through the backend RPC proxy
 * @param address - The address to query balance for
 * @param blockNumber - Optional block number (defaults to latest)
 * @param pollInterval - Optional polling interval in ms for real-time updates
 */
export function useNativeBalance(
  address: string | null,
  blockNumber?: string,
  pollInterval?: number
) {
  const { data, loading, error, refetch, previousData } = useQuery<{
    liveBalance: {
      address: string
      balance: string
      blockNumber: string
    }
  }>(GET_LIVE_BALANCE, {
    variables: {
      address: address ?? '',
      blockNumber: blockNumber ?? null,
    },
    skip: !address,
    errorPolicy: 'all',
    ...(pollInterval !== undefined && { pollInterval }),
    // Use previous data while loading to prevent flickering
    notifyOnNetworkStatusChange: false,
  })

  // Use previous data while loading to prevent flickering
  const effectiveData = data ?? previousData

  const balance = effectiveData?.liveBalance?.balance
    ? BigInt(effectiveData.liveBalance.balance)
    : null

  return {
    balance,
    rawBalance: effectiveData?.liveBalance?.balance ?? null,
    loading,
    error,
    refetch,
  }
}
