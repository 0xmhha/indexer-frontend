'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { TransactionTypeBadge } from '@/components/transactions/TransactionTypeBadge'
import { formatHash, formatCurrency, formatNumber } from '@/lib/utils/format'
import { usePendingTransactions } from '@/lib/hooks/useSubscriptions'
import { weiToGwei } from '@/lib/utils/gas'
import { env } from '@/lib/config/env'
import { UI } from '@/lib/config/constants'
import type { Transaction } from '@/types/graphql'

interface AdvancedPendingTransactionsPanelProps {
  maxTransactions?: number
  className?: string
}

interface TransactionFilter {
  type?: number
  fromAddress?: string
  toAddress?: string
  minGasPrice?: number // in Gwei
  maxGasPrice?: number // in Gwei
  minValue?: number // in ETH
  maxValue?: number // in ETH
}

const TRANSACTION_TYPES = [
  { value: -1, label: 'All Types' }, // -1 means no filter
  { value: 0x0, label: 'Legacy (0x0)' },
  { value: 0x1, label: 'Access List (0x1)' },
  { value: 0x2, label: 'EIP-1559 (0x2)' },
  { value: 0x3, label: 'Blob (0x3)' },
  { value: 0x16, label: 'Fee Delegated (0x16)' },
]

/**
 * Advanced Pending Transactions Panel with Filtering
 *
 * Real-time pending transactions viewer with user-configurable filters for
 * transaction type, addresses, gas price, and value.
 *
 * @param maxTransactions - Maximum number of transactions to display (default: 50)
 * @param className - Additional CSS classes
 */
export function AdvancedPendingTransactionsPanel({
  maxTransactions = UI.MAX_VIEWER_ITEMS,
  className,
}: AdvancedPendingTransactionsPanelProps) {
  // Filter state
  const [selectedType, setSelectedType] = useState<number>(-1) // -1 means no filter
  const [fromAddress, setFromAddress] = useState<string>('')
  const [toAddress, setToAddress] = useState<string>('')
  const [minGasPrice, setMinGasPrice] = useState<string>('')
  const [maxGasPrice, setMaxGasPrice] = useState<string>('')
  const [minValue, setMinValue] = useState<string>('')
  const [maxValue, setMaxValue] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<TransactionFilter | undefined>(undefined)

  // Get all pending transactions
  const { pendingTransactions, loading, error } = usePendingTransactions(maxTransactions * 2)

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    if (!activeFilter) return pendingTransactions

    return pendingTransactions.filter((tx: Transaction) => {
      // Type filter
      if (activeFilter.type && tx.type !== activeFilter.type) {
        return false
      }

      // From address filter
      if (activeFilter.fromAddress) {
        const filterAddr = activeFilter.fromAddress.toLowerCase()
        if (!tx.from.toLowerCase().includes(filterAddr)) {
          return false
        }
      }

      // To address filter
      if (activeFilter.toAddress) {
        const filterAddr = activeFilter.toAddress.toLowerCase()
        if (!tx.to || !tx.to.toLowerCase().includes(filterAddr)) {
          return false
        }
      }

      // Gas price filter (use gasPrice for legacy, maxFeePerGas for EIP-1559)
      const txGasPrice = tx.gasPrice || tx.maxFeePerGas
      if (txGasPrice) {
        const gasPriceGwei = weiToGwei(txGasPrice)

        if (activeFilter.minGasPrice !== undefined && gasPriceGwei < activeFilter.minGasPrice) {
          return false
        }

        if (activeFilter.maxGasPrice !== undefined && gasPriceGwei > activeFilter.maxGasPrice) {
          return false
        }
      }

      // Value filter
      const valueEth = Number(tx.value) / 1e18
      if (activeFilter.minValue !== undefined && valueEth < activeFilter.minValue) {
        return false
      }

      if (activeFilter.maxValue !== undefined && valueEth > activeFilter.maxValue) {
        return false
      }

      return true
    })
  }, [pendingTransactions, activeFilter])

  // Apply filters
  const handleApplyFilter = () => {
    const filter: TransactionFilter = {}

    if (selectedType !== -1) {
      filter.type = selectedType
    }

    if (fromAddress.trim()) {
      filter.fromAddress = fromAddress.trim()
    }

    if (toAddress.trim()) {
      filter.toAddress = toAddress.trim()
    }

    if (minGasPrice.trim()) {
      filter.minGasPrice = parseFloat(minGasPrice)
    }

    if (maxGasPrice.trim()) {
      filter.maxGasPrice = parseFloat(maxGasPrice)
    }

    if (minValue.trim()) {
      filter.minValue = parseFloat(minValue)
    }

    if (maxValue.trim()) {
      filter.maxValue = parseFloat(maxValue)
    }

    setActiveFilter(Object.keys(filter).length > 0 ? filter : undefined)
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedType(-1)
    setFromAddress('')
    setToAddress('')
    setMinGasPrice('')
    setMaxGasPrice('')
    setMinValue('')
    setMaxValue('')
    setActiveFilter(undefined)
  }

  // Check if any filters are active
  const hasActiveFilters =
    selectedType !== -1 ||
    fromAddress.trim() !== '' ||
    toAddress.trim() !== '' ||
    minGasPrice.trim() !== '' ||
    maxGasPrice.trim() !== '' ||
    minValue.trim() !== '' ||
    maxValue.trim() !== ''

  return (
    <Card className={className}>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <span>ADVANCED PENDING TRANSACTIONS</span>
          <div className="flex items-center gap-4">
            {!loading && !error && (
              <span className="font-mono text-xs text-text-secondary">
                {filteredTransactions.length} / {pendingTransactions.length} transactions
              </span>
            )}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-2 w-2 rounded-full ${activeFilter ? 'animate-pulse bg-accent-cyan' : 'bg-accent-green animate-pulse'}`}
              />
              <span
                className={`font-mono text-[10px] ${activeFilter ? 'text-accent-cyan' : 'text-accent-green'}`}
              >
                {activeFilter ? 'FILTERED' : 'LIVE'}
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Filter Controls */}
        <div className="mb-6 rounded border border-bg-tertiary bg-bg-secondary p-4">
          <div className="annotation mb-4">FILTERS</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Transaction Type Filter */}
            <div>
              <label htmlFor="txType" className="mb-2 block font-mono text-xs text-text-secondary">
                Transaction Type
              </label>
              <select
                id="txType"
                value={selectedType}
                onChange={(e) => setSelectedType(parseInt(e.target.value, 10))}
                className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary focus:border-accent-blue focus:outline-none"
              >
                {TRANSACTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* From Address Filter */}
            <div>
              <label
                htmlFor="fromAddress"
                className="mb-2 block font-mono text-xs text-text-secondary"
              >
                From Address
              </label>
              <input
                id="fromAddress"
                type="text"
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="0x... (partial match)"
                className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
              />
            </div>

            {/* To Address Filter */}
            <div>
              <label
                htmlFor="toAddress"
                className="mb-2 block font-mono text-xs text-text-secondary"
              >
                To Address
              </label>
              <input
                id="toAddress"
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x... (partial match)"
                className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
              />
            </div>

            {/* Min Gas Price */}
            <div>
              <label
                htmlFor="minGasPrice"
                className="mb-2 block font-mono text-xs text-text-secondary"
              >
                Min Gas Price (Gwei)
              </label>
              <input
                id="minGasPrice"
                type="number"
                value={minGasPrice}
                onChange={(e) => setMinGasPrice(e.target.value)}
                placeholder="0.0"
                min="0"
                step="0.1"
                className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
              />
            </div>

            {/* Max Gas Price */}
            <div>
              <label
                htmlFor="maxGasPrice"
                className="mb-2 block font-mono text-xs text-text-secondary"
              >
                Max Gas Price (Gwei)
              </label>
              <input
                id="maxGasPrice"
                type="number"
                value={maxGasPrice}
                onChange={(e) => setMaxGasPrice(e.target.value)}
                placeholder="∞"
                min="0"
                step="0.1"
                className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
              />
            </div>

            {/* Min Value */}
            <div>
              <label htmlFor="minValue" className="mb-2 block font-mono text-xs text-text-secondary">
                Min Value ({env.currencySymbol})
              </label>
              <input
                id="minValue"
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                placeholder="0.0"
                min="0"
                step="0.01"
                className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
              />
            </div>

            {/* Max Value */}
            <div>
              <label htmlFor="maxValue" className="mb-2 block font-mono text-xs text-text-secondary">
                Max Value ({env.currencySymbol})
              </label>
              <input
                id="maxValue"
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="∞"
                min="0"
                step="0.01"
                className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleApplyFilter}
              disabled={!hasActiveFilters}
              className="rounded border border-accent-blue bg-accent-blue/10 px-4 py-2 font-mono text-xs text-accent-blue transition-colors hover:bg-accent-blue/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              APPLY FILTERS
            </button>
            <button
              onClick={handleClearFilters}
              disabled={!hasActiveFilters && !activeFilter}
              className="rounded border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue disabled:cursor-not-allowed disabled:opacity-50"
            >
              CLEAR ALL
            </button>
          </div>

          {/* Active Filter Info */}
          {activeFilter && (
            <div className="mt-4 rounded border border-accent-cyan/30 bg-accent-cyan/5 p-3">
              <div className="mb-2 font-mono text-xs font-bold text-accent-cyan">ACTIVE FILTERS:</div>
              <div className="space-y-1 font-mono text-xs text-text-secondary">
                {activeFilter.type !== undefined && (
                  <div>
                    • Type:{' '}
                    {TRANSACTION_TYPES.find((t) => t.value === activeFilter.type)?.label || 'Unknown'}
                  </div>
                )}
                {activeFilter.fromAddress && <div>• From: {activeFilter.fromAddress}</div>}
                {activeFilter.toAddress && <div>• To: {activeFilter.toAddress}</div>}
                {activeFilter.minGasPrice !== undefined && (
                  <div>• Min Gas Price: {activeFilter.minGasPrice} Gwei</div>
                )}
                {activeFilter.maxGasPrice !== undefined && (
                  <div>• Max Gas Price: {activeFilter.maxGasPrice} Gwei</div>
                )}
                {activeFilter.minValue !== undefined && (
                  <div>
                    • Min Value: {activeFilter.minValue} {env.currencySymbol}
                  </div>
                )}
                {activeFilter.maxValue !== undefined && (
                  <div>
                    • Max Value: {activeFilter.maxValue} {env.currencySymbol}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Transactions Display */}
        {loading && filteredTransactions.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <ErrorDisplay
            title="Failed to load pending transactions"
            message={error.message || 'WebSocket connection error'}
          />
        ) : filteredTransactions.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="font-mono text-sm text-text-muted">No transactions found</div>
              <div className="mt-2 font-mono text-xs text-text-muted">
                {activeFilter ? 'Try adjusting your filters' : 'Waiting for transactions...'}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TX HASH</TableHead>
                  <TableHead>FROM</TableHead>
                  <TableHead>TO</TableHead>
                  <TableHead className="text-right">VALUE</TableHead>
                  <TableHead>TYPE</TableHead>
                  <TableHead className="text-right">GAS PRICE</TableHead>
                  <TableHead className="text-right">NONCE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.slice(0, maxTransactions).map((tx: Transaction) => {
                  const gasPrice = tx.gasPrice || tx.maxFeePerGas
                  return (
                    <TableRow key={`${tx.hash}-${tx.nonce}`} className="animate-fade-in">
                      <TableCell>
                        <Link
                          href={`/tx/${tx.hash}`}
                          className="font-mono text-accent-blue hover:text-accent-cyan"
                        >
                          {formatHash(tx.hash)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/address/${tx.from}`}
                          className="font-mono text-accent-blue hover:text-accent-cyan"
                        >
                          {formatHash(tx.from, true)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {tx.to ? (
                          <Link
                            href={`/address/${tx.to}`}
                            className="font-mono text-accent-blue hover:text-accent-cyan"
                          >
                            {formatHash(tx.to, true)}
                          </Link>
                        ) : (
                          <span className="font-mono text-text-muted">[Contract]</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(tx.value, env.currencySymbol)}
                      </TableCell>
                      <TableCell>
                        <TransactionTypeBadge type={tx.type} />
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-text-secondary">
                        {gasPrice ? `${weiToGwei(gasPrice).toFixed(2)} Gwei` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(tx.nonce)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
