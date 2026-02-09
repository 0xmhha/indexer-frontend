'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { CopyButton } from '@/components/common/CopyButton'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useProxyDetection, useProxyTypeLabel } from '@/lib/hooks/useProxyDetection'
import type { ProxyType } from '@/lib/hooks/useProxyDetection'
import { cn } from '@/lib/utils'

interface ProxyContractInfoProps {
  address: string
  isContract: boolean
  className?: string
}

/**
 * Get icon and color for proxy type
 */
function getProxyTypeStyle(proxyType: ProxyType): { icon: string; color: string } {
  switch (proxyType) {
    case 'transparent':
      return { icon: '🔒', color: 'text-accent-cyan' }
    case 'uups':
      return { icon: '⬆️', color: 'text-accent-purple' }
    case 'beacon':
      return { icon: '📡', color: 'text-accent-yellow' }
    case 'unknown':
      return { icon: '❓', color: 'text-text-muted' }
    default:
      return { icon: '📄', color: 'text-text-secondary' }
  }
}

/**
 * Address display with link and copy button
 */
function AddressLink({ label, address }: { label: string; address: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-xs text-text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <Link
          href={`/address/${address}`}
          className="font-mono text-sm text-accent-blue hover:underline"
        >
          {address}
        </Link>
        <CopyButton text={address} size="sm" />
      </div>
    </div>
  )
}

/**
 * Proxy Contract Info Component
 *
 * Displays EIP-1967 proxy information including:
 * - Proxy type (Transparent, UUPS, Beacon)
 * - Implementation address
 * - Admin address (for transparent proxies)
 * - Beacon address (for beacon proxies)
 */
export function ProxyContractInfo({ address, isContract, className }: ProxyContractInfoProps) {
  const { proxyInfo, loading, error } = useProxyDetection(address, isContract)
  const proxyTypeLabel = useProxyTypeLabel(proxyInfo?.proxyType ?? 'none')

  // Don't render if not a contract
  if (!isContract) {
    return null
  }

  // Loading state
  if (loading) {
    return (
      <Card className={cn('mb-6', className)}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>PROXY DETECTION</CardTitle>
        </CardHeader>
        <CardContent className="flex h-20 items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('mb-6', className)}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>PROXY DETECTION</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="font-mono text-xs text-text-muted">
            Failed to detect proxy: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Not a proxy
  if (!proxyInfo?.isProxy) {
    return null
  }

  const { icon, color } = getProxyTypeStyle(proxyInfo.proxyType)

  return (
    <Card className={cn('mb-6', className)}>
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center gap-2">
          <span>{icon}</span>
          PROXY CONTRACT
          <span
            className={cn(
              'rounded bg-accent-cyan/20 px-2 py-0.5 text-xs',
              color
            )}
          >
            {proxyTypeLabel}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Implementation Address */}
          {proxyInfo.implementationAddress && (
            <AddressLink
              label="Implementation Contract"
              address={proxyInfo.implementationAddress}
            />
          )}

          {/* Admin Address (Transparent Proxy) */}
          {proxyInfo.adminAddress && (
            <AddressLink label="Proxy Admin" address={proxyInfo.adminAddress} />
          )}

          {/* Beacon Address (Beacon Proxy) */}
          {proxyInfo.beaconAddress && (
            <AddressLink label="Beacon Contract" address={proxyInfo.beaconAddress} />
          )}

          {/* Info Box */}
          <div className="mt-4 rounded border border-bg-tertiary bg-bg-secondary/50 p-3">
            <div className="font-mono text-xs leading-relaxed text-text-secondary">
              {proxyInfo.proxyType === 'transparent' && (
                <>
                  This is a <strong className="text-accent-cyan">Transparent Proxy</strong> contract
                  (EIP-1967). The proxy admin can upgrade the implementation. Read and write
                  operations are delegated to the implementation contract.
                </>
              )}
              {proxyInfo.proxyType === 'uups' && (
                <>
                  This is a <strong className="text-accent-purple">UUPS Proxy</strong> contract
                  (EIP-1967). Upgrade logic is in the implementation contract itself. Read and write
                  operations are delegated to the implementation.
                </>
              )}
              {proxyInfo.proxyType === 'beacon' && (
                <>
                  This is a <strong className="text-accent-yellow">Beacon Proxy</strong> contract
                  (EIP-1967). The beacon contract stores the implementation address. Multiple proxies
                  can share the same beacon for simultaneous upgrades.
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
