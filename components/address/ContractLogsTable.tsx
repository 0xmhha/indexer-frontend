'use client'

import Link from 'next/link'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { formatHash, formatNumber } from '@/lib/utils/format'
import { decodeEventLog, type DecodedLog } from '@/lib/utils/eventDecoder'
import type { Log } from '@/types/graphql'

interface ContractLogsTableProps {
  logs: Log[]
  loading?: boolean
  showAddress?: boolean
}

/**
 * Format event parameter value for display
 */
function formatParamValue(value: string, type: string): string {
  if (type === 'address') {
    return formatHash(value, true)
  }
  if (type === 'uint256' || type === 'int256') {
    // Format large numbers with commas
    try {
      return formatNumber(BigInt(value))
    } catch {
      return value
    }
  }
  return value
}

/**
 * Render decoded event parameters
 */
function DecodedParams({ decoded }: { decoded: DecodedLog }) {
  return (
    <div className="space-y-1">
      {decoded.params.map((param, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="text-text-muted">{param.name}:</span>
          {param.type === 'address' ? (
            <Link
              href={`/address/${param.value}`}
              className="font-mono text-accent-blue hover:text-accent-cyan"
            >
              {formatParamValue(param.value, param.type)}
            </Link>
          ) : (
            <span className="font-mono text-text-primary">
              {formatParamValue(param.value, param.type)}
            </span>
          )}
          {param.indexed && (
            <span className="rounded bg-bg-tertiary px-1 text-xs text-text-muted">indexed</span>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Render raw log data when event cannot be decoded
 */
function RawLogData({ log }: { log: Log }) {
  return (
    <div className="space-y-1">
      <div className="text-xs">
        <span className="text-text-muted">Topics: </span>
        <span className="font-mono text-text-secondary">{log.topics.length}</span>
      </div>
      {log.topics[0] && (
        <div className="text-xs">
          <span className="text-text-muted">Signature: </span>
          <span className="font-mono text-text-secondary">{formatHash(log.topics[0], true)}</span>
        </div>
      )}
      {log.data && log.data !== '0x' && (
        <div className="text-xs">
          <span className="text-text-muted">Data: </span>
          <span className="font-mono text-text-secondary">
            {log.data.length > 66 ? `${log.data.slice(0, 66)}...` : log.data}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Event name badge component
 */
function EventBadge({ name, signature }: { name: string; signature?: string }) {
  return (
    <div className="flex flex-col">
      <span
        className="rounded bg-accent-cyan/20 px-2 py-0.5 font-mono text-xs font-medium text-accent-cyan"
        title={signature}
      >
        {name}
      </span>
    </div>
  )
}

/**
 * Contract event logs table component
 */
export function ContractLogsTable({ logs, loading, showAddress = false }: ContractLogsTableProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="font-mono text-sm text-text-muted">Loading event logs...</div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="font-mono text-sm text-text-muted">No event logs found</div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>TX HASH</TableHead>
          <TableHead>BLOCK</TableHead>
          {showAddress && <TableHead>CONTRACT</TableHead>}
          <TableHead>EVENT</TableHead>
          <TableHead>PARAMETERS</TableHead>
          <TableHead className="text-right">LOG INDEX</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log, index) => {
          // Try to decode the event
          const decoded = decodeEventLog(log.topics, log.data)
          const uniqueKey = `${log.transactionHash}-${log.logIndex}-${index}`

          return (
            <TableRow key={uniqueKey}>
              <TableCell>
                <Link
                  href={`/tx/${log.transactionHash}`}
                  className="font-mono text-accent-blue hover:text-accent-cyan"
                >
                  {formatHash(log.transactionHash)}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/block/${log.blockNumber}`}
                  className="font-mono text-accent-blue hover:text-accent-cyan"
                >
                  {formatNumber(log.blockNumber)}
                </Link>
              </TableCell>
              {showAddress && (
                <TableCell>
                  <Link
                    href={`/address/${log.address}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {formatHash(log.address)}
                  </Link>
                </TableCell>
              )}
              <TableCell>
                {decoded ? (
                  <EventBadge name={decoded.eventName} signature={decoded.eventSignature} />
                ) : (
                  <span className="font-mono text-xs text-text-muted">Unknown</span>
                )}
              </TableCell>
              <TableCell>
                {decoded ? <DecodedParams decoded={decoded} /> : <RawLogData log={log} />}
              </TableCell>
              <TableCell className="text-right font-mono">{log.logIndex}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
