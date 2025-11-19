'use client'

import Link from 'next/link'
import { useState } from 'react'
import { env } from '@/lib/config/env'
import { SearchBar } from '@/components/common/SearchBar'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export function Header() {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-bg-tertiary bg-bg-primary/95 backdrop-blur" role="banner">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-3" aria-label="Stable-One Explorer Home">
            <div className="flex h-8 w-8 items-center justify-center border border-accent-blue bg-accent-blue/10" aria-hidden="true">
              <span className="font-mono text-xs font-bold text-accent-blue">SI</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold text-accent-blue">
                {env.chainName.toUpperCase()}
              </span>
              <span className="annotation">EXPLORER</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden flex-1 max-w-2xl mx-8 lg:block" role="search">
            <SearchBar />
          </div>

          {/* Navigation */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            <Link
              href="/blocks"
              className="font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-blue"
            >
              Blocks
            </Link>
            <Link
              href="/txs"
              className="font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-blue"
            >
              Transactions
            </Link>
            <Link
              href="/stats"
              className="font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-blue"
            >
              Statistics
            </Link>
            <Link
              href="/contract"
              className="font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-blue"
            >
              Contract
            </Link>
          </nav>

          {/* Chain Info, Theme Toggle, and Mobile Search Toggle */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="lg:hidden border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue"
              aria-label={showSearch ? 'Close search' : 'Open search'}
              aria-expanded={showSearch}
              aria-controls="mobile-search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            <div className="hidden items-center gap-2 md:flex" role="status" aria-live="polite">
              <div className="h-2 w-2 animate-pulse rounded-full bg-success" aria-hidden="true"></div>
              <span className="font-mono text-xs text-text-secondary">Chain ID: {env.chainId}</span>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div id="mobile-search" className="pb-4 lg:hidden" role="search">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  )
}
