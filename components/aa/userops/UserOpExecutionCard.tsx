'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import type { UserOpRevert } from '@/types/aa'

interface UserOpRevertCardProps {
  revertInfo: UserOpRevert
}

/**
 * Revert reason card for failed UserOperations
 *
 * Only shown when the UserOp failed and revert info is available.
 * Replaces the old ExecutionCard (callData is not available from event-only backend).
 */
export function UserOpRevertCard({ revertInfo }: UserOpRevertCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>REVERT INFORMATION</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="w-48 font-mono text-xs text-text-secondary">Revert Type</TableCell>
              <TableCell>
                <span className="font-mono text-xs text-status-error">
                  {revertInfo.revertType === 'execution' ? 'Execution Revert' : 'PostOp Revert'}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs text-text-secondary">Revert Reason</TableCell>
              <TableCell>
                <span className="font-mono text-xs text-status-error break-all">
                  {revertInfo.revertReason}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
