'use client'

import { useEffect } from 'react'

// ============================================================
// Hook
// ============================================================

/**
 * Hook for keyboard navigation in pagination
 */
export function usePaginationKeyboard(
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) {
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
}

// ============================================================
// Page Calculation Utilities
// ============================================================

/**
 * Calculate visible page range
 */
export function calculatePageRange(
  currentPage: number,
  totalPages: number,
  maxVisible: number
): number[] {
  const halfVisible = Math.floor(maxVisible / 2)
  let startPage = Math.max(1, currentPage - halfVisible)
  const endPage = Math.min(totalPages, startPage + maxVisible - 1)

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
}

/**
 * Calculate showing range for results info
 */
export function calculateShowingRange(
  currentPage: number,
  itemsPerPage: number,
  totalCount: number | undefined
): { start: number; end: number } {
  if (!totalCount) return { start: 0, end: 0 }
  const start = (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, totalCount)
  return { start, end }
}
