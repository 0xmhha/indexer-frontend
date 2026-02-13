'use client'

import Link from 'next/link'
import { useState, useRef, useEffect, useCallback } from 'react'
import { UI } from '@/lib/config/constants'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { SearchBar } from '@/components/common/SearchBar'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { NetworkSelector } from '@/components/common/NetworkSelector'
import { useNetworkStore, selectCurrentNetwork } from '@/stores/networkStore'
import { CORE_NAV_LINKS } from './navigation'
import { DesktopMoreMenu } from './DesktopMoreMenu'
import { MobileNav } from './MobileNav'

export function Header() {
  const [showSearch, setShowSearch] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const currentNetwork = useNetworkStore(selectCurrentNetwork)

  useClickOutside(moreMenuRef, useCallback(() => setShowMoreMenu(false), []), showMoreMenu)

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

          {/* Desktop Search */}
          <div className="hidden flex-1 max-w-3xl mx-4 lg:block" role="search">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-4 xl:gap-6 md:flex flex-shrink-0" aria-label="Main navigation">
            {CORE_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-accent-blue whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}

            <div ref={moreMenuRef}>
              <DesktopMoreMenu
                isOpen={showMoreMenu}
                onToggle={() => setShowMoreMenu(!showMoreMenu)}
                onClose={() => setShowMoreMenu(false)}
              />
            </div>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden border border-bg-tertiary bg-bg-secondary px-3 py-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue"
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
              className="lg:hidden border border-bg-tertiary bg-bg-secondary px-3 py-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue"
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
          <MobileNav onClose={() => setShowMobileMenu(false)} />
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
