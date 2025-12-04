'use client'

import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { env } from '@/lib/config/env'

// ============================================================================
// Types
// ============================================================================

/**
 * Internal call extracted from trace data
 */
export interface InternalCall {
  type: string
  from: string
  to: string | null
  value: bigint
  input: string
  output: string
  error: string | null
  gas: bigint
  gasUsed: bigint
  depth: number
  calls: InternalCall[] | undefined
}

/**
 * Parsed trace result
 */
export interface TransactionTrace {
  txHash: string
  type: string
  from: string
  to: string | null
  value: bigint
  gas: bigint
  gasUsed: bigint
  input: string
  output: string
  error: string | null
  calls: InternalCall[]
  flattenedCalls: InternalCall[]
}

/**
 * Raw trace response from RPC
 */
interface RawTraceCall {
  type: string
  from: string
  to?: string
  value?: string
  gas?: string
  gasUsed?: string
  input: string
  output?: string
  error?: string
  calls?: RawTraceCall[]
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Flatten nested calls into a single array
 */
function flattenCalls(calls: InternalCall[], depth: number = 1): InternalCall[] {
  const result: InternalCall[] = []

  for (const call of calls) {
    result.push({ ...call, depth })
    if (call.calls && call.calls.length > 0) {
      result.push(...flattenCalls(call.calls, depth + 1))
    }
  }

  return result
}

/**
 * Parse raw trace call into InternalCall
 */
function parseTraceCall(raw: RawTraceCall, depth: number = 1): InternalCall {
  const parsedCalls = raw.calls?.map((c) => parseTraceCall(c, depth + 1)) ?? []

  return {
    type: raw.type,
    from: raw.from,
    to: raw.to ?? null,
    value: BigInt(raw.value ?? '0'),
    input: raw.input,
    output: raw.output ?? '0x',
    error: raw.error ?? null,
    gas: BigInt(raw.gas ?? '0'),
    gasUsed: BigInt(raw.gasUsed ?? '0'),
    depth,
    calls: parsedCalls.length > 0 ? parsedCalls : undefined,
  }
}

/**
 * Parse raw trace response into TransactionTrace
 */
function parseTraceResponse(txHash: string, raw: RawTraceCall): TransactionTrace {
  const topLevelCall = parseTraceCall(raw, 0)
  const calls = topLevelCall.calls ?? []

  return {
    txHash,
    type: topLevelCall.type,
    from: topLevelCall.from,
    to: topLevelCall.to,
    value: topLevelCall.value,
    gas: topLevelCall.gas,
    gasUsed: topLevelCall.gasUsed,
    input: topLevelCall.input,
    output: topLevelCall.output,
    error: topLevelCall.error,
    calls,
    flattenedCalls: flattenCalls(calls),
  }
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to trace a transaction using debug_traceTransaction RPC call
 * Returns internal calls and execution trace
 */
export function useTransactionTrace() {
  const [trace, setTrace] = useState<TransactionTrace | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const traceTransaction = useCallback(async (txHash: string) => {
    if (!txHash) {
      return
    }

    setLoading(true)
    setError(null)
    setTrace(null)

    try {
      const provider = new ethers.JsonRpcProvider(env.jsonRpcEndpoint)

      // Use callTracer to get internal calls
      const traceResult = await provider.send('debug_traceTransaction', [
        txHash,
        {
          tracer: 'callTracer',
          tracerConfig: {
            onlyTopCall: false,
            withLog: false,
          },
        },
      ])

      if (!traceResult) {
        throw new Error('No trace result returned')
      }

      const parsedTrace = parseTraceResponse(txHash, traceResult as RawTraceCall)
      setTrace(parsedTrace)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to trace transaction'

      // Check for common errors
      if (errorMessage.includes('method not found') || errorMessage.includes('not supported')) {
        setError(new Error('Transaction tracing is not supported by this RPC endpoint. debug_traceTransaction requires an archive node with debug APIs enabled.'))
      } else if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        setError(new Error('Transaction not found. The transaction may not exist or may not be indexed yet.'))
      } else {
        setError(new Error(errorMessage))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const clearTrace = useCallback(() => {
    setTrace(null)
    setError(null)
  }, [])

  return {
    trace,
    internalCalls: trace?.flattenedCalls ?? [],
    loading,
    error,
    traceTransaction,
    clearTrace,
  }
}

/**
 * Hook for lazy loading transaction traces
 * Only fetches trace when explicitly requested
 */
export function useLazyTransactionTrace(txHash: string) {
  const { trace, internalCalls, loading, error, traceTransaction, clearTrace } = useTransactionTrace()
  const [hasBeenRequested, setHasBeenRequested] = useState(false)

  const loadTrace = useCallback(async () => {
    if (!hasBeenRequested) {
      setHasBeenRequested(true)
    }
    await traceTransaction(txHash)
  }, [txHash, hasBeenRequested, traceTransaction])

  return {
    trace,
    internalCalls,
    loading,
    error,
    hasBeenRequested,
    loadTrace,
    clearTrace,
  }
}
