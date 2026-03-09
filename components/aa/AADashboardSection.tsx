'use client'

import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatCard } from '@/components/common/StatCard'
import { UserOpTable } from '@/components/aa/userops/UserOpTable'
import { GET_USER_OP_COUNT, GET_RECENT_USER_OPS } from '@/lib/apollo/queries/aa'
import { transformUserOperationListItems } from '@/lib/utils/aa-transforms'
import { formatNumber } from '@/lib/utils/format'
import type { RawUserOperationListItem } from '@/types/aa'

const DASHBOARD_LIMIT = 5

/**
 * AA stats and recent UserOps section for the Dashboard.
 * Shows total UserOp count and the most recent UserOperations.
 */
export function AADashboardSection() {
  const { data: countData } = useQuery(GET_USER_OP_COUNT, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 15000,
  })

  const { data: recentData, loading } = useQuery(GET_RECENT_USER_OPS, {
    variables: { limit: DASHBOARD_LIMIT },
    fetchPolicy: 'cache-and-network',
    pollInterval: 15000,
  })

  const totalCount = (countData?.userOpCount as number | undefined) ?? 0
  const rawOps = (recentData?.recentUserOps ?? []) as RawUserOperationListItem[]
  const recentOps = rawOps.length > 0 ? transformUserOperationListItems(rawOps) : []

  // Don't show section if no AA activity at all
  if (!loading && totalCount === 0 && recentOps.length === 0) {
    return null
  }

  return (
    <div>
      {/* AA Stats */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-lg font-bold text-text-primary">ACCOUNT ABSTRACTION</h2>
        <Link
          href="/userops"
          className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
        >
          View All →
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total UserOperations" value={formatNumber(totalCount)} />
        <StatCard label="Recent UserOps" value={formatNumber(recentOps.length)} />
        <StatCard
          label="Success Rate"
          value={
            recentOps.length > 0
              ? `${((recentOps.filter((op) => op.success).length / recentOps.length) * 100).toFixed(1)}%`
              : '-'
          }
        />
      </div>

      {/* Recent UserOps */}
      {recentOps.length > 0 && (
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>RECENT USER OPERATIONS</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <UserOpTable userOps={recentOps} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
