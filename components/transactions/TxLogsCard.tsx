'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { CopyButton } from '@/components/common/CopyButton'
import { FORMATTING } from '@/lib/config/constants'
import { decodeEventLog, formatTokenAmount } from '@/lib/utils/eventDecoder'
import type { Log, DecodedLog } from '@/types/graphql'

// ============================================================
// Sub-Components
// ============================================================

/**
 * Display decoded event parameters in a readable format
 */
function DecodedLogView({ decoded, contractAddress }: { decoded: DecodedLog; contractAddress: string }) {
  return (
    <div className="space-y-3">
      {/* Event Name Badge */}
      <div className="flex items-center gap-2">
        <span className="rounded bg-accent-blue/20 px-2 py-1 font-mono text-xs font-medium text-accent-blue">
          {decoded.eventName}
        </span>
        <span className="font-mono text-xs text-text-muted">
          {decoded.eventSignature}
        </span>
      </div>

      {/* Contract Address */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text-muted">Contract:</span>
        <Link href={`/address/${contractAddress}`} className="font-mono text-accent-blue hover:text-accent-cyan">
          {contractAddress}
        </Link>
        <CopyButton text={contractAddress} size="sm" />
      </div>

      {/* Decoded Parameters */}
      <div className="rounded border border-bg-tertiary bg-bg-primary p-3">
        <Table>
          <TableBody>
            {decoded.params.map((param, i) => (
              <TableRow key={i} className="border-b border-bg-tertiary last:border-b-0">
                <TableCell className="w-1/4 py-2 font-mono text-xs text-text-muted">
                  {param.name}
                  {param.indexed && <span className="ml-1 text-accent-cyan">[idx]</span>}
                </TableCell>
                <TableCell className="w-1/6 py-2 font-mono text-xs text-text-muted">
                  {param.type}
                </TableCell>
                <TableCell className="py-2 font-mono text-xs">
                  <ParamValue param={param} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/**
 * Display a single parameter value with appropriate formatting
 */
function ParamValue({ param }: { param: { name: string; type: string; value: string } }) {
  const { type, value, name } = param

  // Address type - show as link
  if (type === 'address') {
    return (
      <span className="flex items-center gap-1">
        <Link href={`/address/${value}`} className="text-accent-blue hover:text-accent-cyan">
          {value}
        </Link>
        <CopyButton text={value} size="sm" />
      </span>
    )
  }

  // uint256 - check if it looks like a token amount
  if (type === 'uint256' && (name === 'value' || name === 'wad' || name === 'amount')) {
    const formatted = formatTokenAmount(value, FORMATTING.DEFAULT_DECIMALS)
    return (
      <span className="flex items-center gap-2 text-text-primary">
        <span>{formatted}</span>
        <span className="text-text-muted">({value})</span>
        <CopyButton text={value} size="sm" />
      </span>
    )
  }

  // Default display
  return (
    <span className="flex items-center gap-1 text-text-primary">
      {value}
      <CopyButton text={value} size="sm" />
    </span>
  )
}

/**
 * Display raw log data (topics and data)
 */
function RawLogView({ log }: { log: Log }) {
  return (
    <div className="space-y-2 text-xs">
      <div>
        <span className="text-text-muted">Address:</span>
        <Link href={`/address/${log.address}`} className="ml-2 font-mono text-accent-blue hover:text-accent-cyan">
          {log.address}
        </Link>
      </div>
      <div>
        <span className="text-text-muted">Topics:</span>
        <div className="mt-1 space-y-1 font-mono">
          {log.topics.map((topic, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="w-6 text-text-muted">[{i}]</span>
              <span className="break-all text-text-secondary">{topic}</span>
              <CopyButton text={topic} size="sm" />
            </div>
          ))}
        </div>
      </div>
      {log.data && log.data !== '0x' && (
        <div>
          <span className="text-text-muted">Data:</span>
          <div className="mt-1 flex items-start gap-1">
            <div className="max-h-24 flex-1 overflow-auto rounded bg-bg-primary p-2 font-mono text-text-secondary break-all">
              {log.data}
            </div>
            <CopyButton text={log.data} size="sm" />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Single log entry with toggle between decoded and raw views
 */
function LogEntry({ log }: { log: Log }) {
  const [showRaw, setShowRaw] = useState(false)

  // Priority: 1. Backend decoded, 2. Frontend decoded, 3. Raw
  const backendDecoded = log.decoded
  const frontendDecoded = !backendDecoded ? decodeEventLog(log.topics, log.data) : null
  const decoded = backendDecoded ?? frontendDecoded
  const canDecode = decoded !== null
  const isBackendDecoded = backendDecoded !== null && backendDecoded !== undefined

  return (
    <div className="rounded border border-bg-tertiary p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="annotation">LOG #{log.logIndex}</span>
          {canDecode && (
            <span className={`rounded px-1.5 py-0.5 text-xs ${
              isBackendDecoded ? 'bg-success/20 text-success' : 'bg-accent-cyan/20 text-accent-cyan'
            }`}>
              {isBackendDecoded ? 'Decoded' : 'Parsed'}
            </span>
          )}
        </div>
        {canDecode && (
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="font-mono text-xs text-text-muted hover:text-accent-blue transition-colors"
          >
            {showRaw ? '← Decoded' : 'Raw →'}
          </button>
        )}
      </div>

      {canDecode && !showRaw ? (
        <DecodedLogView decoded={decoded} contractAddress={log.address} />
      ) : (
        <RawLogView log={log} />
      )}
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

/**
 * Transaction logs card displaying decoded event logs
 */
export function TxLogsCard({ logs }: { logs: Log[] }) {
  if (!logs || logs.length === 0) { return null }

  return (
    <Card className="mt-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>EVENT LOGS ({logs.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {logs.map((log, index) => (
            <LogEntry key={index} log={log} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
