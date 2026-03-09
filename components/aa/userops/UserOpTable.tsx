'use client'

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from '@/components/ui/Table'
import { UserOpRow } from './UserOpRow'
import type { UserOperationListItem } from '@/types/aa'

interface UserOpTableProps {
  userOps: UserOperationListItem[]
  showAge?: boolean
}

/**
 * Table component for UserOperation list
 */
export function UserOpTable({ userOps, showAge = true }: UserOpTableProps) {
  if (userOps.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-text-muted">No user operations found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>USEROP HASH</TableHead>
          <TableHead>BLOCK</TableHead>
          {showAge && <TableHead>AGE</TableHead>}
          <TableHead>SENDER</TableHead>
          <TableHead>PAYMASTER</TableHead>
          <TableHead>BUNDLER</TableHead>
          <TableHead className="text-right">GAS COST</TableHead>
          <TableHead>STATUS</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userOps.map((op) => (
          <UserOpRow key={op.userOpHash} userOp={op} showAge={showAge} />
        ))}
      </TableBody>
    </Table>
  )
}
