'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { ExportButton } from '@/components/common/ExportButton'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { TransactionFilters, type TransactionFilterValues } from '@/components/transactions/TransactionFilters'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import { formatNumber } from '@/lib/utils/format'
import type { Transaction } from '@/types/graphql'

interface AddressTransactionsSectionProps {
  address: string
  transactions: Transaction[]
  totalCount: number
  loading: boolean
  error: Error | null
  activeFilters: TransactionFilterValues | null
  currentPage: number
  itemsPerPage: number
  totalPages: number
  onApplyFilters: (filters: TransactionFilterValues) => void
  onResetFilters: () => void
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div className="p-6 text-center">
      <p className="text-sm text-text-muted">No transactions found for this address</p>
    </div>
  )
}

/**
 * Export data formatter
 */
function formatExportData(transactions: Transaction[]) {
  return transactions.map((tx) => ({
    hash: tx.hash,
    blockNumber: tx.blockNumber,
    from: tx.from,
    to: tx.to || '',
    value: tx.value,
    type: tx.type,
  }))
}

/**
 * Address transactions section with filters and pagination (SRP: Manages transaction list display)
 */
export function AddressTransactionsSection({
  address,
  transactions,
  totalCount,
  loading,
  error,
  activeFilters,
  currentPage,
  itemsPerPage,
  totalPages,
  onApplyFilters,
  onResetFilters,
  onPageChange,
  onItemsPerPageChange,
}: AddressTransactionsSectionProps) {
  const hasFilters = activeFilters !== null

  return (
    <>
      <TransactionFilters
        onApply={onApplyFilters}
        onReset={onResetFilters}
        initialValues={activeFilters || undefined}
        isLoading={loading}
      />

      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center justify-between">
            <span>TRANSACTIONS {hasFilters && '(FILTERED)'}</span>
            <div className="flex items-center gap-4">
              {totalCount > 0 && (
                <span className="font-mono text-xs text-text-secondary">
                  {formatNumber(totalCount)} total
                </span>
              )}
              <ExportButton
                data={formatExportData(transactions)}
                filename={`address-${address}-transactions`}
                headers={['hash', 'blockNumber', 'from', 'to', 'value', 'type']}
                disabled={loading}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorDisplay title="Failed to load transactions" message={error.message} />
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <TransactionTable
              transactions={transactions}
              currentAddress={address}
              showStatus={hasFilters}
            />
          )}
        </CardContent>
      </Card>

      {/* Always show pagination when there are transactions */}
      {totalCount > 0 && (
        <div className="mt-6">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            showItemsPerPage={true}
            showResultsInfo={true}
            showPageInput={false}
          />
        </div>
      )}
    </>
  )
}
