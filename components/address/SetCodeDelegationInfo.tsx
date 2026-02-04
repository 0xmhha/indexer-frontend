'use client'

import Link from 'next/link'
import { useSetCodeDelegation } from '@/lib/hooks/useAddress'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatHash, formatNumber } from '@/lib/utils/format'
import { CopyButton } from '@/components/common/CopyButton'

interface SetCodeDelegationInfoProps {
  address: string
}

/**
 * Component to display EIP-7702 SetCode delegation info for EOA addresses
 * Shows the delegate contract address when an EOA has SetCode authorization set
 */
export function SetCodeDelegationInfo({ address }: SetCodeDelegationInfoProps) {
  const {
    delegation,
    delegationTxHash,
    delegationBlockNumber,
    loading,
    hasDelegation,
  } = useSetCodeDelegation(address)

  // Don't render anything if loading or no delegation
  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle className="flex items-center gap-2">
            <span className="rounded bg-accent-purple/20 px-2 py-0.5 text-xs text-accent-purple">
              EIP-7702
            </span>
            SETCODE DELEGATION
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!hasDelegation || !delegation) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center gap-2">
          <span className="rounded bg-accent-purple/20 px-2 py-0.5 text-xs text-accent-purple">
            EIP-7702
          </span>
          SETCODE DELEGATION
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Delegate Contract Address */}
          <div>
            <div className="annotation mb-2">DELEGATE CONTRACT</div>
            <div className="flex items-center gap-2">
              <Link
                href={`/address/${delegation.address}`}
                className="font-mono text-accent-blue hover:text-accent-cyan"
              >
                {delegation.address}
              </Link>
              <CopyButton text={delegation.address} size="sm" />
            </div>
            <p className="mt-1 text-xs text-text-muted">
              This EOA delegates its code execution to the above contract
            </p>
          </div>

          {/* Chain ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="annotation mb-2">CHAIN ID</div>
              <div className="font-mono text-text-primary">
                {delegation.chainId}
              </div>
            </div>
            <div>
              <div className="annotation mb-2">AUTHORIZATION NONCE</div>
              <div className="font-mono text-text-primary">
                {delegation.nonce}
              </div>
            </div>
          </div>

          {/* Transaction Info */}
          {delegationTxHash && (
            <div className="border-t border-bg-tertiary pt-4">
              <div className="annotation mb-2">AUTHORIZATION TRANSACTION</div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/tx/${delegationTxHash}`}
                  className="font-mono text-sm text-accent-blue hover:text-accent-cyan"
                >
                  {formatHash(delegationTxHash)}
                </Link>
                {delegationBlockNumber && (
                  <span className="text-xs text-text-muted">
                    (Block{' '}
                    <Link
                      href={`/block/${delegationBlockNumber}`}
                      className="text-accent-blue hover:text-accent-cyan"
                    >
                      {formatNumber(BigInt(delegationBlockNumber))}
                    </Link>
                    )
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
