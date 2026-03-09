'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { AddressLink } from '@/components/common/AddressLink'
import type { UserOperation, AccountDeployment } from '@/types/aa'

interface UserOpAccountCardProps {
  userOp: UserOperation
  deployment: AccountDeployment | null
}

/**
 * Account/Factory information card for UserOperation detail
 *
 * Deployment info comes from a separate `accountDeployment` query.
 * initCode is NOT available from the event-only backend.
 */
export function UserOpAccountCard({ userOp, deployment }: UserOpAccountCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>ACCOUNT</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="w-48 font-mono text-xs text-text-secondary">Sender (Account)</TableCell>
              <TableCell>
                <AddressLink address={userOp.sender} truncate={false} isContract={true} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs text-text-secondary">Account Deployed</TableCell>
              <TableCell>
                <span className={`font-mono text-xs ${deployment ? 'text-accent-orange' : 'text-text-primary'}`}>
                  {deployment ? 'Yes (deployed in this UserOp)' : 'No (already deployed)'}
                </span>
              </TableCell>
            </TableRow>
            {deployment?.factory && (
              <TableRow>
                <TableCell className="font-mono text-xs text-text-secondary">Factory</TableCell>
                <TableCell>
                  <AddressLink address={deployment.factory} truncate={false} isContract={true} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
