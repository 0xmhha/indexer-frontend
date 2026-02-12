'use client'

import { memo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useBlacklistedAddresses } from '@/lib/hooks/useGovernance'
import { truncateAddress } from '@/lib/utils/format'

/**
 * Blacklist Viewer
 *
 * Displays list of blacklisted addresses with copy functionality.
 */
export function BlacklistViewer() {
  const { addresses, loading, error, refetch } = useBlacklistedAddresses()

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>BLACKLISTED ADDRESSES ({addresses.length})</CardTitle>
          <button
            onClick={() => refetch()}
            className="rounded border border-bg-tertiary bg-bg-secondary px-3 py-1 font-mono text-xs text-text-primary transition-colors hover:border-accent-blue hover:text-accent-blue"
            aria-label="Refresh blacklist"
          >
            ↻
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorDisplay title="Failed to load blacklist" message={error.message} />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p className="font-mono text-sm text-text-muted">No blacklisted addresses</p>
          </div>
        ) : (
          <div className="divide-y divide-bg-tertiary">
            {addresses.map((address, idx) => (
              <BlacklistItem key={`${address}-${idx}`} address={address} index={idx + 1} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const BlacklistItem = memo(function BlacklistItem({ address, index }: { address: string; index: number }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(address)
  }

  return (
    <div className="p-4 transition-colors hover:bg-bg-secondary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent-red bg-accent-red/10">
            <span className="font-mono text-xs font-bold text-accent-red">{index}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent-red" />
            <span className="font-mono text-sm text-text-secondary" title={address}>
              {truncateAddress(address)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="rounded border border-bg-tertiary bg-bg-primary px-3 py-1 font-mono text-xs text-text-muted transition-colors hover:border-accent-blue hover:text-accent-blue"
            aria-label="Copy address"
          >
            Copy
          </button>
          <span className="rounded border border-accent-red bg-accent-red/10 px-2 py-0.5 font-mono text-xs text-accent-red">
            BLACKLISTED
          </span>
        </div>
      </div>
    </div>
  )
})
