'use client'

import Link from 'next/link'
import { useState } from 'react'
import { env } from '@/lib/config/env'
import { SearchBar } from '@/components/common/SearchBar'

export function Header() {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-bg-tertiary bg-bg-primary/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-accent-blue bg-accent-blue/10">
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
          <div className="hidden flex-1 max-w-2xl mx-8 lg:block">
            <SearchBar />
          </div>

          {/* Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
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
          </nav>

          {/* Chain Info and Mobile Search Toggle */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="lg:hidden border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue"
              aria-label="Toggle search"
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
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            <div className="hidden items-center gap-2 md:flex">
              <div className="h-2 w-2 animate-pulse rounded-full bg-success"></div>
              <span className="font-mono text-xs text-text-secondary">Chain ID: {env.chainId}</span>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="pb-4 lg:hidden">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  )
}
