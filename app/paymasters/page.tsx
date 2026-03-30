'use client'

import { Suspense } from 'react'
import { usePaymasters } from '@/lib/hooks/aa'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ListPageSkeleton } from '@/components/skeletons/ListPageSkeleton'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { PaymasterTable } from '@/components/aa/paymasters/PaymasterTable'
import { StatCard } from '@/components/common/StatCard'
import { formatNumber, formatValue } from '@/lib/utils/format'

function PaymastersListContent() {
  const { paymasters, totalCount, loading, error } = usePaymasters()

  if (loading && paymasters.length === 0) {
    return <ListPageSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay title="Failed to load paymasters" message={error.message} />
      </div>
    )
  }

  const totalOps = paymasters.reduce((sum, pm) => sum + pm.totalOps, 0)
  const totalGasPaid = paymasters.reduce((sum, pm) => sum + pm.totalGasSponsored, BigInt(0))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="annotation mb-2">ACCOUNT ABSTRACTION</div>
        <h1 className="mb-4 font-mono text-3xl font-bold text-accent-blue">PAYMASTERS</h1>
        <p className="font-mono text-xs text-text-secondary">
          EIP-4337 Paymasters that sponsor gas fees for UserOperations
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active Paymasters" value={formatNumber(totalCount)} />
        <StatCard label="Total Sponsored Ops" value={formatNumber(totalOps)} />
        <StatCard label="Total Gas Paid" value={`${formatValue(totalGasPaid)} STB`} />
      </div>

      {/* Paymasters Table */}
      <Card>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>PAYMASTERS LIST</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <PaymasterTable paymasters={paymasters} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymastersListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PaymastersListContent />
    </Suspense>
  )
}
