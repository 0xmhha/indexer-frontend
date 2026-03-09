'use client'

import { Suspense } from 'react'
import { useBundlers } from '@/lib/hooks/aa'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ListPageSkeleton } from '@/components/skeletons/ListPageSkeleton'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { BundlerTable } from '@/components/aa/bundlers/BundlerTable'
import { StatCard } from '@/components/common/StatCard'
import { formatNumber } from '@/lib/utils/format'

function BundlersListContent() {
  const { bundlers, totalCount, loading, error } = useBundlers()

  if (loading && bundlers.length === 0) {
    return <ListPageSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay title="Failed to load bundlers" message={error.message} />
      </div>
    )
  }

  const totalBundles = bundlers.reduce((sum, b) => sum + b.totalBundles, 0)
  const totalUserOps = bundlers.reduce((sum, b) => sum + b.totalUserOps, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">ACCOUNT ABSTRACTION</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">BUNDLERS</h1>
        <p className="font-mono text-xs text-text-secondary">
          EIP-4337 Bundlers that submit UserOperations to the EntryPoint
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active Bundlers" value={formatNumber(totalCount)} />
        <StatCard label="Total Bundles" value={formatNumber(totalBundles)} />
        <StatCard label="Total UserOps Processed" value={formatNumber(totalUserOps)} />
      </div>

      {/* Bundlers Table */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>BUNDLERS LIST</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <BundlerTable bundlers={bundlers} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function BundlersListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <BundlersListContent />
    </Suspense>
  )
}
