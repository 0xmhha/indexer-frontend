'use client'

import { useState, useCallback, useMemo } from 'react'
import type { LogFilter } from '@/lib/hooks/useSubscriptions'

// ============================================================
// Types
// ============================================================

export interface LogFilterState {
  address: string
  selectedEvent: string
  fromBlock: string
  toBlock: string
}

export interface UseLogFiltersResult {
  filterState: LogFilterState
  activeFilter: LogFilter | undefined
  hasActiveFilters: boolean
  setAddress: (value: string) => void
  setSelectedEvent: (value: string) => void
  setFromBlock: (value: string) => void
  setToBlock: (value: string) => void
  applyFilters: () => void
  clearFilters: () => void
}

// ============================================================
// Constants
// ============================================================

export const COMMON_EVENTS = [
  { name: 'Transfer', signature: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' },
  { name: 'Approval', signature: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925' },
  { name: 'Swap', signature: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822' },
  { name: 'Deposit', signature: '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c' },
  { name: 'Withdrawal', signature: '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65' },
] as const

// ============================================================
// Helper Functions
// ============================================================

/**
 * Build LogFilter from filter state
 */
function buildLogFilter(state: LogFilterState): LogFilter | undefined {
  const filter: LogFilter = {}

  if (state.address.trim()) {
    filter.address = state.address.trim()
  }

  if (state.selectedEvent) {
    filter.topics = [state.selectedEvent]
  }

  if (state.fromBlock.trim()) {
    filter.fromBlock = state.fromBlock.trim()
  }

  if (state.toBlock.trim()) {
    filter.toBlock = state.toBlock.trim()
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

/**
 * Check if any filters have values
 */
function checkHasFilters(state: LogFilterState): boolean {
  return (
    state.address.trim() !== '' ||
    state.selectedEvent !== '' ||
    state.fromBlock.trim() !== '' ||
    state.toBlock.trim() !== ''
  )
}

/**
 * Get event name by signature
 */
export function getEventName(signature: string): string | undefined {
  return COMMON_EVENTS.find((e) => e.signature === signature)?.name
}

// ============================================================
// Hook
// ============================================================

/**
 * Custom hook for managing log filter state
 */
export function useLogFilters(): UseLogFiltersResult {
  const [address, setAddress] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [fromBlock, setFromBlock] = useState('')
  const [toBlock, setToBlock] = useState('')
  const [activeFilter, setActiveFilter] = useState<LogFilter | undefined>(undefined)

  const filterState = useMemo(
    () => ({ address, selectedEvent, fromBlock, toBlock }),
    [address, selectedEvent, fromBlock, toBlock]
  )

  const hasActiveFilters = useMemo(() => checkHasFilters(filterState), [filterState])

  const applyFilters = useCallback(() => {
    setActiveFilter(buildLogFilter(filterState))
  }, [filterState])

  const clearFilters = useCallback(() => {
    setAddress('')
    setSelectedEvent('')
    setFromBlock('')
    setToBlock('')
    setActiveFilter(undefined)
  }, [])

  return {
    filterState,
    activeFilter,
    hasActiveFilters,
    setAddress,
    setSelectedEvent,
    setFromBlock,
    setToBlock,
    applyFilters,
    clearFilters,
  }
}
