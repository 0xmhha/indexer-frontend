'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useActiveMinters } from '@/lib/hooks/useSystemContracts'
import { formatNumber, truncateAddress } from '@/lib/utils/format'

/**
 * Active Minters Panel
 *
 * Displays list of active minters with allowance and status info.
 * Backend API returns MinterInfo[] via activeMinters query.
 */
export function ActiveMintersPanel() {
  const { minterInfos, totalCount, loading, error } = useActiveMinters()

  if (loading && minterInfos.length === 0) {
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
        {minterInfos.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="font-mono text-sm text-text-muted">No active minters found</p>
          </div>
        ) : (
          <div className="divide-y divide-bg-tertiary">
            {minterInfos.map((minter, idx) => (
              <div key={`${minter.address}-${idx}`} className="p-4 transition-colors hover:bg-bg-secondary">
                <div className="flex items-center justify-between">
                  {/* Address */}
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${minter.isActive ? 'bg-accent-green' : 'bg-accent-red'}`} title={minter.isActive ? 'Active' : 'Inactive'} />
                    <Link
                      href={`/address/${minter.address}`}
                      className="font-mono text-sm text-accent-blue hover:underline"
                      title={minter.address}
                    >
                      {truncateAddress(minter.address)}
                    </Link>
                  </div>

                  {/* Allowance & Status */}
                  <div className="flex items-center gap-3">
                    {minter.allowance && minter.allowance !== '0' && (
                      <span className="font-mono text-xs text-text-secondary">
                        Allowance: {formatNumber(BigInt(minter.allowance))}
                      </span>
                    )}
                    <div className={`rounded border px-3 py-1 ${minter.isActive ? 'border-accent-green/30 bg-accent-green/10' : 'border-accent-red/30 bg-accent-red/10'}`}>
                      <span className={`font-mono text-xs ${minter.isActive ? 'text-accent-green' : 'text-accent-red'}`}>
                        {minter.isActive ? 'Active Minter' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
