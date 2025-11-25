'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { UI } from '@/lib/config/constants'
import { ArrowUpDown } from 'lucide-react'
import {
  usePaginationKeyboard,
  calculatePageRange,
  calculateShowingRange,
} from '@/lib/hooks/usePaginationKeyboard'
import {
  FirstPageButton,
  PrevPageButton,
  NextPageButton,
  LastPageButton,
  PageButton,
  PageEllipsis,
} from '@/components/ui/pagination-buttons'

// ============================================================
// Types
// ============================================================

export interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalCount?: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  className?: string
  showItemsPerPage?: boolean
  showResultsInfo?: boolean
  showPageInput?: boolean
  itemsPerPageOptions?: number[]
  loading?: boolean
}

interface NavigationButtonsProps {
  currentPage: number
  totalPages: number
  pages: number[]
  onPageChange: (page: number) => void
  loading: boolean
}

// ============================================================
// Sub-Components
// ============================================================

function ResultsInfo({
  showingStart,
  showingEnd,
  totalCount,
}: {
  showingStart: number
  showingEnd: number
  totalCount: number
}) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
      <span>Showing</span>
      <span className="rounded bg-bg-tertiary px-2 py-0.5 font-semibold text-accent-blue">
        {showingStart}
      </span>
      <span>-</span>
      <span className="rounded bg-bg-tertiary px-2 py-0.5 font-semibold text-accent-blue">
        {showingEnd}
      </span>
      <span>of</span>
      <span className="rounded bg-bg-tertiary px-2 py-0.5 font-semibold text-accent-blue">
        {totalCount.toLocaleString()}
      </span>
      <span>results</span>
    </div>
  )
}

function ItemsPerPageSelector({
  itemsPerPage,
  options,
  onChange,
  loading,
}: {
  itemsPerPage: number
  options: number[]
  onChange: (value: number) => void
  loading?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="items-per-page"
        className="flex items-center gap-1.5 font-mono text-xs text-text-secondary"
      >
        <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
        <span>Show:</span>
      </label>
      <select
        id="items-per-page"
        name="items-per-page"
        value={itemsPerPage}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded border border-bg-tertiary bg-bg-secondary px-3 py-1.5 font-mono text-xs text-text-primary shadow-sm transition-all hover:border-accent-blue hover:shadow-md focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
        aria-label="Items per page"
        disabled={loading}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="font-mono text-xs text-text-secondary">per page</span>
    </div>
  )
}

function PageInputForm({
  totalPages,
  currentPage,
  loading,
}: {
  totalPages: number
  currentPage: number
  loading?: boolean
}) {
  const [pageInput, setPageInput] = useState('')

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
      <label htmlFor="page-input" className="font-mono text-xs text-text-secondary">
        Jump to:
      </label>
      <input
        id="page-input"
        type="number"
        min="1"
        max={totalPages}
        value={pageInput}
        onChange={(e) => setPageInput(e.target.value)}
        placeholder={currentPage.toString()}
        className="w-20 rounded border border-bg-tertiary bg-bg-secondary px-3 py-1.5 font-mono text-xs text-text-primary shadow-sm transition-all placeholder-text-muted hover:border-accent-blue hover:shadow-md focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
        aria-label="Page number"
        disabled={loading}
      />
      <button
        type="submit"
        className="flex h-9 items-center gap-1.5 rounded border border-accent-blue bg-accent-blue px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-bg-primary shadow-sm transition-all hover:bg-accent-blue/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-blue/20 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Go to page"
        disabled={loading}
      >
        Go
      </button>
    </form>
  )
}

function KeyboardHint() {
  return (
    <div className="flex items-center justify-center gap-4 border-t border-bg-tertiary pt-3">
      <p className="font-mono text-[10px] text-text-muted">
        <span className="hidden sm:inline">
          Use{' '}
          <kbd className="rounded bg-bg-tertiary px-1.5 py-0.5 font-semibold text-text-secondary">
            ←
          </kbd>{' '}
          <kbd className="rounded bg-bg-tertiary px-1.5 py-0.5 font-semibold text-text-secondary">
            →
          </kbd>{' '}
          to navigate pages,{' '}
          <kbd className="rounded bg-bg-tertiary px-1.5 py-0.5 font-semibold text-text-secondary">
            Home
          </kbd>{' '}
          /{' '}
          <kbd className="rounded bg-bg-tertiary px-1.5 py-0.5 font-semibold text-text-secondary">
            End
          </kbd>{' '}
          for first/last page
        </span>
      </p>
    </div>
  )
}

function PageNumbers({
  pages,
  currentPage,
  totalPages,
  onPageChange,
  loading,
}: {
  pages: number[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  loading: boolean | undefined
}) {
  const startPage = pages[0] || 1
  const endPage = pages[pages.length - 1] || totalPages

  return (
    <>
      {startPage > 1 && (
        <>
          <PageButton page={1} isCurrent={false} onClick={() => onPageChange(1)} disabled={loading} />
          <PageEllipsis />
        </>
      )}

      {pages.map((page) => (
        <PageButton
          key={page}
          page={page}
          isCurrent={page === currentPage}
          onClick={() => onPageChange(page)}
          disabled={loading}
        />
      ))}

      {endPage < totalPages && (
        <>
          <PageEllipsis />
          <PageButton
            page={totalPages}
            isCurrent={false}
            onClick={() => onPageChange(totalPages)}
            disabled={loading}
          />
        </>
      )}
    </>
  )
}

/**
 * Navigation buttons section (extracted for reduced complexity)
 */
function NavigationButtons({
  currentPage,
  totalPages,
  pages,
  onPageChange,
  loading,
}: NavigationButtonsProps) {
  const showFirstButton = currentPage > 1
  const showLastButton = currentPage < totalPages
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {showFirstButton && (
        <FirstPageButton onClick={() => onPageChange(1)} disabled={loading ? true : undefined} />
      )}

      <PrevPageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage || loading ? true : undefined}
      />

      <PageNumbers
        pages={pages}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        loading={loading ? true : undefined}
      />

      <NextPageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage || loading ? true : undefined}
      />

      {showLastButton && (
        <LastPageButton
          onClick={() => onPageChange(totalPages)}
          disabled={loading ? true : undefined}
          totalPages={totalPages}
        />
      )}
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
  showItemsPerPage = true,
  showResultsInfo = true,
  showPageInput = false,
  itemsPerPageOptions = [10, 20, 50, 100],
  loading = false,
}: PaginationControlsProps) {
  usePaginationKeyboard(currentPage, totalPages, onPageChange)

  const pages = calculatePageRange(currentPage, totalPages, UI.PAGINATION_MAX_VISIBLE_FULL)
  const { start: showingStart, end: showingEnd } = calculateShowingRange(
    currentPage,
    itemsPerPage,
    totalCount
  )

  const shouldShowResultsInfo = showResultsInfo && totalCount !== undefined
  const shouldShowItemsPerPage = showItemsPerPage && onItemsPerPageChange !== undefined

  return (
    <div className={cn('space-y-4', loading && 'pointer-events-none opacity-50', className)}>
      {/* Results Info and Items Per Page */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        {shouldShowResultsInfo && (
          <ResultsInfo showingStart={showingStart} showingEnd={showingEnd} totalCount={totalCount!} />
        )}

        {shouldShowItemsPerPage && (
          <ItemsPerPageSelector
            itemsPerPage={itemsPerPage}
            options={itemsPerPageOptions}
            onChange={onItemsPerPageChange!}
            loading={loading}
          />
        )}
      </div>

      {/* Pagination Controls */}
      <nav
        aria-label="Pagination"
        className="flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <NavigationButtons
          currentPage={currentPage}
          totalPages={totalPages}
          pages={pages}
          onPageChange={onPageChange}
          loading={loading}
        />

        {showPageInput && (
          <PageInputForm totalPages={totalPages} currentPage={currentPage} loading={loading} />
        )}
      </nav>

      <KeyboardHint />
    </div>
  )
}
