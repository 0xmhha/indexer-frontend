import { cn } from '@/lib/utils'
import { UI } from '@/lib/config/constants'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const maxVisible = UI.PAGINATION_MAX_VISIBLE_SIMPLE
  const halfVisible = Math.floor(maxVisible / 2)

  let startPage = Math.max(1, currentPage - halfVisible)
  const endPage = Math.min(totalPages, startPage + maxVisible - 1)

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-2', className)}>
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
      {startPage > 1 && <span className="px-2 font-mono text-xs text-text-muted" aria-hidden="true">...</span>}

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

      {endPage < totalPages && <span className="px-2 font-mono text-xs text-text-muted" aria-hidden="true">...</span>}

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
    </nav>
  )
}
