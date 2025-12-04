'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { TransactionTypeBadge } from '@/components/transactions/TransactionTypeBadge'
import { CopyButton } from '@/components/common/CopyButton'
import { formatNumber, formatCurrency, formatGasPrice } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import { decodeEventLog, formatTokenAmount } from '@/lib/utils/eventDecoder'
import type { Log, TransformedFeePayerSignature, DecodedLog } from '@/types/graphql'

// ============================================================
// Types
// ============================================================

interface TransactionData {
  hash: string
  blockNumber: string
  blockHash: string
  transactionIndex: number
  from: string
  to: string | null
  value: string
  gas: string
  gasPrice: string
  maxFeePerGas?: string | null
  maxPriorityFeePerGas?: string | null
  type: number
  nonce: number
  chainId?: number | null
  input: string
  feePayer?: string | null
  feePayerSignatures?: TransformedFeePayerSignature[] | null
  receipt?: {
    status: number | string  // 1 = success, 0 = failed (may be number or string from GraphQL)
    gasUsed: string
    contractAddress?: string | null
    logs?: Log[]
  } | null
}

// ============================================================
// Status Badge
// ============================================================

function StatusBadge({ status }: { status: string }) {
  const isSuccess = status === 'Success'
  const isPending = status === 'Pending'

  const getBgColor = () => {
    if (isSuccess) { return 'bg-success' }
    if (isPending) { return 'bg-warning animate-pulse' }
    return 'bg-error'
  }

  const getTextColor = () => {
    if (isSuccess) { return 'text-success' }
    if (isPending) { return 'text-warning' }
    return 'text-error'
  }

  return (
    <div className="inline-flex items-center gap-2 rounded border px-3 py-1">
      <div className={`h-2 w-2 rounded-full ${getBgColor()}`} />
      <span className={`font-mono text-xs ${getTextColor()}`}>
        {status.toUpperCase()}
      </span>
    </div>
  )
}

// ============================================================
// Transaction Header
// ============================================================

export function TxHeader({
  hash,
  status,
  type,
}: {
  hash: string
  status: string
  type: number
}) {
  return (
    <div className="mb-8">
      <div className="annotation mb-2">TRANSACTION DETAILS</div>
      <div className="mb-4 flex items-center gap-2">
        <h1 className="break-all font-mono text-xl font-bold text-accent-blue">{hash}</h1>
        <CopyButton text={hash} size="md" />
      </div>
      <div className="flex flex-wrap gap-3">
        <StatusBadge status={status} />
        <TransactionTypeBadge type={type} />
      </div>
    </div>
  )
}

// ============================================================
// Transaction Information Card
// ============================================================

export function TxInfoCard({ tx, status }: { tx: TransactionData; status: string }) {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>TRANSACTION INFORMATION</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">Status</TableCell>
              <TableCell
                className={
                  status === 'Success'
                    ? 'text-success'
                    : status === 'Pending'
                      ? 'text-warning'
                      : 'text-error'
                }
              >
                {status}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Block</TableCell>
              <TableCell>
                <Link
                  href={`/block/${tx.blockNumber}`}
                  className="font-mono text-accent-blue hover:text-accent-cyan"
                >
                  #{formatNumber(BigInt(tx.blockNumber))}
                </Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Block Hash</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1">
                  <span className="font-mono text-accent-blue">{tx.blockHash}</span>
                  <CopyButton text={tx.blockHash} />
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Transaction Index</TableCell>
              <TableCell className="font-mono">{tx.transactionIndex}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">From</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1">
                  <Link
                    href={`/address/${tx.from}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {tx.from}
                  </Link>
                  <CopyButton text={tx.from} />
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">To</TableCell>
              <TableCell>
                {tx.to ? (
                  <span className="inline-flex items-center gap-1">
                    <Link
                      href={`/address/${tx.to}`}
                      className="font-mono text-accent-blue hover:text-accent-cyan"
                    >
                      {tx.to}
                    </Link>
                    <CopyButton text={tx.to} />
                  </span>
                ) : (
                  <span className="font-mono text-text-muted">[Contract Creation]</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Value</TableCell>
              <TableCell className="font-mono font-bold text-accent-blue">
                {formatCurrency(BigInt(tx.value), env.currencySymbol)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Gas & Fees Card
// ============================================================

interface ParsedReceipt {
  gasUsed: string
  gasUsedNumber: number
  effectiveGasPrice: string
  effectiveGasPriceBigInt: bigint
  txCostWei: bigint
  cumulativeGasUsed: string
}

export function TxGasCard({
  tx,
  receipt,
}: {
  tx: TransactionData
  receipt?: ParsedReceipt | null
}) {
  // Use receipt from separate query if available, fallback to embedded receipt
  const gasUsed = receipt?.gasUsed ?? tx.receipt?.gasUsed
  const effectiveGasPrice = receipt?.effectiveGasPrice

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>GAS & FEES</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">Gas Used</TableCell>
              <TableCell className="font-mono">
                {gasUsed ? formatNumber(BigInt(gasUsed)) : 'Pending'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Gas Limit</TableCell>
              <TableCell className="font-mono">{formatNumber(BigInt(tx.gas))}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Gas Price</TableCell>
              <TableCell className="font-mono">{formatGasPrice(tx.gasPrice)}</TableCell>
            </TableRow>
            {effectiveGasPrice && (
              <TableRow>
                <TableCell className="font-bold">Effective Gas Price</TableCell>
                <TableCell className="font-mono">{formatGasPrice(effectiveGasPrice)}</TableCell>
              </TableRow>
            )}
            {tx.maxFeePerGas && (
              <>
                <TableRow>
                  <TableCell className="font-bold">Max Fee Per Gas</TableCell>
                  <TableCell className="font-mono">{formatGasPrice(tx.maxFeePerGas)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Max Priority Fee Per Gas</TableCell>
                  <TableCell className="font-mono">
                    {formatGasPrice(tx.maxPriorityFeePerGas ?? '0')}
                  </TableCell>
                </TableRow>
              </>
            )}
            {receipt?.txCostWei !== undefined && (
              <TableRow>
                <TableCell className="font-bold">Transaction Fee</TableCell>
                <TableCell className="font-mono font-bold text-accent-orange">
                  {formatCurrency(receipt.txCostWei, env.currencySymbol)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Additional Details Card
// ============================================================

export function TxDetailsCard({ tx }: { tx: TransactionData }) {
  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>ADDITIONAL DETAILS</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">Type</TableCell>
              <TableCell>
                <TransactionTypeBadge type={tx.type} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Nonce</TableCell>
              <TableCell className="font-mono">{tx.nonce}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Chain ID</TableCell>
              <TableCell className="font-mono">{tx.chainId ?? 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Input Data</TableCell>
              <TableCell>
                <div className="max-h-32 overflow-auto rounded bg-bg-primary p-2 font-mono text-xs">
                  {tx.input || '0x'}
                </div>
              </TableCell>
            </TableRow>
            {tx.receipt?.contractAddress && (
              <TableRow>
                <TableCell className="font-bold">Contract Address</TableCell>
                <TableCell>
                  <Link
                    href={`/address/${tx.receipt.contractAddress}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {tx.receipt.contractAddress}
                  </Link>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Fee Delegation Card
// ============================================================

function SignatureDisplay({ signature, index }: { signature: TransformedFeePayerSignature; index: number }) {
  return (
    <div className="rounded border border-bg-tertiary p-2">
      <div className="annotation mb-1">SIGNATURE #{index + 1}</div>
      <div className="space-y-1 font-mono text-xs">
        <div><span className="text-text-muted">v:</span> {signature.v}</div>
        <div className="break-all"><span className="text-text-muted">r:</span> {signature.r}</div>
        <div className="break-all"><span className="text-text-muted">s:</span> {signature.s}</div>
      </div>
    </div>
  )
}

export function TxFeeDelegationCard({
  feePayer,
  signatures,
}: {
  feePayer: string | null | undefined
  signatures: TransformedFeePayerSignature[] | null | undefined
}) {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>FEE DELEGATION</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">Fee Payer</TableCell>
              <TableCell>
                {feePayer ? (
                  <Link
                    href={`/address/${feePayer}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {feePayer}
                  </Link>
                ) : (
                  <span className="font-mono text-text-muted">Not available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Fee Payer Signatures</TableCell>
              <TableCell>
                {signatures && signatures.length > 0 ? (
                  <div className="space-y-2">
                    {signatures.map((sig, idx) => (
                      <SignatureDisplay key={`${sig.r}-${idx}`} signature={sig} index={idx} />
                    ))}
                  </div>
                ) : (
                  <span className="font-mono text-text-muted">No signatures</span>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Receipt Card
// ============================================================

interface FullReceipt extends ParsedReceipt {
  transactionHash: string
  blockNumber: string
  blockHash: string
  transactionIndex: number
  status: number
  contractAddress: string | null
  isSuccess: boolean
  isFailed: boolean
  logsBloom?: string
}

export function TxReceiptCard({ receipt }: { receipt: FullReceipt }) {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>RECEIPT</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">Status</TableCell>
              <TableCell>
                <span
                  className={`font-mono font-bold ${receipt.isSuccess ? 'text-success' : 'text-error'}`}
                >
                  {receipt.isSuccess ? 'Success (1)' : 'Failed (0)'}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Block Number</TableCell>
              <TableCell>
                <Link
                  href={`/block/${receipt.blockNumber}`}
                  className="font-mono text-accent-blue hover:text-accent-cyan"
                >
                  #{formatNumber(BigInt(receipt.blockNumber))}
                </Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Transaction Index</TableCell>
              <TableCell className="font-mono">{receipt.transactionIndex}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Gas Used</TableCell>
              <TableCell className="font-mono">
                {formatNumber(BigInt(receipt.gasUsed))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Cumulative Gas Used</TableCell>
              <TableCell className="font-mono">
                {formatNumber(BigInt(receipt.cumulativeGasUsed))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Effective Gas Price</TableCell>
              <TableCell className="font-mono">
                {formatGasPrice(receipt.effectiveGasPrice)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Transaction Fee</TableCell>
              <TableCell className="font-mono font-bold text-accent-orange">
                {formatCurrency(receipt.txCostWei, env.currencySymbol)}
              </TableCell>
            </TableRow>
            {receipt.contractAddress && (
              <TableRow>
                <TableCell className="font-bold">Contract Created</TableCell>
                <TableCell>
                  <Link
                    href={`/address/${receipt.contractAddress}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {receipt.contractAddress}
                  </Link>
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="font-bold">Block Hash</TableCell>
              <TableCell className="font-mono text-xs text-text-secondary break-all">
                {receipt.blockHash}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Logs Card
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
        <Link
          href={`/address/${contractAddress}`}
          className="font-mono text-accent-blue hover:text-accent-cyan"
        >
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
                  {param.indexed && (
                    <span className="ml-1 text-accent-cyan">[idx]</span>
                  )}
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
        <Link
          href={`/address/${value}`}
          className="text-accent-blue hover:text-accent-cyan"
        >
          {value}
        </Link>
        <CopyButton text={value} size="sm" />
      </span>
    )
  }

  // uint256 - check if it looks like a token amount
  if (type === 'uint256' && (name === 'value' || name === 'wad' || name === 'amount')) {
    const formatted = formatTokenAmount(value, 18)
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
        <Link
          href={`/address/${log.address}`}
          className="ml-2 font-mono text-accent-blue hover:text-accent-cyan"
        >
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
              isBackendDecoded
                ? 'bg-success/20 text-success'
                : 'bg-accent-cyan/20 text-accent-cyan'
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

export function TxLogsCard({ logs }: { logs: Log[] }) {
  if (!logs || logs.length === 0) {return null}

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
