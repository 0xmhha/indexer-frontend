'use client'

import { useState, useCallback } from 'react'
import { useCurrentEpoch, useEpochByNumber } from '@/lib/hooks/useWBFT'

// ============================================================
// Types
// ============================================================

export interface UseEpochSearchResult {
  // Search state
  searchInput: string
  searchEpoch: string
  setSearchInput: (value: string) => void

  // Actions
  handleSearch: (e: React.FormEvent) => void
  handleViewCurrent: () => void

  // Data
  displayedEpoch: ReturnType<typeof useCurrentEpoch>['currentEpoch']
  currentEpoch: ReturnType<typeof useCurrentEpoch>['currentEpoch']
  loading: boolean
  error: Error | null
  currentLoading: boolean

  // Refetch
  refetchCurrent: () => void
}

// ============================================================
// Hook
// ============================================================

/**
 * Custom hook for epoch search logic (SRP: Only handles search state)
 */
export function useEpochSearch(): UseEpochSearchResult {
  const [searchEpoch, setSearchEpoch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const {
    currentEpoch,
    loading: currentLoading,
    error: currentError,
    refetch: refetchCurrent,
  } = useCurrentEpoch()

  const {
    epoch: searchedEpoch,
    loading: searchLoading,
    error: searchError,
  } = useEpochByNumber(searchEpoch)

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchInput.trim()) {
        setSearchEpoch(searchInput.trim())
      }
    },
    [searchInput]
  )

  const handleViewCurrent = useCallback(() => {
    setSearchEpoch('')
    setSearchInput('')
  }, [])

  const displayedEpoch = searchEpoch ? searchedEpoch : currentEpoch
  const loading = searchEpoch ? searchLoading : currentLoading
  const error = (searchEpoch ? searchError : currentError) ?? null

  return {
    searchInput,
    searchEpoch,
    setSearchInput,
    handleSearch,
    handleViewCurrent,
    displayedEpoch,
    currentEpoch,
    loading,
    error,
    currentLoading,
    refetchCurrent,
  }
}
