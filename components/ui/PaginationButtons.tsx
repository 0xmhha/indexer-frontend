'use client'

import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

// ============================================================
// Types
// ============================================================

interface NavButtonProps {
  onClick: () => void
  disabled: boolean | undefined
  label: string
  title: string
  children: React.ReactNode
}

interface PageButtonProps {
  page: number
  isCurrent: boolean
  onClick: () => void
  disabled: boolean | undefined
}

// ============================================================
// Base Button Styles
// ============================================================

const navButtonClasses =
  'flex h-9 items-center gap-1.5 rounded border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-secondary shadow-sm transition-all hover:border-accent-blue hover:bg-bg-tertiary hover:text-accent-blue hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-blue/20 disabled:cursor-not-allowed disabled:opacity-40'

const pageButtonBaseClasses =
  'flex h-9 min-w-[36px] items-center justify-center rounded border px-3 py-2 font-mono text-xs shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent-blue/20'

const pageButtonCurrentClasses =
  'border-accent-blue bg-accent-blue text-bg-primary shadow-md shadow-accent-blue/20'

const pageButtonNormalClasses =
  'border-bg-tertiary bg-bg-secondary text-text-secondary hover:border-accent-blue hover:bg-bg-tertiary hover:text-accent-blue hover:shadow-md'

// ============================================================
// Navigation Buttons
// ============================================================

function NavButton({ onClick, disabled, label, title, children }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={navButtonClasses}
      disabled={disabled}
      aria-label={label}
      title={title}
    >
      {children}
    </button>
  )
}

export function FirstPageButton({
  onClick,
  disabled,
}: {
  onClick: () => void
  disabled: boolean | undefined
}) {
  return (
    <NavButton
      onClick={onClick}
      disabled={disabled}
      label="Go to first page"
      title="First page (Home key)"
    >
      <ChevronsLeft className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">First</span>
    </NavButton>
  )
}

export function PrevPageButton({
  onClick,
  disabled,
}: {
  onClick: () => void
  disabled: boolean | undefined
}) {
  return (
    <NavButton
      onClick={onClick}
      disabled={disabled}
      label="Go to previous page"
      title="Previous page (← key)"
    >
      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Prev</span>
    </NavButton>
  )
}

export function NextPageButton({
  onClick,
  disabled,
}: {
  onClick: () => void
  disabled: boolean | undefined
}) {
  return (
    <NavButton
      onClick={onClick}
      disabled={disabled}
      label="Go to next page"
      title="Next page (→ key)"
    >
      <span className="hidden sm:inline">Next</span>
      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
    </NavButton>
  )
}

export function LastPageButton({
  onClick,
  disabled,
  totalPages,
}: {
  onClick: () => void
  disabled: boolean | undefined
  totalPages: number
}) {
  return (
    <NavButton
      onClick={onClick}
      disabled={disabled}
      label={`Go to last page, page ${totalPages}`}
      title="Last page (End key)"
    >
      <span className="hidden sm:inline">Last</span>
      <ChevronsRight className="h-3.5 w-3.5" aria-hidden="true" />
    </NavButton>
  )
}

// ============================================================
// Page Button
// ============================================================

export function PageButton({ page, isCurrent, onClick, disabled }: PageButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        pageButtonBaseClasses,
        isCurrent ? pageButtonCurrentClasses : pageButtonNormalClasses
      )}
      aria-label={`${isCurrent ? 'Current page, ' : ''}Page ${page}`}
      aria-current={isCurrent ? 'page' : undefined}
      disabled={disabled}
    >
      {page}
    </button>
  )
}

// ============================================================
// Ellipsis
// ============================================================

export function PageEllipsis() {
  return (
    <span className="px-1 font-mono text-xs text-text-muted" aria-hidden="true">
      ...
    </span>
  )
}
