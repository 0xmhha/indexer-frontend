'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatCard } from '@/components/common/StatCard'
import { AddressLink } from '@/components/common/AddressLink'
import { CopyButton } from '@/components/common/CopyButton'
import { UserOpTable } from '@/components/aa/userops/UserOpTable'
import { useBundlerStats } from '@/lib/hooks/aa/useBundlerStats'
import { useUserOperations } from '@/lib/hooks/aa/useUserOperations'
import { formatNumber, formatValue } from '@/lib/utils/format'

const PAGE_SIZE = 20

export default function BundlerDetailPage() {
  const params = useParams()
  const address = params.address as string
  const [page, setPage] = useState(0)

  const { stats, loading: statsLoading } = useBundlerStats(address)
  const { userOps, totalCount, loading: opsLoading } = useUserOperations({
    filter: { bundler: address },
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  })

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">
          <Link href="/bundlers" className="hover:text-accent-blue">BUNDLERS</Link> / DETAIL
        </div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">BUNDLER DETAILS</h1>
        <div className="flex items-center gap-2">
          <AddressLink address={address} truncate={false} />
          <CopyButton text={address} />
        </div>
      </div>

      {/* Stats */}
      {stats && !statsLoading && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Ops" value={formatNumber(stats.totalOps)} />
          <StatCard
            label="Success Rate"
            value={`${stats.successRate.toFixed(1)}%`}
          />
          <StatCard label="Total Gas" value={`${formatValue(stats.totalGasSponsored)} STB`} />
          <StatCard label="Last Active" value={`Block #${formatNumber(stats.lastActivityBlock)}`} />
        </div>
      )}

      {statsLoading && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded bg-bg-secondary" />
          ))}
        </div>
      )}

      {/* Processed UserOperations */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <div className="flex items-center justify-between">
            <CardTitle>PROCESSED USER OPERATIONS</CardTitle>
            <span className="font-mono text-xs text-text-muted">
              {formatNumber(totalCount)} total
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {opsLoading && userOps.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
            </div>
          ) : (
            <UserOpTable userOps={userOps} />
          )}
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-bg-tertiary px-4 py-3">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded px-3 py-1 font-mono text-xs text-accent-blue hover:bg-bg-secondary disabled:text-text-muted disabled:hover:bg-transparent"
            >
              ← Prev
            </button>
            <span className="font-mono text-xs text-text-muted">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded px-3 py-1 font-mono text-xs text-accent-blue hover:bg-bg-secondary disabled:text-text-muted disabled:hover:bg-transparent"
            >
              Next →
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
