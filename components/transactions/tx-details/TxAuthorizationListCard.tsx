'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { SetCodeAuthorization } from './types'

function AuthorizationDisplay({ auth, index }: { auth: SetCodeAuthorization; index: number }) {
  const chainId = typeof auth.chainId === 'bigint' ? auth.chainId.toString() : auth.chainId
  const nonce = typeof auth.nonce === 'bigint' ? auth.nonce.toString() : auth.nonce

  return (
    <div className="rounded border border-bg-tertiary bg-bg-primary p-3">
      <div className="annotation mb-2">AUTHORIZATION #{index + 1}</div>
      <div className="space-y-2 font-mono text-xs">
        <div className="flex items-start gap-2">
          <span className="w-20 shrink-0 text-text-muted">Authority:</span>
          {auth.authority ? (
            <Link
              href={`/address/${auth.authority}`}
              className="break-all text-accent-blue hover:text-accent-cyan"
            >
              {auth.authority}
            </Link>
          ) : (
            <span className="text-text-muted">Unknown</span>
          )}
        </div>
        <div className="flex items-start gap-2">
          <span className="w-20 shrink-0 text-text-muted">Delegate To:</span>
          <Link
            href={`/address/${auth.address}`}
            className="break-all text-accent-blue hover:text-accent-cyan"
          >
            {auth.address}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-text-muted">Chain ID:</span>
          <span>{chainId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-text-muted">Nonce:</span>
          <span>{nonce}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-text-muted">Y Parity:</span>
          <span>{auth.yParity}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-20 shrink-0 text-text-muted">R:</span>
          <span className="break-all text-text-secondary">{auth.r}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-20 shrink-0 text-text-muted">S:</span>
          <span className="break-all text-text-secondary">{auth.s}</span>
        </div>
      </div>
    </div>
  )
}

export function TxAuthorizationListCard({
  authorizationList,
}: {
  authorizationList: SetCodeAuthorization[] | null | undefined
}) {
  if (!authorizationList || authorizationList.length === 0) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center gap-2">
          <span>EIP-7702 AUTHORIZATION LIST</span>
          <span className="rounded bg-accent-orange/20 px-2 py-0.5 text-xs text-accent-orange">
            SetCode
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 rounded border border-accent-orange/30 bg-accent-orange/10 p-3 text-sm text-accent-orange">
          <p>
            This transaction uses EIP-7702 to delegate code execution from EOA accounts to smart
            contracts. The authority address signs authorization to allow their account to execute
            code from the delegate address.
          </p>
        </div>
        <div className="space-y-3">
          {authorizationList.map((auth, idx) => (
            <AuthorizationDisplay key={`${auth.address}-${idx}`} auth={auth} index={idx} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
