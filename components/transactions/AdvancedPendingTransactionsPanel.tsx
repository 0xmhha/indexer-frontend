'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PendingTxFilterForm } from './PendingTxFilterForm'
import { PendingTxTable } from './PendingTxTable'
import { usePendingTransactions } from '@/lib/hooks/useSubscriptions'
import { usePendingTxFilters } from '@/lib/hooks/usePendingTxFilters'
import { UI } from '@/lib/config/constants'

interface AdvancedPendingTransactionsPanelProps {
  maxTransactions?: number
  className?: string
}

// ============================================================
// Sub-Components
// ============================================================

/**
 * Status indicator badge
 */
function StatusBadge({ isFiltered }: { isFiltered: boolean }) {
  const color = isFiltered ? 'accent-cyan' : 'accent-green'
  const label = isFiltered ? 'FILTERED' : 'LIVE'

  return (
    <div className="flex items-center gap-2">
      <div className={`flex h-2 w-2 rounded-full animate-pulse bg-${color}`} />
      <span className={`font-mono text-[10px] text-${color}`}>{label}</span>
    </div>
  )
}

/**
 * Transaction count display
 */
function TransactionCount({ filtered, total }: { filtered: number; total: number }) {
  return (
    <span className="font-mono text-xs text-text-secondary">
      {filtered} / {total} transactions
    </span>
  )
}

/**
 * Empty state display
 */
function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <div className="font-mono text-sm text-text-muted">No transactions found</div>
        <div className="mt-2 font-mono text-xs text-text-muted">
          {hasFilter ? 'Try adjusting your filters' : 'Waiting for transactions...'}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

/**
 * Advanced Pending Transactions Panel with Filtering
 *
 * Real-time pending transactions viewer with user-configurable filters for
 * transaction type, addresses, gas price, and value.
 */
export function AdvancedPendingTransactionsPanel({
  maxTransactions = UI.MAX_VIEWER_ITEMS,
  className,
}: AdvancedPendingTransactionsPanelProps) {
  // Hooks - using centralized store for real-time data
  const { pendingTransactions, loading } = usePendingTransactions(maxTransactions * 2)
  const {
    formState,
    activeFilter,
    hasActiveFilters,
    setFormField,
    applyFilters,
    clearFilters,
    filterTransactions,
  } = usePendingTxFilters()

  // Filter transactions
  const filteredTransactions = useMemo(
    () => filterTransactions(pendingTransactions),
    [filterTransactions, pendingTransactions]
  )

  const isFiltered = activeFilter !== undefined
  const showLoading = loading && filteredTransactions.length === 0
  const showEmpty = !loading && filteredTransactions.length === 0
  const showTable = !loading && filteredTransactions.length > 0

  return (
    <Card className={className}>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center justify-between">
          <span>ADVANCED PENDING TRANSACTIONS</span>
          <div className="flex items-center gap-4">
            {!loading && (
              <TransactionCount
                filtered={filteredTransactions.length}
                total={pendingTransactions.length}
              />
            )}
            <StatusBadge isFiltered={isFiltered} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <PendingTxFilterForm
          formState={formState}
          activeFilter={activeFilter}
          hasActiveFilters={hasActiveFilters}
          onFieldChange={setFormField}
          onApply={applyFilters}
          onClear={clearFilters}
        />

        {showLoading && (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {showEmpty && <EmptyState hasFilter={isFiltered} />}

        {showTable && (
          <PendingTxTable
            transactions={filteredTransactions}
            maxTransactions={maxTransactions}
          />
        )}
      </CardContent>
    </Card>
  )
}
