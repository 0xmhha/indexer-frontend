'use client'

import Link from 'next/link'
import { env } from '@/lib/config/env'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-bg-tertiary bg-bg-primary/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
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

        {/* Chain Info */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <div className="h-2 w-2 animate-pulse rounded-full bg-success"></div>
            <span className="font-mono text-xs text-text-secondary">Chain ID: {env.chainId}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
