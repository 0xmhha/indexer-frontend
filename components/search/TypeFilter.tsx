'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { SearchResultType } from '@/lib/graphql/queries/search'
import { TYPE_LABELS, TYPE_ICONS } from '@/components/search/SearchResultCard'

// ============================================================
// Types
// ============================================================

interface TypeFilterProps {
  selectedTypes: SearchResultType[]
  onTypeToggle: (type: SearchResultType) => void
  onClearFilters: () => void
}

// ============================================================
// Sub-Components
// ============================================================

/**
 * Individual type filter button
 */
function TypeFilterButton({
  type,
  isSelected,
  onToggle,
}: {
  type: SearchResultType
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`
        border px-4 py-2 font-mono text-sm transition-colors
        ${
          isSelected
            ? 'border-accent-blue bg-accent-blue text-bg-primary'
            : 'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-blue hover:bg-bg-tertiary'
        }
      `}
      aria-pressed={isSelected}
    >
      {TYPE_ICONS[type]} {TYPE_LABELS[type]}
    </button>
  )
}

/**
 * Clear filters button
 */
function ClearFiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="border border-bg-tertiary bg-bg-secondary px-4 py-2 font-mono text-sm text-text-muted transition-colors hover:border-error hover:text-error"
    >
      Clear Filters
    </button>
  )
}

// ============================================================
// Main Component
// ============================================================

/**
 * Type filter card (SRP: Only handles type filtering UI)
 */
export function TypeFilter({ selectedTypes, onTypeToggle, onClearFilters }: TypeFilterProps) {
  const allTypes = Object.keys(TYPE_LABELS) as SearchResultType[]

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filter by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {allTypes.map((type) => (
            <TypeFilterButton
              key={type}
              type={type}
              isSelected={selectedTypes.includes(type)}
              onToggle={() => onTypeToggle(type)}
            />
          ))}
          {selectedTypes.length > 0 && <ClearFiltersButton onClick={onClearFilters} />}
        </div>
      </CardContent>
    </Card>
  )
}
