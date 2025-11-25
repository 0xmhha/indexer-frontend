'use client'

import { useState, useCallback } from 'react'
import { PAGINATION } from '@/lib/config/constants'

const STORAGE_KEY = 'search_history'
const MAX_HISTORY_ITEMS = PAGINATION.SEARCH_LIMIT

export interface SearchHistoryItem {
  query: string
  type: 'blockNumber' | 'hash' | 'address'
  timestamp: number
}

interface UseSearchHistoryResult {
  history: SearchHistoryItem[]
  addToHistory: (query: string, type: 'blockNumber' | 'hash' | 'address') => void
  clearHistory: () => void
  removeFromHistory: (query: string) => void
}

/**
 * Hook for managing search history in localStorage
 */
export function useSearchHistory(): UseSearchHistoryResult {
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    // Initialize from localStorage synchronously
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored) as SearchHistoryItem[]
      }
    } catch (error) {
      console.error('[useSearchHistory] Failed to load history:', error)
    }
    return []
  })

  // Save history to localStorage
  const saveHistory = useCallback((items: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('[useSearchHistory] Failed to save history:', error)
    }
  }, [])

  const addToHistory = useCallback(
    (query: string, type: 'blockNumber' | 'hash' | 'address') => {
      setHistory((prev) => {
        // Remove duplicate if exists
        const filtered = prev.filter((item) => item.query !== query)

        // Add new item at the beginning
        const newItem: SearchHistoryItem = {
          query,
          type,
          timestamp: Date.now(),
        }

        const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)
        saveHistory(updated)
        return updated
      })
    },
    [saveHistory]
  )

  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('[useSearchHistory] Failed to clear history:', error)
    }
  }, [])

  const removeFromHistory = useCallback(
    (query: string) => {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.query !== query)
        saveHistory(updated)
        return updated
      })
    },
    [saveHistory]
  )

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  }
}
