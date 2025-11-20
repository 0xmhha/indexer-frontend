'use client'

import { useState, FormEvent, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { detectInputType } from '@/lib/utils/validation'
import { useLatestHeight } from '@/lib/hooks/useLatestHeight'
import { useSearchHistory } from '@/lib/hooks/useSearchHistory'
import { formatNumber, formatHash } from '@/lib/utils/format'

interface Suggestion {
  type: 'block' | 'hint' | 'history'
  label: string
  value: string
  description?: string
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Get latest block height for recent blocks suggestions
  const { latestHeight } = useLatestHeight()
  const { history, addToHistory } = useSearchHistory()

  // Generate suggestions based on query
  const getSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = []
    const trimmed = query.trim()

    if (!trimmed) {
      // Show recent search history first
      if (history.length > 0) {
        const recentHistory = history.slice(0, 5)
        for (const item of recentHistory) {
          const typeLabel = item.type === 'blockNumber' ? 'Block' : item.type === 'hash' ? 'Hash' : 'Address'
          suggestions.push({
            type: 'history',
            label: item.type === 'hash' || item.type === 'address' ? formatHash(item.query) : item.query,
            value: item.query,
            description: `Recent ${typeLabel}`,
          })
        }
      }

      // Show recent blocks when empty
      if (latestHeight) {
        const blockNumber = latestHeight
        for (let i = 0; i < 3; i++) {
          const num = blockNumber - BigInt(i)
          if (num >= BigInt(0)) {
            suggestions.push({
              type: 'block',
              label: `Block #${formatNumber(num)}`,
              value: num.toString(),
              description: i === 0 ? 'Latest block' : `${i} blocks ago`,
            })
          }
        }
      }

      // Add format hints
      suggestions.push({
        type: 'hint',
        label: 'Block Number',
        value: '',
        description: 'e.g., 12345 or 0x3039',
      })
      suggestions.push({
        type: 'hint',
        label: 'Transaction Hash',
        value: '',
        description: '0x followed by 64 hex characters',
      })
      suggestions.push({
        type: 'hint',
        label: 'Address',
        value: '',
        description: '0x followed by 40 hex characters',
      })
    } else {
      // Filter suggestions based on query
      if (latestHeight) {
        const blockNumber = latestHeight
        // Show matching recent blocks
        if (/^\d+$/.test(trimmed) || /^0x[\da-f]*$/i.test(trimmed)) {
          for (let i = 0; i < 10; i++) {
            const num = blockNumber - BigInt(i)
            if (num >= BigInt(0)) {
              const numStr = num.toString()
              if (numStr.includes(trimmed) || `0x${num.toString(16)}`.toLowerCase().includes(trimmed.toLowerCase())) {
                suggestions.push({
                  type: 'block',
                  label: `Block #${formatNumber(num)}`,
                  value: numStr,
                  description: i === 0 ? 'Latest block' : `${i} blocks ago`,
                })
                if (suggestions.length >= 5) break
              }
            }
          }
        }
      }

      // Show format hint based on what they're typing
      const detectedType = detectInputType(trimmed)
      if (detectedType === 'blockNumber') {
        suggestions.push({
          type: 'hint',
          label: '✓ Valid block number format',
          value: '',
          description: 'Press Enter to search',
        })
      } else if (detectedType === 'hash') {
        suggestions.push({
          type: 'hint',
          label: '✓ Valid hash format',
          value: '',
          description: 'Could be block or transaction hash',
        })
      } else if (detectedType === 'address') {
        suggestions.push({
          type: 'hint',
          label: '✓ Valid address format',
          value: '',
          description: 'Press Enter to search',
        })
      } else if (trimmed.length > 0) {
        suggestions.push({
          type: 'hint',
          label: 'Invalid format',
          value: '',
          description: 'Enter block number, hash (0x...), or address (0x...)',
        })
      }
    }

    return suggestions
  }

  const suggestions = getSuggestions()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setShowSuggestions(false)

    const trimmed = query.trim()
    if (!trimmed) {
      setError('Please enter a search query')
      return
    }

    const type = detectInputType(trimmed)

    if (!type) {
      setError('Invalid input. Please enter a block number, block hash, transaction hash, or address')
      return
    }

    navigateToResult(trimmed, type)
  }

  const navigateToResult = (value: string, type?: 'blockNumber' | 'hash' | 'address') => {
    const detectedType = type || detectInputType(value)

    if (!detectedType) {
      setError('Invalid input')
      return
    }

    // Save to search history
    addToHistory(value, detectedType)

    // Navigate based on detected type
    switch (detectedType) {
      case 'blockNumber':
        router.push(`/block/${value}`)
        break
      case 'hash':
        // Could be block hash or transaction hash, try transaction first
        router.push(`/tx/${value}`)
        break
      case 'address':
        router.push(`/address/${value}`)
        break
    }

    setQuery('')
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'block') {
      navigateToResult(suggestion.value, 'blockNumber')
    } else if (suggestion.type === 'history') {
      const detectedType = detectInputType(suggestion.value)
      if (detectedType) {
        navigateToResult(suggestion.value, detectedType)
      }
    } else if (suggestion.type === 'hint' && suggestion.value) {
      setQuery(suggestion.value)
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    const selectableSuggestions = suggestions.filter((s) => s.type === 'block' || s.type === 'history')

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < selectableSuggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      const suggestion = selectableSuggestions[selectedIndex]
      if (suggestion) {
        handleSuggestionClick(suggestion)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectableSuggestions = suggestions.filter((s) => s.type === 'block' || s.type === 'history')
  const activeDescendant = selectedIndex >= 0 ? `search-suggestion-${selectedIndex}` : undefined

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative" role="search">
        <label htmlFor="search-input" className="sr-only">
          Search by block number, transaction hash, or address
        </label>
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by Block / Txn Hash / Address"
          className="w-full border border-bg-tertiary bg-bg-secondary px-4 py-3 font-mono text-sm text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
          autoComplete="off"
          role="combobox"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={activeDescendant}
          aria-describedby={error ? 'search-error' : undefined}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent-blue px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-bg-primary transition-colors hover:bg-accent-cyan"
          aria-label="Submit search"
        >
          SEARCH
        </button>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            id="search-suggestions"
            role="listbox"
            aria-label="Search suggestions"
            className="absolute top-full left-0 right-0 mt-1 border border-bg-tertiary bg-bg-secondary shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => {
              const selectableIndex = (suggestion.type === 'block' || suggestion.type === 'history') ? selectableSuggestions.indexOf(suggestion) : -1
              const isSelected = selectableIndex === selectedIndex
              const isSelectable = suggestion.type === 'block' || suggestion.type === 'history'

              return (
                <div
                  key={`${suggestion.type}-${suggestion.label}-${index}`}
                  id={isSelectable ? `search-suggestion-${selectableIndex}` : undefined}
                  role={isSelectable ? 'option' : 'presentation'}
                  aria-selected={isSelectable ? isSelected : undefined}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`
                    px-4 py-3 border-b border-bg-tertiary last:border-b-0
                    ${isSelectable ? 'cursor-pointer hover:bg-bg-tertiary' : 'cursor-default'}
                    ${isSelected ? 'bg-bg-tertiary' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div
                        className={`font-mono text-sm ${
                          isSelectable ? 'text-accent-blue' : 'text-text-secondary'
                        }`}
                      >
                        {suggestion.type === 'history' && <span className="text-text-muted mr-2" aria-hidden="true">↺</span>}
                        {suggestion.label}
                      </div>
                      {suggestion.description && (
                        <div className="font-mono text-xs text-text-muted mt-1">{suggestion.description}</div>
                      )}
                    </div>
                    {isSelectable && (
                      <div className="font-mono text-xs text-text-muted" aria-hidden="true">→</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </form>
      {error && <p id="search-error" className="mt-2 font-mono text-xs text-error" role="alert">{error}</p>}
    </div>
  )
}
