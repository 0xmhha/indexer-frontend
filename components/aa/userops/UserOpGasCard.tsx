'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { formatValue } from '@/lib/utils/format'
import type { UserOperation } from '@/types/aa'

interface UserOpGasCardProps {
  userOp: UserOperation
}

/**
 * Gas information card for UserOperation detail
 *
 * Shows event-derived gas fields only (actualGasCost, actualUserOpFeePerGas).
 * Calldata gas limits (callGasLimit, verificationGasLimit, etc.) are NOT
 * available from the event-only backend.
 */
export function UserOpGasCard({ userOp }: UserOpGasCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>GAS INFORMATION</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="w-48 font-mono text-xs text-text-secondary font-bold">Actual Gas Cost</TableCell>
              <TableCell>
                <span className="font-mono text-xs text-accent-blue font-bold">
                  {formatValue(userOp.actualGasCost)} STB
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs text-text-secondary font-bold">Actual Fee Per Gas</TableCell>
              <TableCell>
                <span className="font-mono text-xs text-accent-blue font-bold">
                  {formatValue(userOp.actualUserOpFeePerGas, 9)} Gwei
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
