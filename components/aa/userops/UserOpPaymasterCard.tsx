'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { AddressLink } from '@/components/common/AddressLink'
import { formatValue } from '@/lib/utils/format'
import { formatTokenAmount } from '@/lib/utils/eventDecoder'
import { useUserOpTokenPayments } from '@/lib/hooks/aa/useUserOpTokenPayments'
import type { UserOperation } from '@/types/aa'

interface UserOpPaymasterCardProps {
  userOp: UserOperation
}

/**
 * Paymaster information card for UserOperation detail
 *
 * Only shown when paymaster is present (non-null after zero-address normalization).
 * Detects token-based gas payments via ERC-20 Transfer log analysis.
 */
export function UserOpPaymasterCard({ userOp }: UserOpPaymasterCardProps) {
  const { tokenPayments } = useUserOpTokenPayments(
    userOp.bundleTxHash,
    userOp.paymaster
  )

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
                <Link href={`/paymaster/${userOp.paymaster}`} className="hover:underline">
                  <AddressLink address={userOp.paymaster} truncate={false} isContract={true} />
                </Link>
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
            {/* Token-based gas payments */}
            {tokenPayments.map((payment, i) => (
              <TableRow key={i} className="border-t border-bg-tertiary">
                <TableCell className="font-mono text-xs text-text-secondary">
                  Gas Paid in {payment.token.symbol}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-accent-cyan font-bold">
                    {formatTokenAmount(payment.amount.toString(), payment.token.decimals)} {payment.token.symbol}
                  </span>
                  <span className="ml-2 rounded bg-accent-cyan/20 px-1.5 py-0.5 text-xs text-accent-cyan">
                    {payment.direction === 'in' ? 'Received' : 'Paid'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
