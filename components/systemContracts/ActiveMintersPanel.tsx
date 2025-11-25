'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useActiveMinters } from '@/lib/hooks/useSystemContracts'
import { formatNumber, formatDateTime, truncateAddress } from '@/lib/utils/format'
import { PAGINATION } from '@/lib/config/constants'

interface ActiveMintersPanelProps {
  maxMinters?: number
}

/**
 * Active Minters Panel
 *
 * Displays list of active minters with their allowances and activity status.
 */
export function ActiveMintersPanel({ maxMinters = PAGINATION.DEFAULT_PAGE_SIZE }: ActiveMintersPanelProps) {
  const { minters, totalCount, loading, error } = useActiveMinters({ limit: maxMinters })

  if (loading && minters.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>ACTIVE MINTERS</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>ACTIVE MINTERS</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ErrorDisplay title="Failed to load active minters" message={error.message} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>ACTIVE MINTERS</CardTitle>
          <div className="font-mono text-xs text-text-secondary">
            Total: <span className="text-accent-blue">{formatNumber(totalCount)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {minters.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="font-mono text-sm text-text-muted">No active minters found</p>
          </div>
        ) : (
          <div className="divide-y divide-bg-tertiary">
            {minters.map((minter, idx) => (
              <div key={`${minter.address}-${idx}`} className="p-4 transition-colors hover:bg-bg-secondary">
                <div className="mb-3 flex items-start justify-between">
                  {/* Address */}
                  <div className="flex-1">
                    <div className="mb-1 font-mono text-sm text-text-primary">
                      {truncateAddress(minter.address)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          minter.isActive ? 'bg-accent-green' : 'bg-text-muted'
                        }`}
                        title={minter.isActive ? 'Active' : 'Inactive'}
                      />
                      <span className="font-mono text-xs text-text-muted">
                        {minter.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Allowance Badge */}
                  <div className="rounded border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1">
                    <div className="font-mono text-xs text-accent-cyan">
                      {formatNumber(BigInt(minter.allowance))} tokens
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-text-muted">Added:</span>
                    <span className="font-mono text-xs text-text-secondary">
                      {formatDateTime(minter.addedAt)}
                    </span>
                  </div>
                  {minter.lastMintAt && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-muted">Last Mint:</span>
                      <span className="font-mono text-xs text-text-secondary">
                        {formatDateTime(minter.lastMintAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
