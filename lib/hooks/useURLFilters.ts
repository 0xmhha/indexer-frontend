'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { TransactionFilterValues } from '@/components/transactions/TransactionFilters'

export interface UseURLFiltersResult {
  activeFilters: TransactionFilterValues | null
  currentPage: number
  itemsPerPage: number
  offset: number
  applyFilters: (filters: TransactionFilterValues, latestHeight?: bigint) => void
  resetFilters: () => void
  setPage: (page: number) => void
}

/**
 * Hook for managing transaction filters with URL persistence
 * Extracts URL parsing logic from address page (SRP)
 */
export function useURLFilters(defaultItemsPerPage = 20): UseURLFiltersResult {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse filters from URL
  const getFiltersFromURL = useCallback((): TransactionFilterValues | null => {
    const fromBlock = searchParams.get('fromBlock')
    const toBlock = searchParams.get('toBlock')
    const minValue = searchParams.get('minValue')
    const maxValue = searchParams.get('maxValue')
    const txType = searchParams.get('txType')
    const successOnly = searchParams.get('successOnly')

    if (fromBlock || toBlock || minValue || maxValue || txType || successOnly) {
      return {
        fromBlock: fromBlock || '',
        toBlock: toBlock || '',
        minValue: minValue || '',
        maxValue: maxValue || '',
        txType: txType ? parseInt(txType) : 0,
        successOnly: successOnly === 'true',
      }
    }
    return null
  }, [searchParams])

  // Parse pagination from URL
  const getPaginationFromURL = useCallback(() => {
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')
    const currentPage = pageParam ? parseInt(pageParam, 10) : 1
    const itemsPerPage = limitParam ? parseInt(limitParam, 10) : defaultItemsPerPage
    return { currentPage, itemsPerPage }
  }, [searchParams, defaultItemsPerPage])

  // State
  const [activeFilters, setActiveFilters] = useState<TransactionFilterValues | null>(() =>
    getFiltersFromURL()
  )

  const { currentPage, itemsPerPage } = getPaginationFromURL()
  const offset = (currentPage - 1) * itemsPerPage

  // Sync with URL changes
  useEffect(() => {
    setActiveFilters(getFiltersFromURL())
  }, [getFiltersFromURL])

  // Apply filters and update URL
  const applyFilters = useCallback(
    (filters: TransactionFilterValues, latestHeight?: bigint) => {
      const appliedFilters = {
        ...filters,
        fromBlock: filters.fromBlock || '0',
        toBlock: filters.toBlock || (latestHeight?.toString() || '0'),
      }
      setActiveFilters(appliedFilters)

      const params = new URLSearchParams()
      if (appliedFilters.fromBlock && appliedFilters.fromBlock !== '0') {
        params.set('fromBlock', appliedFilters.fromBlock)
      }
      if (appliedFilters.toBlock) {
        params.set('toBlock', appliedFilters.toBlock)
      }
      if (appliedFilters.minValue) {
        params.set('minValue', appliedFilters.minValue)
      }
      if (appliedFilters.maxValue) {
        params.set('maxValue', appliedFilters.maxValue)
      }
      if (appliedFilters.txType !== 0) {
        params.set('txType', appliedFilters.txType.toString())
      }
      if (appliedFilters.successOnly) {
        params.set('successOnly', 'true')
      }

      const queryString = params.toString()
      router.push(queryString ? `?${queryString}` : '', { scroll: false })
    },
    [router]
  )

  // Reset filters
  const resetFilters = useCallback(() => {
    setActiveFilters(null)
    router.push('', { scroll: false })
  }, [router])

  // Set page
  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (page > 1) {
        params.set('page', page.toString())
      } else {
        params.delete('page')
      }
      const queryString = params.toString()
      router.push(queryString ? `?${queryString}` : '', { scroll: false })
    },
    [router, searchParams]
  )

  return {
    activeFilters,
    currentPage,
    itemsPerPage,
    offset,
    applyFilters,
    resetFilters,
    setPage,
  }
}
