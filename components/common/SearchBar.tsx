'use client'

import { useState, FormEvent, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { detectInputType } from '@/lib/utils/validation'
import { useLatestHeight } from '@/lib/hooks/useLatestHeight'
import { useSearchHistory } from '@/lib/hooks/useSearchHistory'
import {
  useSearchSuggestions,
  getSelectableSuggestions,
  type Suggestion,
} from '@/lib/hooks/useSearchSuggestions'

// ============================================================
// Sub-Components
// ============================================================

function SuggestionItem({
  suggestion,
  isSelected,
  isSelectable,
  selectableIndex,
  onClick,
}: {
  suggestion: Suggestion
  isSelected: boolean
  isSelectable: boolean
  selectableIndex: number
  onClick: () => void
}) {
  return (
    <div
      id={isSelectable ? `search-suggestion-${selectableIndex}` : undefined}
      role={isSelectable ? 'option' : 'presentation'}
      aria-selected={isSelectable ? isSelected : undefined}
      onClick={onClick}
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
            {suggestion.type === 'history' && (
              <span className="text-text-muted mr-2" aria-hidden="true">↺</span>
            )}
            {suggestion.label}
          </div>
          {suggestion.description && (
            <div className="font-mono text-xs text-text-muted mt-1">
              {suggestion.description}
            </div>
          )}
        </div>
        {isSelectable && (
          <div className="font-mono text-xs text-text-muted" aria-hidden="true">→</div>
        )}
      </div>
    </div>
  )
}

function SuggestionsDropdown({
  suggestions,
  selectedIndex,
  onSuggestionClick,
  suggestionsRef,
}: {
  suggestions: Suggestion[]
  selectedIndex: number
  onSuggestionClick: (suggestion: Suggestion) => void
  suggestionsRef: React.RefObject<HTMLDivElement>
}) {
  const selectableSuggestions = getSelectableSuggestions(suggestions)

  return (
    <div
      ref={suggestionsRef}
      id="search-suggestions"
      role="listbox"
      aria-label="Search suggestions"
      className="absolute top-full left-0 right-0 mt-1 border border-bg-tertiary bg-bg-secondary shadow-lg z-50 max-h-96 overflow-y-auto"
    >
      {suggestions.map((suggestion, index) => {
        const selectableIndex = selectableSuggestions.indexOf(suggestion)
        const isSelectable = selectableIndex !== -1
        const isSelected = selectableIndex === selectedIndex

        return (
          <SuggestionItem
            key={`${suggestion.type}-${suggestion.label}-${index}`}
            suggestion={suggestion}
            isSelected={isSelected}
            isSelectable={isSelectable}
            selectableIndex={selectableIndex}
            onClick={() => onSuggestionClick(suggestion)}
          />
        )
      })}
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { latestHeight } = useLatestHeight()
  const { history, addToHistory } = useSearchHistory()

  const suggestions = useSearchSuggestions({
    query,
    latestHeight,
    history,
  })

  const selectableSuggestions = getSelectableSuggestions(suggestions)

  // Navigation handler
  const navigateToResult = useCallback(
    (value: string, type?: 'blockNumber' | 'hash' | 'address') => {
      const detectedType = type || detectInputType(value)
      if (!detectedType) {
        setError('Invalid input')
        return
      }

      addToHistory(value, detectedType)

      const routes: Record<'blockNumber' | 'hash' | 'address', string> = {
        blockNumber: `/block/${value}`,
        hash: `/tx/${value}`,
        address: `/address/${value}`,
      }

      router.push(routes[detectedType as 'blockNumber' | 'hash' | 'address'])
      setQuery('')
      setShowSuggestions(false)
    },
    [router, addToHistory]
  )

  // Suggestion click handler
  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      if (suggestion.type === 'block') {
        navigateToResult(suggestion.value, 'blockNumber')
      } else if (suggestion.type === 'history') {
        const detectedType = detectInputType(suggestion.value)
        if (detectedType) {
          navigateToResult(suggestion.value, detectedType)
        }
      } else if (suggestion.type === 'search-all') {
        router.push(`/search?q=${encodeURIComponent(suggestion.value)}`)
        setQuery('')
        setShowSuggestions(false)
      } else if (suggestion.type === 'hint' && suggestion.value) {
        setQuery(suggestion.value)
        setShowSuggestions(false)
      }
    },
    [navigateToResult, router]
  )

  // Form submit handler
  const handleSubmit = useCallback(
    (e: FormEvent) => {
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
    },
    [query, navigateToResult]
  )

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions) {return}

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < selectableSuggestions.length - 1 ? prev + 1 : prev
        )
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
    },
    [showSuggestions, selectableSuggestions, selectedIndex, handleSuggestionClick]
  )

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isOutsideSuggestions = suggestionsRef.current && !suggestionsRef.current.contains(target)
      const isOutsideInput = inputRef.current && !inputRef.current.contains(target)

      if (isOutsideSuggestions && isOutsideInput) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

        {showSuggestions && suggestions.length > 0 && (
          <SuggestionsDropdown
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            onSuggestionClick={handleSuggestionClick}
            suggestionsRef={suggestionsRef}
          />
        )}
      </form>
      {error && (
        <p id="search-error" className="mt-2 font-mono text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
