'use client'

import Link from 'next/link'
import { CopyButton } from '@/components/common/CopyButton'
import { UserOpStatusBadge } from '../common/UserOpStatusBadge'
import type { UserOperation } from '@/types/aa'

interface UserOpHeaderProps {
  userOp: UserOperation
}

/**
 * Header for UserOperation detail page
 * Shows hash, status badge, block link, and bundle tx link
 */
export function UserOpHeader({ userOp }: UserOpHeaderProps) {
  return (
    <div className="mb-8">
      <div className="annotation mb-2">USER OPERATION</div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-xl font-bold text-accent-blue break-all sm:text-2xl">
          {userOp.userOpHash}
        </h1>
        <CopyButton text={userOp.userOpHash} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <UserOpStatusBadge success={userOp.success} />
        <Link
          href={`/block/${userOp.blockNumber}`}
          className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
        >
          Block #{userOp.blockNumber}
        </Link>
        <span className="text-text-muted">|</span>
        <Link
          href={`/tx/${userOp.bundleTxHash}`}
          className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
        >
          Bundle Tx
        </Link>
      </div>
    </div>
  )
}
