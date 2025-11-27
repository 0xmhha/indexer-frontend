'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { getPreference } from '@/lib/store/userPreferences'

export interface UsePaginationOptions {
  totalCount: number
  defaultItemsPerPage?: number
  maxItemsPerPage?: number
  minItemsPerPage?: number
  scrollToTop?: boolean
}

export interface UsePaginationResult {
  currentPage: number
  itemsPerPage: number
  totalPages: number
  offset: number
  setPage: (page: number) => void
  setItemsPerPage: (itemsPerPage: number) => void
  goToFirstPage: () => void
  goToLastPage: () => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  canGoNext: boolean
  canGoPrevious: boolean
}

const DEFAULT_ITEMS_PER_PAGE = 20
const MAX_ITEMS_PER_PAGE = 100
const MIN_ITEMS_PER_PAGE = 10

/**
 * Hook for pagination with URL query parameter support
 *
 * Manages pagination state synchronized with URL query parameters:
 * - `page`: Current page number (1-indexed)
 * - `limit`: Items per page
 *
 * @example
 * ```tsx
 * const { currentPage, itemsPerPage, offset, setPage, setItemsPerPage, totalPages } = usePagination({
 *   totalCount: 1000,
 *   defaultItemsPerPage: 20,
 * })
 * ```
 */
export function usePagination(options: UsePaginationOptions): UsePaginationResult {
  // Get user's preferred items per page from settings, fallback to option or default
  const userPreferredItemsPerPage = getPreference('itemsPerPage')

  const {
    totalCount,
    defaultItemsPerPage = userPreferredItemsPerPage || DEFAULT_ITEMS_PER_PAGE,
    maxItemsPerPage = MAX_ITEMS_PER_PAGE,
    minItemsPerPage = MIN_ITEMS_PER_PAGE,
    scrollToTop = true,
  } = options

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Parse page from URL
  const getPageFromURL = useCallback((): number => {
    const pageParam = searchParams.get('page')
    if (pageParam) {
      const page = parseInt(pageParam, 10)
      if (!isNaN(page) && page > 0) {
        return page
      }
    }
    return 1
  }, [searchParams])

  // Parse items per page from URL
  const getItemsPerPageFromURL = useCallback((): number => {
    const limitParam = searchParams.get('limit')
    if (limitParam) {
      const limit = parseInt(limitParam, 10)
      if (!isNaN(limit) && limit >= minItemsPerPage && limit <= maxItemsPerPage) {
        return limit
      }
    }
    return defaultItemsPerPage
  }, [searchParams, defaultItemsPerPage, maxItemsPerPage, minItemsPerPage])

  // State
  const [currentPage, setCurrentPage] = useState(getPageFromURL)
  const [itemsPerPage, setItemsPerPageState] = useState(getItemsPerPageFromURL)

  // Calculate derived values
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage))
  const offset = (currentPage - 1) * itemsPerPage
  const canGoNext = currentPage < totalPages
  const canGoPrevious = currentPage > 1

  // Sync with URL on mount and URL changes
  // Note: We intentionally exclude currentPage and itemsPerPage from dependencies
  // to prevent infinite loops. We only want to sync FROM URL TO state.
  useEffect(() => {
    const urlPage = getPageFromURL()
    const urlLimit = getItemsPerPageFromURL()

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(urlPage)
    setItemsPerPageState(urlLimit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Update URL with new query params
  const updateURL = useCallback(
    (page: number, limit: number) => {
      const params = new URLSearchParams(searchParams.toString())

      // Update page param
      if (page === 1) {
        params.delete('page')
      } else {
        params.set('page', page.toString())
      }

      // Update limit param
      if (limit === defaultItemsPerPage) {
        params.delete('limit')
      } else {
        params.set('limit', limit.toString())
      }

      const newURL = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
      router.push(newURL, { scroll: false })

      // Scroll to top if enabled
      if (scrollToTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [pathname, router, searchParams, defaultItemsPerPage, scrollToTop]
  )

  // Set page
  const setPage = useCallback(
    (page: number) => {
      // Validate page number
      const validPage = Math.max(1, Math.min(page, totalPages))
      setCurrentPage(validPage)
      updateURL(validPage, itemsPerPage)
    },
    [totalPages, itemsPerPage, updateURL]
  )

  // Validate current page when total pages changes
  // Note: Only validate when totalCount > 0 (data has loaded)
  // This prevents resetting to page 1 while data is still loading
  useEffect(() => {
    if (totalCount > 0 && currentPage > totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(totalPages)
      updateURL(totalPages, itemsPerPage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, totalCount])

  // Set items per page
  const setItemsPerPage = useCallback(
    (limit: number) => {
      // Validate limit
      const validLimit = Math.max(minItemsPerPage, Math.min(limit, maxItemsPerPage))
      setItemsPerPageState(validLimit)

      // Reset to page 1 when changing items per page
      setCurrentPage(1)
      updateURL(1, validLimit)
    },
    [minItemsPerPage, maxItemsPerPage, updateURL]
  )

  // Navigation helpers
  const goToFirstPage = useCallback(() => setPage(1), [setPage])
  const goToLastPage = useCallback(() => setPage(totalPages), [setPage, totalPages])
  const goToNextPage = useCallback(() => {
    if (canGoNext) {
      setPage(currentPage + 1)
    }
  }, [canGoNext, currentPage, setPage])
  const goToPreviousPage = useCallback(() => {
    if (canGoPrevious) {
      setPage(currentPage - 1)
    }
  }, [canGoPrevious, currentPage, setPage])

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    offset,
    setPage,
    setItemsPerPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
  }
}
