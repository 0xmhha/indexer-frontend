'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { UI } from '@/lib/config/constants'
import { SearchBar } from '@/components/common/SearchBar'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { NetworkSelector } from '@/components/common/NetworkSelector'
import { useNetworkStore, selectCurrentNetwork } from '@/stores/networkStore'

export function Header() {
  const [showSearch, setShowSearch] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const currentNetwork = useNetworkStore(selectCurrentNetwork)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showMoreMenu) {return}

    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMoreMenu])

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= UI.MOBILE_BREAKPOINT) {
        setShowMobileMenu(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-bg-tertiary bg-bg-primary/95 backdrop-blur" role="banner">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0" aria-label="Stable-One Explorer Home">
            <div className="flex h-8 w-8 items-center justify-center border border-accent-blue bg-accent-blue/10" aria-hidden="true">
              <span className="font-mono text-xs font-bold text-accent-blue">SI</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-mono text-sm font-bold text-accent-blue">
                {(currentNetwork?.chain.name ?? 'STABLE-ONE').toUpperCase()}
              </span>
              <span className="annotation">EXPLORER</span>
            </div>
          </Link>

          {/* Desktop Search - Increased width */}
          <div className="hidden flex-1 max-w-3xl mx-4 lg:block" role="search">
            <SearchBar />
          </div>

          {/* Navigation - Core menu items only */}
          <nav className="hidden items-center gap-4 xl:gap-6 md:flex flex-shrink-0" aria-label="Main navigation">
            <Link
              href="/blocks"
              className="font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-blue whitespace-nowrap"
            >
              Blocks
            </Link>
            <Link
              href="/txs"
              className="font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-blue whitespace-nowrap"
            >
              Txs
            </Link>
            <Link
              href="/stats"
              className="font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-blue whitespace-nowrap"
            >
              Stats
            </Link>

            {/* More Dropdown Menu */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-blue whitespace-nowrap flex items-center gap-1"
                aria-expanded={showMoreMenu}
                aria-haspopup="true"
              >
                More
                <svg
                  className={`w-3 h-3 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-56 border border-bg-tertiary bg-bg-primary shadow-lg">
                  {/* Tools Section */}
                  <div className="border-b border-bg-tertiary">
                    <div className="px-4 py-2 font-mono text-xs text-text-muted uppercase tracking-wider">
                      Tools
                    </div>
                    <Link
                      href="/gas"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                    >
                      Gas Tools
                    </Link>
                    <Link
                      href="/contract"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                    >
                      Contract
                    </Link>
                    <Link
                      href="/contracts"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                    >
                      Contracts List
                    </Link>
                  </div>

                  {/* Blockchain Section */}
                  <div className="border-b border-bg-tertiary">
                    <div className="px-4 py-2 font-mono text-xs text-text-muted uppercase tracking-wider">
                      Blockchain
                    </div>
                    <Link
                      href="/system-contracts"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                    >
                      System Contracts
                    </Link>
                    <Link
                      href="/validators"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                    >
                      Validators
                    </Link>
                    <Link
                      href="/consensus"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                    >
                      Consensus
                    </Link>
                    <Link
                      href="/epochs"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                    >
                      Epochs
                    </Link>
                    <Link
                      href="/wbft"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                    >
                      WBFT
                    </Link>
                  </div>

                  {/* Other Section */}
                  <div>
                    <div className="px-4 py-2 font-mono text-xs text-text-muted uppercase tracking-wider">
                      Other
                    </div>
                    <Link
                      href="/governance"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                    >
                      Governance
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowMoreMenu(false)}
                      className="block px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                    >
                      ⚙ Settings
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Chain Info, Theme Toggle, Mobile Menu, and Mobile Search Toggle */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden border border-bg-tertiary bg-bg-secondary px-3 py-2 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue"
              aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={showMobileMenu}
              aria-controls="mobile-menu"
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
                {showMobileMenu ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>

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

            {/* Network Selector */}
            <div className="hidden md:flex">
              <NetworkSelector />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <nav id="mobile-menu" className="border-t border-bg-tertiary py-4 md:hidden" aria-label="Mobile navigation">
            <div className="space-y-1">
              {/* Core Menu Items */}
              <Link
                href="/blocks"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
              >
                Blocks
              </Link>
              <Link
                href="/txs"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
              >
                Transactions
              </Link>
              <Link
                href="/stats"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
              >
                Statistics
              </Link>

              {/* Tools Section */}
              <div className="border-t border-bg-tertiary mt-2 pt-2">
                <div className="px-4 py-2 font-mono text-xs text-text-muted uppercase tracking-wider">
                  Tools
                </div>
                <Link
                  href="/gas"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                >
                  Gas Tools
                </Link>
                <Link
                  href="/contract"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                >
                  Contract
                </Link>
                <Link
                  href="/contracts"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                >
                  Contracts List
                </Link>
              </div>

              {/* Blockchain Section */}
              <div className="border-t border-bg-tertiary mt-2 pt-2">
                <div className="px-4 py-2 font-mono text-xs text-text-muted uppercase tracking-wider">
                  Blockchain
                </div>
                <Link
                  href="/system-contracts"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                >
                  System Contracts
                </Link>
                <Link
                  href="/validators"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                >
                  Validators
                </Link>
                <Link
                  href="/consensus"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                >
                  Consensus
                </Link>
                <Link
                  href="/epochs"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                >
                  Epochs
                </Link>
                <Link
                  href="/wbft"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                >
                  WBFT
                </Link>
              </div>

              {/* Other Section */}
              <div className="border-t border-bg-tertiary mt-2 pt-2">
                <div className="px-4 py-2 font-mono text-xs text-text-muted uppercase tracking-wider">
                  Other
                </div>
                <Link
                  href="/governance"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                >
                  Governance
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-accent-blue"
                >
                  ⚙ Settings
                </Link>
              </div>
            </div>
          </nav>
        )}

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
