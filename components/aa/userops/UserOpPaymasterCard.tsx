'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { AddressLink } from '@/components/common/AddressLink'
import { formatValue } from '@/lib/utils/format'
import type { UserOperation } from '@/types/aa'

interface UserOpPaymasterCardProps {
  userOp: UserOperation
}

/**
 * Paymaster information card for UserOperation detail
 *
 * Only shown when paymaster is present (non-null after zero-address normalization).
 * paymasterAndData byte-level parsing is NOT available from the event-only backend.
 */
export function UserOpPaymasterCard({ userOp }: UserOpPaymasterCardProps) {
  if (!userOp.paymaster) {
    return null
  }

  return (
    <Card className="mb-4">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>PAYMASTER (GAS SPONSORSHIP)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="w-48 font-mono text-xs text-text-secondary">Paymaster</TableCell>
              <TableCell>
                <AddressLink address={userOp.paymaster} truncate={false} isContract={true} />
              </TableCell>
            </TableRow>
            <TableRow className="border-t-2 border-bg-tertiary">
              <TableCell className="font-mono text-xs text-text-secondary font-bold">Sponsored Gas Cost</TableCell>
              <TableCell>
                <span className="font-mono text-xs text-accent-orange font-bold">
                  {formatValue(userOp.actualGasCost)} STB
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
