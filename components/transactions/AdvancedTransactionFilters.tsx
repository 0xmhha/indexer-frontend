'use client'

import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

/**
 * EIP Transaction Types for filtering
 */
export const TX_TYPE_OPTIONS = [
  { value: -1, label: 'All Types' },
  { value: 0, label: 'Legacy (Type 0)' },
  { value: 1, label: 'Access List (Type 1)' },
  { value: 2, label: 'EIP-1559 (Type 2)' },
  { value: 3, label: 'Blob (Type 3)' },
  { value: 4, label: 'SetCode (Type 4)' },
] as const

/**
 * Quick filter presets for common use cases
 */
export const QUICK_FILTERS = [
  { id: 'contract-calls', label: 'Contract Calls', icon: '📜', description: 'Transactions calling contracts' },
  { id: 'contract-deploy', label: 'Deployments', icon: '🚀', description: 'Contract creation transactions' },
  { id: 'fee-delegated', label: 'Fee Delegated', icon: '💳', description: 'Sponsored transactions' },
  { id: 'high-value', label: 'High Value', icon: '💰', description: 'Transactions > 1 ETH' },
  { id: 'failed', label: 'Failed', icon: '❌', description: 'Reverted transactions' },
  { id: 'eip-7702', label: 'EIP-7702', icon: '🔐', description: 'SetCode transactions' },
] as const

type QuickFilterId = typeof QUICK_FILTERS[number]['id']

/**
 * Advanced filter values with more options
 */
export interface AdvancedTransactionFilterValues {
  // Basic filters
  fromBlock: string
  toBlock: string
  minValue: string
  maxValue: string

  // Direction filter
  direction: 'all' | 'sent' | 'received'

  // Status filter
  status: 'all' | 'success' | 'failed' | 'pending'

  // EIP transaction type
  eipType: number // -1 for all

  // Contract interaction
  contractInteraction: 'all' | 'contract-call' | 'contract-deploy' | 'transfer'

  // Fee delegation
  feeDelegated: 'all' | 'yes' | 'no'

  // Address filters
  fromAddress: string
  toAddress: string

  // Method/Function selector
  methodId: string

  // Gas usage range
  minGasUsed: string
  maxGasUsed: string

  // Time-based (for UI convenience)
  timeRange: 'all' | '1h' | '24h' | '7d' | '30d' | 'custom'
}

interface AdvancedTransactionFiltersProps {
  onApply: (filters: AdvancedTransactionFilterValues) => void
  onReset: () => void
  initialValues?: Partial<AdvancedTransactionFilterValues>
  isLoading?: boolean
  className?: string
}

const defaultFilters: AdvancedTransactionFilterValues = {
  fromBlock: '',
  toBlock: '',
  minValue: '',
  maxValue: '',
  direction: 'all',
  status: 'all',
  eipType: -1,
  contractInteraction: 'all',
  feeDelegated: 'all',
  fromAddress: '',
  toAddress: '',
  methodId: '',
  minGasUsed: '',
  maxGasUsed: '',
  timeRange: 'all',
}

/**
 * Advanced Transaction Filters Component
 *
 * Enhanced filtering capabilities for transaction lists including:
 * - EIP transaction type filtering
 * - Fee delegation filtering
 * - Contract interaction filtering
 * - Quick filter presets
 * - Address-based filtering
 * - Gas usage range
 */
export function AdvancedTransactionFilters({
  onApply,
  onReset,
  initialValues,
  isLoading = false,
  className,
}: AdvancedTransactionFiltersProps) {
  const [filters, setFilters] = useState<AdvancedTransactionFilterValues>({
    ...defaultFilters,
    ...initialValues,
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterId | null>(null)

  const handleChange = useCallback(<K extends keyof AdvancedTransactionFilterValues>(
    field: K,
    value: AdvancedTransactionFilterValues[K]
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
    setActiveQuickFilter(null) // Clear quick filter when manually changing
  }, [])

  const handleApply = useCallback(() => {
    onApply(filters)
  }, [filters, onApply])

  const handleReset = useCallback(() => {
    setFilters(defaultFilters)
    setActiveQuickFilter(null)
    onReset()
  }, [onReset])

  const applyQuickFilter = useCallback((filterId: QuickFilterId) => {
    let newFilters = { ...defaultFilters }

    switch (filterId) {
      case 'contract-calls':
        newFilters.contractInteraction = 'contract-call'
        break
      case 'contract-deploy':
        newFilters.contractInteraction = 'contract-deploy'
        break
      case 'fee-delegated':
        newFilters.feeDelegated = 'yes'
        break
      case 'high-value':
        newFilters.minValue = '1000000000000000000' // 1 ETH in wei
        break
      case 'failed':
        newFilters.status = 'failed'
        break
      case 'eip-7702':
        newFilters.eipType = 4
        break
    }

    setFilters(newFilters)
    setActiveQuickFilter(filterId)
    onApply(newFilters)
  }, [onApply])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.fromBlock !== '' ||
      filters.toBlock !== '' ||
      filters.minValue !== '' ||
      filters.maxValue !== '' ||
      filters.direction !== 'all' ||
      filters.status !== 'all' ||
      filters.eipType !== -1 ||
      filters.contractInteraction !== 'all' ||
      filters.feeDelegated !== 'all' ||
      filters.fromAddress !== '' ||
      filters.toAddress !== '' ||
      filters.methodId !== '' ||
      filters.minGasUsed !== '' ||
      filters.maxGasUsed !== '' ||
      filters.timeRange !== 'all'
    )
  }, [filters])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.fromBlock || filters.toBlock) count++
    if (filters.minValue || filters.maxValue) count++
    if (filters.direction !== 'all') count++
    if (filters.status !== 'all') count++
    if (filters.eipType !== -1) count++
    if (filters.contractInteraction !== 'all') count++
    if (filters.feeDelegated !== 'all') count++
    if (filters.fromAddress) count++
    if (filters.toAddress) count++
    if (filters.methodId) count++
    if (filters.minGasUsed || filters.maxGasUsed) count++
    if (filters.timeRange !== 'all') count++
    return count
  }, [filters])

  return (
    <Card className={cn('mb-6', className)}>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:text-accent-blue"
          >
            <span>ADVANCED FILTERS</span>
            <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
            {hasActiveFilters && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-blue text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              RESET ALL
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6">
          {/* Quick Filters */}
          <div className="mb-6">
            <label className="mb-2 block font-mono text-xs uppercase text-text-secondary">
              Quick Filters
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_FILTERS.map((qf) => (
                <button
                  key={qf.id}
                  onClick={() => applyQuickFilter(qf.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded border px-3 py-1.5 font-mono text-xs transition-colors',
                    activeQuickFilter === qf.id
                      ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                      : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-blue/50'
                  )}
                  title={qf.description}
                >
                  <span>{qf.icon}</span>
                  <span>{qf.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Block Range */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                Block Range
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="From"
                  value={filters.fromBlock}
                  onChange={(e) => handleChange('fromBlock', e.target.value)}
                  min="0"
                />
                <Input
                  type="number"
                  placeholder="To"
                  value={filters.toBlock}
                  onChange={(e) => handleChange('toBlock', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* Value Range */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                Value Range (Wei)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minValue}
                  onChange={(e) => handleChange('minValue', e.target.value)}
                  min="0"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxValue}
                  onChange={(e) => handleChange('maxValue', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* EIP Transaction Type */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                EIP Transaction Type
              </label>
              <Select
                value={filters.eipType.toString()}
                onChange={(e) => handleChange('eipType', parseInt(e.target.value))}
              >
                {TX_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Direction */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                Direction
              </label>
              <Select
                value={filters.direction}
                onChange={(e) => handleChange('direction', e.target.value as AdvancedTransactionFilterValues['direction'])}
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                Status
              </label>
              <Select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value as AdvancedTransactionFilterValues['status'])}
              >
                <option value="all">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </Select>
            </div>

            {/* Contract Interaction */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                Interaction Type
              </label>
              <Select
                value={filters.contractInteraction}
                onChange={(e) => handleChange('contractInteraction', e.target.value as AdvancedTransactionFilterValues['contractInteraction'])}
              >
                <option value="all">All</option>
                <option value="contract-call">Contract Call</option>
                <option value="contract-deploy">Contract Deploy</option>
                <option value="transfer">Transfer Only</option>
              </Select>
            </div>

            {/* Fee Delegation */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                Fee Delegation
              </label>
              <Select
                value={filters.feeDelegated}
                onChange={(e) => handleChange('feeDelegated', e.target.value as AdvancedTransactionFilterValues['feeDelegated'])}
              >
                <option value="all">All</option>
                <option value="yes">Fee Delegated Only</option>
                <option value="no">Not Fee Delegated</option>
              </Select>
            </div>

            {/* Time Range */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                Time Range
              </label>
              <Select
                value={filters.timeRange}
                onChange={(e) => handleChange('timeRange', e.target.value as AdvancedTransactionFilterValues['timeRange'])}
              >
                <option value="all">All Time</option>
                <option value="1h">Last 1 Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </Select>
            </div>

            {/* From Address */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                From Address
              </label>
              <Input
                type="text"
                placeholder="0x..."
                value={filters.fromAddress}
                onChange={(e) => handleChange('fromAddress', e.target.value)}
              />
            </div>

            {/* To Address */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                To Address
              </label>
              <Input
                type="text"
                placeholder="0x..."
                value={filters.toAddress}
                onChange={(e) => handleChange('toAddress', e.target.value)}
              />
            </div>

            {/* Method ID */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                Method ID
              </label>
              <Input
                type="text"
                placeholder="0x..."
                value={filters.methodId}
                onChange={(e) => handleChange('methodId', e.target.value)}
              />
            </div>

            {/* Gas Usage Range */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                Gas Used Range
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minGasUsed}
                  onChange={(e) => handleChange('minGasUsed', e.target.value)}
                  min="0"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxGasUsed}
                  onChange={(e) => handleChange('maxGasUsed', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset} disabled={isLoading}>
              RESET
            </Button>
            <Button onClick={handleApply} disabled={isLoading}>
              {isLoading ? 'LOADING...' : 'APPLY FILTERS'}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

/**
 * Hook to convert filter values to query parameters
 */
export function useFilterQueryParams(filters: AdvancedTransactionFilterValues) {
  return useMemo(() => {
    const params: Record<string, string> = {}

    if (filters.fromBlock) params.fromBlock = filters.fromBlock
    if (filters.toBlock) params.toBlock = filters.toBlock
    if (filters.minValue) params.minValue = filters.minValue
    if (filters.maxValue) params.maxValue = filters.maxValue
    if (filters.direction !== 'all') params.direction = filters.direction
    if (filters.status !== 'all') params.status = filters.status
    if (filters.eipType !== -1) params.type = filters.eipType.toString()
    if (filters.contractInteraction !== 'all') params.interaction = filters.contractInteraction
    if (filters.feeDelegated !== 'all') params.feeDelegated = filters.feeDelegated
    if (filters.fromAddress) params.from = filters.fromAddress
    if (filters.toAddress) params.to = filters.toAddress
    if (filters.methodId) params.methodId = filters.methodId
    if (filters.minGasUsed) params.minGas = filters.minGasUsed
    if (filters.maxGasUsed) params.maxGas = filters.maxGasUsed
    if (filters.timeRange !== 'all') params.time = filters.timeRange

    return params
  }, [filters])
}

/**
 * Compact filter summary component
 */
export function FilterSummary({
  filters,
  onClear
}: {
  filters: AdvancedTransactionFilterValues
  onClear: () => void
}) {
  const activeFilters: string[] = []

  if (filters.fromBlock || filters.toBlock) {
    activeFilters.push(`Block: ${filters.fromBlock || '0'}-${filters.toBlock || 'latest'}`)
  }
  if (filters.minValue || filters.maxValue) {
    activeFilters.push(`Value: ${filters.minValue || '0'}-${filters.maxValue || '∞'}`)
  }
  if (filters.direction !== 'all') {
    activeFilters.push(`Direction: ${filters.direction}`)
  }
  if (filters.status !== 'all') {
    activeFilters.push(`Status: ${filters.status}`)
  }
  if (filters.eipType !== -1) {
    const typeLabel = TX_TYPE_OPTIONS.find(t => t.value === filters.eipType)?.label
    activeFilters.push(`Type: ${typeLabel}`)
  }
  if (filters.contractInteraction !== 'all') {
    activeFilters.push(`Interaction: ${filters.contractInteraction}`)
  }
  if (filters.feeDelegated !== 'all') {
    activeFilters.push(`Fee Delegated: ${filters.feeDelegated}`)
  }
  if (filters.methodId) {
    activeFilters.push(`Method: ${filters.methodId.slice(0, 10)}...`)
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="font-mono text-xs text-text-muted">Active Filters:</span>
      {activeFilters.map((filter, idx) => (
        <span
          key={idx}
          className="rounded bg-accent-blue/10 px-2 py-0.5 font-mono text-xs text-accent-blue"
        >
          {filter}
        </span>
      ))}
      <button
        onClick={onClear}
        className="ml-2 font-mono text-xs text-accent-red hover:underline"
      >
        Clear All
      </button>
    </div>
  )
}
