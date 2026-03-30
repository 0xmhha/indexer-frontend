'use client'

import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { AddressLink } from '@/components/common/AddressLink'
import { UserOpHashLink } from '@/components/aa/common/UserOpHashLink'
import { UserOpStatusBadge } from '@/components/aa/common/UserOpStatusBadge'
import { GET_USER_OPS_BY_TX } from '@/lib/apollo/queries/aa'
import { transformBundleUserOps } from '@/lib/utils/aa-transforms'
import { formatValue } from '@/lib/utils/format'
import type { RawBundleUserOp } from '@/types/aa'

interface TxBundleCardProps {
  txHash: string
}

/**
 * AA Bundle card for Transaction detail page.
 * Shows UserOperations bundled in this transaction.
 * Hidden when the transaction contains no AA UserOps.
 */
export function TxBundleCard({ txHash }: TxBundleCardProps) {
  const { data, loading } = useQuery(GET_USER_OPS_BY_TX, {
    variables: { txHash },
    fetchPolicy: 'cache-and-network',
  })

  const rawOps = (data?.userOpsByTx ?? []) as RawBundleUserOp[]

  const userOps = useMemo(() => transformBundleUserOps(rawOps), [rawOps])
  const bundler = userOps[0]?.bundler
  const entryPoint = userOps[0]?.entryPoint

  // Compute bundle summary
  const totalGas = useMemo(() =>
    userOps.reduce((sum, op) => sum + op.actualGasCost, BigInt(0)),
    [userOps]
  )
  const sponsoredGas = useMemo(() =>
    userOps
      .filter((op) => op.paymaster !== null)
      .reduce((sum, op) => sum + op.actualGasCost, BigInt(0)),
    [userOps]
  )
  const sponsoredCount = userOps.filter((op) => op.paymaster !== null).length

  // Don't render anything if no UserOps in this tx
  if (loading || rawOps.length === 0) {
    return null
  }

  return (
    <Card className="mb-4">
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>EIP-4337 BUNDLE</CardTitle>
          <span className="rounded bg-accent-cyan/20 px-2 py-0.5 font-mono text-xs text-accent-cyan">
            {userOps.length} UserOp{userOps.length > 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Bundle metadata */}
        <div className="border-b border-bg-tertiary px-4 py-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {bundler && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-secondary">Bundler:</span>
                <Link href={`/bundler/${bundler}`} className="hover:underline">
                  <AddressLink address={bundler} />
                </Link>
              </div>
            )}
            {entryPoint && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-secondary">EntryPoint:</span>
                <AddressLink address={entryPoint} isContract={true} />
              </div>
            )}
          </div>
          {/* Bundle summary */}
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
            <span className="font-mono text-xs text-text-muted">
              Total Gas: <span className="text-text-primary">{formatValue(totalGas)} STB</span>
            </span>
            {sponsoredCount > 0 && (
              <span className="font-mono text-xs text-text-muted">
                Sponsored: <span className="text-accent-orange">{formatValue(sponsoredGas)} STB</span>
                <span className="ml-1 text-text-muted">({sponsoredCount} ops)</span>
              </span>
            )}
          </div>
        </div>

        {/* UserOps table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>USEROP HASH</TableHead>
              <TableHead>SENDER</TableHead>
              <TableHead>PAYMASTER</TableHead>
              <TableHead>GAS PAYMENT</TableHead>
              <TableHead className="text-right">GAS COST</TableHead>
              <TableHead>STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userOps.map((op) => (
              <TableRow key={op.userOpHash}>
                <TableCell>
                  <UserOpHashLink hash={op.userOpHash} />
                </TableCell>
                <TableCell>
                  <AddressLink address={op.sender} />
                </TableCell>
                <TableCell>
                  {op.paymaster ? (
                    <Link href={`/paymaster/${op.paymaster}`} className="hover:underline">
                      <AddressLink address={op.paymaster} />
                    </Link>
                  ) : (
                    <span className="font-mono text-xs text-text-muted">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {op.paymaster ? (
                    <span className="rounded bg-accent-orange/20 px-1.5 py-0.5 font-mono text-xs text-accent-orange">
                      Sponsored
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-text-muted">Self-paid</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-xs text-text-primary">
                    {formatValue(op.actualGasCost)} STB
                  </span>
                </TableCell>
                <TableCell>
                  <UserOpStatusBadge success={op.success} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Link to UserOps list */}
        <div className="border-t border-bg-tertiary px-4 py-3 text-center">
          <Link
            href="/userops"
            className="font-mono text-xs text-accent-blue hover:text-accent-cyan"
          >
            View All User Operations →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
