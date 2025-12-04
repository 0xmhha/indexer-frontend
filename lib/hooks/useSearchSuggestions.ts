'use client'

import { useMemo } from 'react'
import { detectInputType } from '@/lib/utils/validation'
import { formatNumber, formatHash } from '@/lib/utils/format'
import type { SearchHistoryItem } from '@/lib/hooks/useSearchHistory'
import { PAGINATION, UI, FORMATTING } from '@/lib/config/constants'

export interface Suggestion {
  type: 'block' | 'hint' | 'history' | 'search-all'
  label: string
  value: string
  description?: string
}

// ============================================================
// Suggestion Builders (SRP: Each builds specific suggestion type)
// ============================================================

const TYPE_LABELS: Record<string, string> = {
  blockNumber: 'Block',
  hash: 'Hash',
  address: 'Address',
}

function buildHistorySuggestions(history: SearchHistoryItem[]): Suggestion[] {
  return history.slice(0, PAGINATION.AUTOCOMPLETE_LIMIT).map((item) => {
    const typeLabel = TYPE_LABELS[item.type] ?? 'Unknown'
    const label =
      item.type === 'hash' || item.type === 'address'
        ? formatHash(item.query)
        : item.query

    return {
      type: 'history' as const,
      label,
      value: item.query,
      description: `Recent ${typeLabel}`,
    }
  })
}

function buildRecentBlockSuggestions(latestHeight: bigint, count = UI.MAX_VISIBLE_ALERTS): Suggestion[] {
  const suggestions: Suggestion[] = []
  for (let i = 0; i < count; i++) {
    const num = latestHeight - BigInt(i)
    if (num >= BigInt(0)) {
      suggestions.push({
        type: 'block',
        label: `Block #${formatNumber(num)}`,
        value: num.toString(),
        description: i === 0 ? 'Latest block' : `${i} blocks ago`,
      })
    }
  }
  return suggestions
}

function buildFormatHints(): Suggestion[] {
  return [
    {
      type: 'hint',
      label: 'Block Number',
      value: '',
      description: 'e.g., 12345 or 0x3039',
    },
    {
      type: 'hint',
      label: 'Transaction Hash',
      value: '',
      description: '0x followed by 64 hex characters',
    },
    {
      type: 'hint',
      label: 'Address',
      value: '',
      description: '0x followed by 40 hex characters',
    },
  ]
}

function buildMatchingBlockSuggestions(
  query: string,
  latestHeight: bigint,
  maxResults = PAGINATION.AUTOCOMPLETE_LIMIT
): Suggestion[] {
  const suggestions: Suggestion[] = []
  const isNumericOrHex = /^\d+$/.test(query) || /^0x[\da-f]*$/i.test(query)

  if (!isNumericOrHex) {return suggestions}

  for (let i = 0; i < 10 && suggestions.length < maxResults; i++) {
    const num = latestHeight - BigInt(i)
    if (num < BigInt(0)) {break}

    const numStr = num.toString()
    const hexStr = `0x${num.toString(FORMATTING.HEX_RADIX)}`.toLowerCase()
    const queryLower = query.toLowerCase()

    if (numStr.includes(query) || hexStr.includes(queryLower)) {
      suggestions.push({
        type: 'block',
        label: `Block #${formatNumber(num)}`,
        value: numStr,
        description: i === 0 ? 'Latest block' : `${i} blocks ago`,
      })
    }
  }

  return suggestions
}

function buildValidationHint(detectedType: string | null, query: string): Suggestion | null {
  if (detectedType === 'blockNumber') {
    return {
      type: 'hint',
      label: '✓ Valid block number format',
      value: '',
      description: 'Press Enter to search',
    }
  }
  if (detectedType === 'hash') {
    return {
      type: 'hint',
      label: '✓ Valid hash format',
      value: '',
      description: 'Could be block or transaction hash',
    }
  }
  if (detectedType === 'address') {
    return {
      type: 'hint',
      label: '✓ Valid address format',
      value: '',
      description: 'Press Enter to search',
    }
  }
  if (query.length > 0) {
    return {
      type: 'hint',
      label: 'Invalid format',
      value: '',
      description: 'Enter block number, hash (0x...), or address (0x...)',
    }
  }
  return null
}

function buildSearchAllSuggestion(query: string): Suggestion {
  return {
    type: 'search-all',
    label: '🔍 View All Results',
    value: query,
    description: 'See all matching blocks, transactions, and addresses',
  }
}

// ============================================================
// Main Hook
// ============================================================

interface UseSearchSuggestionsOptions {
  query: string
  latestHeight: bigint | null
  history: SearchHistoryItem[]
}

/**
 * Hook for generating search suggestions based on query
 */
export function useSearchSuggestions({
  query,
  latestHeight,
  history,
}: UseSearchSuggestionsOptions): Suggestion[] {
  return useMemo(() => {
    const trimmed = query.trim()

    // Empty query: show history, recent blocks, and format hints
    if (!trimmed) {
      const suggestions: Suggestion[] = []

      if (history.length > 0) {
        suggestions.push(...buildHistorySuggestions(history))
      }

      if (latestHeight) {
        suggestions.push(...buildRecentBlockSuggestions(latestHeight))
      }

      suggestions.push(...buildFormatHints())
      return suggestions
    }

    // Query present: show matching blocks, search-all option, and validation hints
    const suggestions: Suggestion[] = []
    const detectedType = detectInputType(trimmed)

    if (latestHeight) {
      suggestions.push(...buildMatchingBlockSuggestions(trimmed, latestHeight))
    }

    if (detectedType) {
      suggestions.push(buildSearchAllSuggestion(trimmed))
    }

    const validationHint = buildValidationHint(detectedType, trimmed)
    if (validationHint) {
      suggestions.push(validationHint)
    }

    return suggestions
  }, [query, latestHeight, history])
}

/**
 * Get selectable suggestions (excludes hints)
 */
export function getSelectableSuggestions(suggestions: Suggestion[]): Suggestion[] {
  return suggestions.filter(
    (s) => s.type === 'block' || s.type === 'history' || s.type === 'search-all'
  )
}
