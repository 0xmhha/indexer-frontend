'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export interface TransactionFilterValues {
  fromBlock: string
  toBlock: string
  minValue: string
  maxValue: string
  txType: number // 0=all, 1=sent, 2=received
  successOnly: boolean
}

interface TransactionFiltersProps {
  onApply: (filters: TransactionFilterValues) => void
  onReset: () => void
  initialValues?: Partial<TransactionFilterValues> | undefined
  isLoading?: boolean
}

const defaultFilters: TransactionFilterValues = {
  fromBlock: '',
  toBlock: '',
  minValue: '',
  maxValue: '',
  txType: 0,
  successOnly: false,
}

export function TransactionFilters({
  onApply,
  onReset,
  initialValues,
  isLoading = false,
}: TransactionFiltersProps) {
  const [filters, setFilters] = useState<TransactionFilterValues>({
    ...defaultFilters,
    ...initialValues,
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const handleChange = (field: keyof TransactionFilterValues, value: string | number | boolean) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleApply = () => {
    onApply(filters)
  }

  const handleReset = () => {
    setFilters(defaultFilters)
    onReset()
  }

  const hasActiveFilters =
    filters.fromBlock ||
    filters.toBlock ||
    filters.minValue ||
    filters.maxValue ||
    filters.txType !== 0 ||
    filters.successOnly

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:text-accent-blue"
          >
            <span>FILTERS</span>
            <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
            {hasActiveFilters && (
              <span className="ml-2 h-2 w-2 rounded-full bg-accent-blue" />
            )}
          </button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              RESET
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

            {/* Transaction Type */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase text-text-secondary">
                Transaction Type
              </label>
              <Select
                value={filters.txType.toString()}
                onChange={(e) => handleChange('txType', parseInt(e.target.value))}
              >
                <option value="0">All Transactions</option>
                <option value="1">Sent</option>
                <option value="2">Received</option>
              </Select>
            </div>

            {/* Success Only */}
            <div className="flex items-end">
              <Checkbox
                label="Success Only"
                checked={filters.successOnly}
                onChange={(e) => handleChange('successOnly', e.target.checked)}
              />
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
