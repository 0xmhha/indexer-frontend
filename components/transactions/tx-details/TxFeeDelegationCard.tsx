'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import type { TransformedFeePayerSignature } from '@/types/graphql'

function SignatureDisplay({ signature, index }: { signature: TransformedFeePayerSignature; index: number }) {
  return (
    <div className="rounded border border-bg-tertiary p-2">
      <div className="annotation mb-1">SIGNATURE #{index + 1}</div>
      <div className="space-y-1 font-mono text-xs">
        <div><span className="text-text-muted">v:</span> {signature.v}</div>
        <div className="break-all"><span className="text-text-muted">r:</span> {signature.r}</div>
        <div className="break-all"><span className="text-text-muted">s:</span> {signature.s}</div>
      </div>
    </div>
  )
}

export function TxFeeDelegationCard({
  feePayer,
  signatures,
}: {
  feePayer: string | null | undefined
  signatures: TransformedFeePayerSignature[] | null | undefined
}) {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>FEE DELEGATION</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">Fee Payer</TableCell>
              <TableCell>
                {feePayer ? (
                  <Link
                    href={`/address/${feePayer}`}
                    className="font-mono text-accent-blue hover:text-accent-cyan"
                  >
                    {feePayer}
                  </Link>
                ) : (
                  <span className="font-mono text-text-muted">Not available</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Fee Payer Signatures</TableCell>
              <TableCell>
                {signatures && signatures.length > 0 ? (
                  <div className="space-y-2">
                    {signatures.map((sig, idx) => (
                      <SignatureDisplay key={`${sig.r}-${idx}`} signature={sig} index={idx} />
                    ))}
                  </div>
                ) : (
                  <span className="font-mono text-text-muted">No signatures</span>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
