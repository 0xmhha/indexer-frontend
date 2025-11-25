'use client'

import { useState, useMemo, useCallback } from 'react'
import { weiToGwei } from '@/lib/utils/gas'
import type { Transaction } from '@/types/graphql'

export interface TransactionFilter {
  type?: number
  fromAddress?: string
  toAddress?: string
  minGasPrice?: number
  maxGasPrice?: number
  minValue?: number
  maxValue?: number
}

export interface FilterFormState {
  selectedType: number
  fromAddress: string
  toAddress: string
  minGasPrice: string
  maxGasPrice: string
  minValue: string
  maxValue: string
}

export interface UsePendingTxFiltersResult {
  formState: FilterFormState
  activeFilter: TransactionFilter | undefined
  hasActiveFilters: boolean
  setFormField: <K extends keyof FilterFormState>(field: K, value: FilterFormState[K]) => void
  applyFilters: () => void
  clearFilters: () => void
  filterTransactions: (transactions: Transaction[]) => Transaction[]
}

// ============================================================
// Filter Logic (SRP: Pure filter functions)
// ============================================================

function matchesType(tx: Transaction, filterType?: number): boolean {
  return filterType === undefined || tx.type === filterType
}

function matchesFromAddress(tx: Transaction, filterAddr?: string): boolean {
  if (!filterAddr) return true
  return tx.from.toLowerCase().includes(filterAddr.toLowerCase())
}

function matchesToAddress(tx: Transaction, filterAddr?: string): boolean {
  if (!filterAddr) return true
  return tx.to ? tx.to.toLowerCase().includes(filterAddr.toLowerCase()) : false
}

function matchesGasPrice(tx: Transaction, min?: number, max?: number): boolean {
  const txGasPrice = tx.gasPrice || tx.maxFeePerGas
  if (!txGasPrice) return true

  const gasPriceGwei = weiToGwei(txGasPrice)
  if (min !== undefined && gasPriceGwei < min) return false
  if (max !== undefined && gasPriceGwei > max) return false
  return true
}

function matchesValue(tx: Transaction, min?: number, max?: number): boolean {
  const valueEth = Number(tx.value) / 1e18
  if (min !== undefined && valueEth < min) return false
  if (max !== undefined && valueEth > max) return false
  return true
}

function applyFilter(tx: Transaction, filter: TransactionFilter): boolean {
  return (
    matchesType(tx, filter.type) &&
    matchesFromAddress(tx, filter.fromAddress) &&
    matchesToAddress(tx, filter.toAddress) &&
    matchesGasPrice(tx, filter.minGasPrice, filter.maxGasPrice) &&
    matchesValue(tx, filter.minValue, filter.maxValue)
  )
}

// ============================================================
// Hook
// ============================================================

const initialFormState: FilterFormState = {
  selectedType: -1,
  fromAddress: '',
  toAddress: '',
  minGasPrice: '',
  maxGasPrice: '',
  minValue: '',
  maxValue: '',
}

/**
 * Hook for managing pending transaction filters
 */
export function usePendingTxFilters(): UsePendingTxFiltersResult {
  const [formState, setFormState] = useState<FilterFormState>(initialFormState)
  const [activeFilter, setActiveFilter] = useState<TransactionFilter | undefined>(undefined)

  const setFormField = useCallback(<K extends keyof FilterFormState>(
    field: K,
    value: FilterFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }, [])

  const hasActiveFilters = useMemo(() => {
    return (
      formState.selectedType !== -1 ||
      formState.fromAddress.trim() !== '' ||
      formState.toAddress.trim() !== '' ||
      formState.minGasPrice.trim() !== '' ||
      formState.maxGasPrice.trim() !== '' ||
      formState.minValue.trim() !== '' ||
      formState.maxValue.trim() !== ''
    )
  }, [formState])

  const applyFilters = useCallback(() => {
    const filter: TransactionFilter = {}

    if (formState.selectedType !== -1) {
      filter.type = formState.selectedType
    }
    if (formState.fromAddress.trim()) {
      filter.fromAddress = formState.fromAddress.trim()
    }
    if (formState.toAddress.trim()) {
      filter.toAddress = formState.toAddress.trim()
    }
    if (formState.minGasPrice.trim()) {
      filter.minGasPrice = parseFloat(formState.minGasPrice)
    }
    if (formState.maxGasPrice.trim()) {
      filter.maxGasPrice = parseFloat(formState.maxGasPrice)
    }
    if (formState.minValue.trim()) {
      filter.minValue = parseFloat(formState.minValue)
    }
    if (formState.maxValue.trim()) {
      filter.maxValue = parseFloat(formState.maxValue)
    }

    setActiveFilter(Object.keys(filter).length > 0 ? filter : undefined)
  }, [formState])

  const clearFilters = useCallback(() => {
    setFormState(initialFormState)
    setActiveFilter(undefined)
  }, [])

  const filterTransactions = useCallback(
    (transactions: Transaction[]): Transaction[] => {
      if (!activeFilter) return transactions
      return transactions.filter((tx) => applyFilter(tx, activeFilter))
    },
    [activeFilter]
  )

  return {
    formState,
    activeFilter,
    hasActiveFilters,
    setFormField,
    applyFilters,
    clearFilters,
    filterTransactions,
  }
}
