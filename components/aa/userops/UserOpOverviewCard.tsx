'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { AddressLink } from '@/components/common/AddressLink'
import { CopyButton } from '@/components/common/CopyButton'
import { UserOpStatusBadge } from '../common/UserOpStatusBadge'
import type { UserOperation } from '@/types/aa'

interface UserOpOverviewCardProps {
  userOp: UserOperation
}

/**
 * Overview card showing basic UserOperation information
 */
export function UserOpOverviewCard({ userOp }: UserOpOverviewCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>OVERVIEW</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="w-48 font-mono text-xs text-text-secondary">UserOp Hash</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-primary break-all">{userOp.userOpHash}</span>
                  <CopyButton text={userOp.userOpHash} />
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs text-text-secondary">Status</TableCell>
              <TableCell>
                <UserOpStatusBadge success={userOp.success} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs text-text-secondary">Sender</TableCell>
              <TableCell>
                <AddressLink address={userOp.sender} truncate={false} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs text-text-secondary">Nonce</TableCell>
              <TableCell>
                <span className="font-mono text-xs text-text-primary">
                  {userOp.nonce.toString()}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs text-text-secondary">EntryPoint</TableCell>
              <TableCell>
                <AddressLink address={userOp.entryPoint} truncate={false} isContract={true} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs text-text-secondary">Bundler</TableCell>
              <TableCell>
                <AddressLink address={userOp.bundler} truncate={false} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs text-text-secondary">Block</TableCell>
              <TableCell>
                <Link
                  href={`/block/${userOp.blockNumber}`}
                  className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
                >
                  #{userOp.blockNumber}
                </Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs text-text-secondary">Timestamp</TableCell>
              <TableCell>
                <span className="font-mono text-xs text-text-primary">
                  {userOp.blockTimestamp.toLocaleString()}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs text-text-secondary">Bundle Transaction</TableCell>
              <TableCell>
                <Link
                  href={`/tx/${userOp.bundleTxHash}`}
                  className="font-mono text-xs text-accent-blue hover:text-accent-cyan break-all"
                >
                  {userOp.bundleTxHash}
                </Link>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
