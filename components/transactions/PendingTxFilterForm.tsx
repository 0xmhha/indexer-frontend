'use client'

import { env } from '@/lib/config/env'
import type { FilterFormState, TransactionFilter } from '@/lib/hooks/usePendingTxFilters'

const TRANSACTION_TYPES = [
  { value: -1, label: 'All Types' },
  { value: 0x0, label: 'Legacy (0x0)' },
  { value: 0x1, label: 'Access List (0x1)' },
  { value: 0x2, label: 'EIP-1559 (0x2)' },
  { value: 0x3, label: 'Blob (0x3)' },
  { value: 0x16, label: 'Fee Delegated (0x16)' },
]

interface PendingTxFilterFormProps {
  formState: FilterFormState
  activeFilter: TransactionFilter | undefined
  hasActiveFilters: boolean
  onFieldChange: <K extends keyof FilterFormState>(field: K, value: FilterFormState[K]) => void
  onApply: () => void
  onClear: () => void
}

// ============================================================
// Sub-Components
// ============================================================

function FilterInput({
  id,
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
  min,
  step,
}: {
  id: string
  label: string
  type?: 'text' | 'number'
  value: string
  placeholder: string
  onChange: (value: string) => void
  min?: string
  step?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-mono text-xs text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
        className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
      />
    </div>
  )
}

function ActiveFilterDisplay({ filter }: { filter: TransactionFilter }) {
  return (
    <div className="mt-4 rounded border border-accent-cyan/30 bg-accent-cyan/5 p-3">
      <div className="mb-2 font-mono text-xs font-bold text-accent-cyan">ACTIVE FILTERS:</div>
      <div className="space-y-1 font-mono text-xs text-text-secondary">
        {filter.type !== undefined && (
          <div>• Type: {TRANSACTION_TYPES.find((t) => t.value === filter.type)?.label || 'Unknown'}</div>
        )}
        {filter.fromAddress && <div>• From: {filter.fromAddress}</div>}
        {filter.toAddress && <div>• To: {filter.toAddress}</div>}
        {filter.minGasPrice !== undefined && <div>• Min Gas Price: {filter.minGasPrice} Gwei</div>}
        {filter.maxGasPrice !== undefined && <div>• Max Gas Price: {filter.maxGasPrice} Gwei</div>}
        {filter.minValue !== undefined && <div>• Min Value: {filter.minValue} {env.currencySymbol}</div>}
        {filter.maxValue !== undefined && <div>• Max Value: {filter.maxValue} {env.currencySymbol}</div>}
      </div>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

/**
 * Filter form for pending transactions (SRP: Only handles filter UI)
 */
export function PendingTxFilterForm({
  formState,
  activeFilter,
  hasActiveFilters,
  onFieldChange,
  onApply,
  onClear,
}: PendingTxFilterFormProps) {
  return (
    <div className="mb-6 rounded border border-bg-tertiary bg-bg-secondary p-4">
      <div className="annotation mb-4">FILTERS</div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Transaction Type */}
        <div>
          <label htmlFor="txType" className="mb-2 block font-mono text-xs text-text-secondary">
            Transaction Type
          </label>
          <select
            id="txType"
            value={formState.selectedType}
            onChange={(e) => onFieldChange('selectedType', parseInt(e.target.value, 10))}
            className="w-full rounded border border-bg-tertiary bg-bg-primary px-3 py-2 font-mono text-xs text-text-primary focus:border-accent-blue focus:outline-none"
          >
            {TRANSACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <FilterInput
          id="fromAddress"
          label="From Address"
          value={formState.fromAddress}
          placeholder="0x... (partial match)"
          onChange={(v) => onFieldChange('fromAddress', v)}
        />

        <FilterInput
          id="toAddress"
          label="To Address"
          value={formState.toAddress}
          placeholder="0x... (partial match)"
          onChange={(v) => onFieldChange('toAddress', v)}
        />

        <FilterInput
          id="minGasPrice"
          label="Min Gas Price (Gwei)"
          type="number"
          value={formState.minGasPrice}
          placeholder="0.0"
          onChange={(v) => onFieldChange('minGasPrice', v)}
          min="0"
          step="0.1"
        />

        <FilterInput
          id="maxGasPrice"
          label="Max Gas Price (Gwei)"
          type="number"
          value={formState.maxGasPrice}
          placeholder="∞"
          onChange={(v) => onFieldChange('maxGasPrice', v)}
          min="0"
          step="0.1"
        />

        <FilterInput
          id="minValue"
          label={`Min Value (${env.currencySymbol})`}
          type="number"
          value={formState.minValue}
          placeholder="0.0"
          onChange={(v) => onFieldChange('minValue', v)}
          min="0"
          step="0.01"
        />

        <FilterInput
          id="maxValue"
          label={`Max Value (${env.currencySymbol})`}
          type="number"
          value={formState.maxValue}
          placeholder="∞"
          onChange={(v) => onFieldChange('maxValue', v)}
          min="0"
          step="0.01"
        />
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={onApply}
          disabled={!hasActiveFilters}
          className="rounded border border-accent-blue bg-accent-blue/10 px-4 py-2 font-mono text-xs text-accent-blue transition-colors hover:bg-accent-blue/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          APPLY FILTERS
        </button>
        <button
          onClick={onClear}
          disabled={!hasActiveFilters && !activeFilter}
          className="rounded border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue disabled:cursor-not-allowed disabled:opacity-50"
        >
          CLEAR ALL
        </button>
      </div>

      {activeFilter && <ActiveFilterDisplay filter={activeFilter} />}
    </div>
  )
}
