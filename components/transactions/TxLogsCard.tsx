'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { CopyButton } from '@/components/common/CopyButton'
import { AddressLink } from '@/components/common/AddressLink'
import { useContractDetection } from '@/lib/hooks/useContractDetection'
import { FORMATTING } from '@/lib/config/constants'
import { decodeEventLog, formatTokenAmount } from '@/lib/utils/eventDecoder'
import type { Log, DecodedLog } from '@/types/graphql'

// ============================================================
// Sub-Components
// ============================================================

/**
 * Display decoded event parameters in a readable format
 */
function DecodedLogView({
  decoded,
  contractAddress,
  contractMap,
}: {
  decoded: DecodedLog
  contractAddress: string
  contractMap: Map<string, boolean>
}) {
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
        <AddressLink
          address={contractAddress}
          truncate={false}
          isContract={contractMap.get(contractAddress.toLowerCase())}
        />
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
                  <ParamValue param={param} contractMap={contractMap} />
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
function ParamValue({
  param,
  contractMap,
}: {
  param: { name: string; type: string; value: string }
  contractMap: Map<string, boolean>
}) {
  const { type, value, name } = param

  // Address type - show as link with contract icon
  if (type === 'address') {
    return (
      <span className="flex items-center gap-1">
        <AddressLink
          address={value}
          truncate={false}
          isContract={contractMap.get(value.toLowerCase())}
        />
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
function RawLogView({
  log,
  contractMap,
}: {
  log: Log
  contractMap: Map<string, boolean>
}) {
  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center gap-1">
        <span className="text-text-muted">Address:</span>
        <AddressLink
          address={log.address}
          truncate={false}
          isContract={contractMap.get(log.address.toLowerCase())}
          className="ml-1"
        />
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
            <div className="max-h-24 flex-1 overflow-auto break-all rounded bg-bg-primary p-2 font-mono text-text-secondary">
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
function LogEntry({
  log,
  index,
  contractMap,
}: {
  log: Log
  index: number
  contractMap: Map<string, boolean>
}) {
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
          <span className="annotation">LOG #{index}</span>
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
            className="font-mono text-xs text-text-muted transition-colors hover:text-accent-blue"
          >
            {showRaw ? '\u2190 Decoded' : 'Raw \u2192'}
          </button>
        )}
      </div>

      {canDecode && !showRaw ? (
        <DecodedLogView decoded={decoded} contractAddress={log.address} contractMap={contractMap} />
      ) : (
        <RawLogView log={log} contractMap={contractMap} />
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
  // Collect all unique addresses from logs (contract addresses + address-type params)
  const allAddresses = useMemo(() => {
    const set = new Set<string>()
    if (!logs) return []
    for (const log of logs) {
      set.add(log.address)
      // Also collect address-type param values from decoded logs
      const decoded = log.decoded
      if (decoded) {
        for (const param of decoded.params) {
          if (param.type === 'address' && param.value) {
            set.add(param.value)
          }
        }
      }
    }
    return [...set]
  }, [logs])

  const contractMap = useContractDetection(allAddresses)

  if (!logs || logs.length === 0) { return null }

  return (
    <Card className="mt-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>EVENT LOGS ({logs.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {logs.map((log, index) => (
            <LogEntry key={index} log={log} index={index} contractMap={contractMap} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
