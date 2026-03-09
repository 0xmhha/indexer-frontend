'use client'

import { useParams } from 'next/navigation'
import { useUserOperation } from '@/lib/hooks/aa'
import { TransactionDetailSkeleton } from '@/components/skeletons/TransactionDetailSkeleton'
import { NotFound } from '@/components/common/ErrorBoundary'
import { UserOpHeader } from '@/components/aa/userops/UserOpHeader'
import { UserOpOverviewCard } from '@/components/aa/userops/UserOpOverviewCard'
import { UserOpGasCard } from '@/components/aa/userops/UserOpGasCard'
import { UserOpPaymasterCard } from '@/components/aa/userops/UserOpPaymasterCard'
import { UserOpAccountCard } from '@/components/aa/userops/UserOpAccountCard'
import { UserOpRevertCard } from '@/components/aa/userops/UserOpExecutionCard'

export default function UserOperationPage() {
  const params = useParams()
  const hash = params.hash as string

  const { userOp, revertInfo, deploymentInfo, loading, error } = useUserOperation(hash)

  if (loading) {
    return <TransactionDetailSkeleton />
  }

  if (error || !userOp) {
    return <NotFound message={`UserOperation ${hash} not found`} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserOpHeader userOp={userOp} />
      <UserOpOverviewCard userOp={userOp} />
      <UserOpGasCard userOp={userOp} />
      <UserOpPaymasterCard userOp={userOp} />
      <UserOpAccountCard userOp={userOp} deployment={deploymentInfo} />
      {revertInfo && <UserOpRevertCard revertInfo={revertInfo} />}
    </div>
  )
}
