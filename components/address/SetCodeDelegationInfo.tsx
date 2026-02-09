'use client'

import Link from 'next/link'
import { useAddressSetCodeInfo } from '@/lib/hooks/useAddress'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatNumber } from '@/lib/utils/format'
import { CopyButton } from '@/components/common/CopyButton'

interface SetCodeDelegationInfoProps {
  address: string
}

/**
 * Component to display EIP-7702 SetCode delegation info for EOA addresses
 * Uses the authoritative addressSetCodeInfo API to check delegation state
 */
export function SetCodeDelegationInfo({ address }: SetCodeDelegationInfoProps) {
  const { info, hasDelegation, delegationTarget, loading } = useAddressSetCodeInfo(address)

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

  if (!hasDelegation || !info) {
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
          {/* Delegation Target */}
          {delegationTarget && (
            <div>
              <div className="annotation mb-2">DELEGATION TARGET</div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/address/${delegationTarget}`}
                  className="font-mono text-accent-blue hover:text-accent-cyan"
                >
                  {delegationTarget}
                </Link>
                <CopyButton text={delegationTarget} size="sm" />
              </div>
              <p className="mt-1 text-xs text-text-muted">
                This EOA delegates its code execution to the above contract
              </p>
            </div>
          )}

          {/* Activity Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="annotation mb-2">AS AUTHORITY</div>
              <div className="font-mono text-text-primary">
                {info.asAuthorityCount} authorization{info.asAuthorityCount !== 1 ? 's' : ''}
              </div>
            </div>
            <div>
              <div className="annotation mb-2">AS TARGET</div>
              <div className="font-mono text-text-primary">
                {info.asTargetCount} delegation{info.asTargetCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Last Activity */}
          {info.lastActivityBlock && (
            <div className="border-t border-bg-tertiary pt-4">
              <div className="annotation mb-2">LAST ACTIVITY</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Block</span>
                <Link
                  href={`/block/${info.lastActivityBlock}`}
                  className="font-mono text-sm text-accent-blue hover:text-accent-cyan"
                >
                  {formatNumber(BigInt(info.lastActivityBlock))}
                </Link>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
