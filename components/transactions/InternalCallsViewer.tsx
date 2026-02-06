'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useInternalTransactionsRPCLazy, type InternalTransactionRPC } from '@/lib/hooks/useRpcProxy'
import { formatHash, formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'

// ============================================================================
// Types
// ============================================================================

interface InternalCallsViewerProps {
  txHash: string
}

// Unified internal call type for display
interface DisplayInternalCall {
  type: string
  from: string
  to: string | null
  value: bigint
  error: string | null
  depth: number
}

/**
 * Transform InternalTransactionRPC to DisplayInternalCall
 */
function transformToDisplayCall(tx: InternalTransactionRPC): DisplayInternalCall {
  return {
    type: tx.type,
    from: tx.from,
    to: tx.to || null,
    value: BigInt(tx.value || '0'),
    error: tx.error || null,
    depth: tx.depth,
  }
}

// Indentation per nesting level (px)
const INDENT_PER_LEVEL = 16

// ============================================================================
// Sub-Components
// ============================================================================

function CallTypeTag({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    CALL: 'bg-accent-blue/20 text-accent-blue',
    DELEGATECALL: 'bg-accent-cyan/20 text-accent-cyan',
    STATICCALL: 'bg-accent-green/20 text-accent-green',
    CREATE: 'bg-accent-magenta/20 text-accent-magenta',
    CREATE2: 'bg-accent-magenta/20 text-accent-magenta',
    SELFDESTRUCT: 'bg-error/20 text-error',
  }

  const colorClass = colorMap[type.toUpperCase()] ?? 'bg-text-muted/20 text-text-muted'

  return (
    <span className={`rounded px-2 py-0.5 font-mono text-xs ${colorClass}`}>
      {type.toUpperCase()}
    </span>
  )
}

function InternalCallRow({ call, currentAddress }: { call: DisplayInternalCall; currentAddress?: string }) {
  const indent = call.depth * INDENT_PER_LEVEL

  return (
    <div
      className={`flex items-center gap-6 border-b border-bg-tertiary px-4 py-3 ${
        call.error ? 'bg-error/5' : ''
      }`}
      style={{ paddingLeft: `${INDENT_PER_LEVEL + indent}px` }}
    >
      {/* Depth indicator */}
      {call.depth > 0 && (
        <div className="flex items-center text-text-muted">
          {'└'.padStart(call.depth, '│')}
        </div>
      )}

      {/* Call type */}
      <div className="w-28 flex-shrink-0">
        <CallTypeTag type={call.type} />
      </div>

      {/* From */}
      <div className="w-36 flex-shrink-0 font-mono text-xs">
        {call.from === currentAddress ? (
          <span className="text-text-muted">[Current]</span>
        ) : (
          <Link
            href={`/address/${call.from}`}
            className="text-accent-blue hover:text-accent-cyan"
          >
            {formatHash(call.from, true)}
          </Link>
        )}
      </div>

      {/* Arrow */}
      <div className="w-6 flex-shrink-0 text-center text-text-muted">→</div>

      {/* To */}
      <div className="w-36 flex-shrink-0 font-mono text-xs">
        {call.to === null ? (
          <span className="text-accent-magenta">[Create]</span>
        ) : call.to === currentAddress ? (
          <span className="text-text-muted">[Current]</span>
        ) : (
          <Link
            href={`/address/${call.to}`}
            className="text-accent-blue hover:text-accent-cyan"
          >
            {formatHash(call.to, true)}
          </Link>
        )}
      </div>

      {/* Value */}
      <div className="w-32 flex-shrink-0 text-right font-mono text-xs">
        {call.value > BigInt(0) ? (
          <span className="text-accent-green">
            {formatCurrency(call.value, env.currencySymbol)}
          </span>
        ) : (
          <span className="text-text-muted">0</span>
        )}
      </div>

      {/* Error indicator */}
      {call.error && (
        <div className="flex-1">
          <span className="rounded bg-error/20 px-2 py-0.5 font-mono text-xs text-error">
            {call.error}
          </span>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-text-muted">
        No internal calls found in this transaction
      </p>
    </div>
  )
}

function ErrorState({ error }: { error: Error | { message: string } }) {
  return (
    <div className="py-8 text-center">
      <p className="mb-2 text-sm text-error">Failed to load internal calls</p>
      <p className="text-xs text-text-muted">{error.message}</p>
    </div>
  )
}

function NotLoadedState({ onLoad, loading }: { onLoad: () => void; loading: boolean }) {
  return (
    <div className="py-8 text-center">
      <p className="mb-4 text-sm text-text-muted">
        Internal calls show all nested contract interactions within this transaction.
        <br />
        This uses the RPC Proxy to trace the transaction execution.
      </p>
      <Button onClick={onLoad} disabled={loading}>
        {loading ? (
          <>
            <LoadingSpinner className="mr-2" size="sm" />
            Tracing Transaction...
          </>
        ) : (
          'Load Internal Calls'
        )}
      </Button>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function InternalCallsViewer({ txHash }: InternalCallsViewerProps) {
  const [expanded, setExpanded] = useState(false)
  const [hasBeenRequested, setHasBeenRequested] = useState(false)
  const { loadTrace: loadTraceRPC, internalTransactions, loading, error } = useInternalTransactionsRPCLazy()

  // Transform RPC response to display format
  const internalCalls: DisplayInternalCall[] = internalTransactions.map(transformToDisplayCall)

  const displayedCalls = expanded ? internalCalls : internalCalls.slice(0, 10)
  const hasMoreCalls = internalCalls.length > 10

  const loadTrace = useCallback(async () => {
    setHasBeenRequested(true)
    await loadTraceRPC(txHash)
  }, [txHash, loadTraceRPC])

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>INTERNAL CALLS</span>
            {internalCalls.length > 0 && (
              <span className="rounded bg-bg-tertiary px-2 py-0.5 text-xs text-text-muted">
                {internalCalls.length} calls
              </span>
            )}
          </div>
          <span className="text-xs font-normal text-text-muted">
            via RPC Proxy
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!hasBeenRequested ? (
          <NotLoadedState onLoad={loadTrace} loading={loading} />
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2 text-sm text-text-muted">Tracing transaction...</span>
          </div>
        ) : error ? (
          <ErrorState error={error} />
        ) : internalCalls.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-6 border-b border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-xs text-text-muted">
              <div className="w-28 flex-shrink-0">TYPE</div>
              <div className="w-36 flex-shrink-0">FROM</div>
              <div className="w-6 flex-shrink-0 text-center"></div>
              <div className="w-36 flex-shrink-0">TO</div>
              <div className="w-32 flex-shrink-0 text-right">VALUE</div>
            </div>

            {/* Calls list */}
            <div className="max-h-96 overflow-y-auto">
              {displayedCalls.map((call, index) => (
                <InternalCallRow key={index} call={call} />
              ))}
            </div>

            {/* Show more button */}
            {hasMoreCalls && (
              <div className="border-t border-bg-tertiary p-4 text-center">
                <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
                  {expanded
                    ? 'Show Less'
                    : `Show All ${internalCalls.length} Calls`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
