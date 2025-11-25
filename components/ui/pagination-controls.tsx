'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { UI } from '@/lib/config/constants'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
} from 'lucide-react'

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
  const [pageInput, setPageInput] = useState('')

  const maxVisible = UI.PAGINATION_MAX_VISIBLE_FULL
  const halfVisible = Math.floor(maxVisible / 2)

  let startPage = Math.max(1, currentPage - halfVisible)
  const endPage = Math.min(totalPages, startPage + maxVisible - 1)

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  // Calculate showing range
  const showingStart = totalCount ? (currentPage - 1) * itemsPerPage + 1 : 0
  const showingEnd = totalCount ? Math.min(currentPage * itemsPerPage, totalCount) : 0

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(pageInput, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page)
      setPageInput('')
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not focused on an input/textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      if (e.key === 'ArrowLeft' && currentPage > 1) {
        e.preventDefault()
        onPageChange(currentPage - 1)
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        e.preventDefault()
        onPageChange(currentPage + 1)
      } else if (e.key === 'Home' && currentPage > 1) {
        e.preventDefault()
        onPageChange(1)
      } else if (e.key === 'End' && currentPage < totalPages) {
        e.preventDefault()
        onPageChange(totalPages)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages, onPageChange])

  return (
    <div className={cn('space-y-4', loading && 'pointer-events-none opacity-50', className)}>
      {/* Results Info and Items Per Page */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Results Info */}
        {showResultsInfo && totalCount !== undefined && (
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
        )}

        {/* Items Per Page Selector */}
        {showItemsPerPage && onItemsPerPageChange && (
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
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded border border-bg-tertiary bg-bg-secondary px-3 py-1.5 font-mono text-xs text-text-primary shadow-sm transition-all hover:border-accent-blue hover:shadow-md focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
              aria-label="Items per page"
              disabled={loading}
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="font-mono text-xs text-text-secondary">per page</span>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <nav
        aria-label="Pagination"
        className="flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        {/* Page Numbers and Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {/* First Page */}
          {currentPage > 1 && (
            <button
              onClick={() => onPageChange(1)}
              className="flex h-9 items-center gap-1.5 rounded border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-secondary shadow-sm transition-all hover:border-accent-blue hover:bg-bg-tertiary hover:text-accent-blue hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-blue/20 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 1 || loading}
              aria-label="Go to first page"
              title="First page (Home key)"
            >
              <ChevronsLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">First</span>
            </button>
          )}

          {/* Previous */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="flex h-9 items-center gap-1.5 rounded border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-secondary shadow-sm transition-all hover:border-accent-blue hover:bg-bg-tertiary hover:text-accent-blue hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-blue/20 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage === 1 || loading}
            aria-label="Go to previous page"
            title="Previous page (← key)"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page Numbers */}
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="flex h-9 min-w-[36px] items-center justify-center rounded border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-secondary shadow-sm transition-all hover:border-accent-blue hover:bg-bg-tertiary hover:text-accent-blue hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                aria-label="Page 1"
                disabled={loading}
              >
                1
              </button>
              <span className="px-1 font-mono text-xs text-text-muted" aria-hidden="true">
                ...
              </span>
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'flex h-9 min-w-[36px] items-center justify-center rounded border px-3 py-2 font-mono text-xs shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent-blue/20',
                page === currentPage
                  ? 'border-accent-blue bg-accent-blue text-bg-primary shadow-md shadow-accent-blue/20'
                  : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-blue hover:bg-bg-tertiary hover:text-accent-blue hover:shadow-md'
              )}
              aria-label={`${page === currentPage ? 'Current page, ' : ''}Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              disabled={loading}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              <span className="px-1 font-mono text-xs text-text-muted" aria-hidden="true">
                ...
              </span>
              <button
                onClick={() => onPageChange(totalPages)}
                className="flex h-9 min-w-[36px] items-center justify-center rounded border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-secondary shadow-sm transition-all hover:border-accent-blue hover:bg-bg-tertiary hover:text-accent-blue hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                aria-label={`Page ${totalPages}`}
                disabled={loading}
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="flex h-9 items-center gap-1.5 rounded border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-secondary shadow-sm transition-all hover:border-accent-blue hover:bg-bg-tertiary hover:text-accent-blue hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-blue/20 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage === totalPages || loading}
            aria-label="Go to next page"
            title="Next page (→ key)"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          {/* Last Page */}
          {currentPage < totalPages && (
            <button
              onClick={() => onPageChange(totalPages)}
              className="flex h-9 items-center gap-1.5 rounded border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-secondary shadow-sm transition-all hover:border-accent-blue hover:bg-bg-tertiary hover:text-accent-blue hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-blue/20 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === totalPages || loading}
              aria-label={`Go to last page, page ${totalPages}`}
              title="Last page (End key)"
            >
              <span className="hidden sm:inline">Last</span>
              <ChevronsRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Page Input (Optional) */}
        {showPageInput && (
          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
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
        )}
      </nav>

      {/* Keyboard shortcuts hint */}
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
    </div>
  )
}
