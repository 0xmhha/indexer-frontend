'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

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
}: PaginationControlsProps) {
  const [pageInput, setPageInput] = useState('')

  const maxVisible = 5
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

  return (
    <div className={cn('space-y-4', className)}>
      {/* Results Info and Items Per Page */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Results Info */}
        {showResultsInfo && totalCount !== undefined && (
          <div className="font-mono text-xs text-text-secondary">
            Showing <span className="font-semibold text-text-primary">{showingStart}</span> -{' '}
            <span className="font-semibold text-text-primary">{showingEnd}</span> of{' '}
            <span className="font-semibold text-text-primary">{totalCount}</span> results
          </div>
        )}

        {/* Items Per Page Selector */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="items-per-page" className="font-mono text-xs text-text-secondary">
              Show:
            </label>
            <select
              id="items-per-page"
              name="items-per-page"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="border border-bg-tertiary bg-bg-secondary px-2 py-1 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue focus:border-accent-blue focus:outline-none"
              aria-label="Items per page"
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
        <div className="flex items-center gap-2">
          {/* First Page */}
          {currentPage > 1 && (
            <button
              onClick={() => onPageChange(1)}
              className="btn-hex h-8 px-3 py-1 text-[10px] disabled:opacity-50"
              disabled={currentPage === 1}
              aria-label="Go to first page"
            >
              FIRST
            </button>
          )}

          {/* Previous */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="btn-hex h-8 px-3 py-1 text-[10px] disabled:opacity-50"
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            PREV
          </button>

          {/* Page Numbers */}
          {startPage > 1 && (
            <span className="px-2 font-mono text-xs text-text-muted" aria-hidden="true">
              ...
            </span>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'h-8 px-3 py-1 font-mono text-xs transition-colors',
                page === currentPage
                  ? 'bg-accent-blue text-bg-primary'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/70'
              )}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <span className="px-2 font-mono text-xs text-text-muted" aria-hidden="true">
              ...
            </span>
          )}

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="btn-hex h-8 px-3 py-1 text-[10px] disabled:opacity-50"
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            NEXT
          </button>

          {/* Last Page */}
          {currentPage < totalPages && (
            <button
              onClick={() => onPageChange(totalPages)}
              className="btn-hex h-8 px-3 py-1 text-[10px] disabled:opacity-50"
              disabled={currentPage === totalPages}
              aria-label={`Go to last page, page ${totalPages}`}
            >
              LAST
            </button>
          )}
        </div>

        {/* Page Input (Optional) */}
        {showPageInput && (
          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
            <label htmlFor="page-input" className="font-mono text-xs text-text-secondary">
              Go to:
            </label>
            <input
              id="page-input"
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder={currentPage.toString()}
              className="w-16 border border-bg-tertiary bg-bg-secondary px-2 py-1 font-mono text-xs text-text-primary transition-colors placeholder-text-muted hover:border-accent-blue focus:border-accent-blue focus:outline-none"
              aria-label="Page number"
            />
            <button
              type="submit"
              className="btn-hex h-8 px-3 py-1 text-[10px]"
              aria-label="Go to page"
            >
              GO
            </button>
          </form>
        )}
      </nav>
    </div>
  )
}
