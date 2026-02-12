'use client'

import type { AdvancedTransactionFilterValues } from './types'
import { TX_TYPE_OPTIONS } from './types'
import { FORMATTING } from '@/lib/config/constants'

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
    activeFilters.push(`Method: ${filters.methodId.slice(0, FORMATTING.METHOD_SELECTOR_HEX_LENGTH)}...`)
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
