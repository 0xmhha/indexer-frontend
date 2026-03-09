'use client'

import { memo } from 'react'
import Link from 'next/link'
import { formatValue } from '@/lib/utils/format'
import { AddressLink } from '@/components/common/AddressLink'
import { TableRow, TableCell } from '@/components/ui/Table'
import { UserOpStatusBadge } from '../common/UserOpStatusBadge'
import { UserOpHashLink } from '../common/UserOpHashLink'
import type { UserOperationListItem } from '@/types/aa'

interface UserOpRowProps {
  userOp: UserOperationListItem
  showAge?: boolean
}

function formatAge(timestamp: Date): string {
  const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000)
  if (seconds < 60) { return `${seconds}s ago` }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) { return `${minutes}m ago` }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) { return `${hours}h ago` }
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function UserOpRowComponent({ userOp, showAge = true }: UserOpRowProps) {
  return (
    <TableRow>
      {/* UserOp Hash */}
      <TableCell>
        <UserOpHashLink hash={userOp.userOpHash} />
      </TableCell>

      {/* Block */}
      <TableCell>
        <Link
          href={`/block/${userOp.blockNumber}`}
          className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
        >
          {userOp.blockNumber}
        </Link>
      </TableCell>

      {/* Age */}
      {showAge && (
        <TableCell>
          <span className="font-mono text-xs text-text-secondary">
            {formatAge(userOp.blockTimestamp)}
          </span>
        </TableCell>
      )}

      {/* Sender */}
      <TableCell>
        <AddressLink address={userOp.sender} />
      </TableCell>

      {/* Paymaster */}
      <TableCell>
        {userOp.paymaster ? (
          <AddressLink address={userOp.paymaster} />
        ) : (
          <span className="font-mono text-xs text-text-muted">-</span>
        )}
      </TableCell>

      {/* Bundler */}
      <TableCell>
        {userOp.bundler ? (
          <AddressLink address={userOp.bundler} />
        ) : (
          <span className="font-mono text-xs text-text-muted">-</span>
        )}
      </TableCell>

      {/* Gas Cost */}
      <TableCell className="text-right">
        <span className="font-mono text-xs text-text-primary">
          {formatValue(userOp.actualGasCost)} STB
        </span>
      </TableCell>

      {/* Status */}
      <TableCell>
        <UserOpStatusBadge success={userOp.success} />
      </TableCell>
    </TableRow>
  )
}

export const UserOpRow = memo(UserOpRowComponent)
