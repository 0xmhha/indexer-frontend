'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { CopyButton } from '@/components/common/CopyButton'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatCurrencyFull } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import { getSystemContractInfo } from '@/lib/config/constants'

interface AddressOverviewCardProps {
  address?: string
  balance: bigint | null
  loading?: boolean
  error: Error | null
}

/**
 * Address balance overview card
 * Displays the native coin balance from RPC eth_getBalance via backend RPC proxy
 */
export function AddressOverviewCard({ address, balance, loading = false, error }: AddressOverviewCardProps) {
  // Check if this is a known system contract
  const systemInfo = address ? getSystemContractInfo(address) : null

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle className="flex items-center gap-2">
          OVERVIEW
          {systemInfo && (
            <span
              className="rounded bg-accent-cyan/20 px-2 py-0.5 text-xs text-accent-cyan"
              title={systemInfo.description}
            >
              {systemInfo.name}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {error && !balance ? (
          <ErrorDisplay title="Failed to load balance" message={error.message} />
        ) : (
          <div>
            <div className="annotation mb-2">{env.currencySymbol} BALANCE</div>
            <div className="flex items-center gap-2">
              <div className="font-mono text-2xl font-bold text-accent-blue">
                {loading ? 'Loading...' : balance !== null ? formatCurrencyFull(balance, env.currencySymbol) : '0.000000000000000000'}
              </div>
              {balance !== null && address && (
                <CopyButton text={balance.toString()} size="sm" />
              )}
            </div>
            {systemInfo?.isNativeWrapper && (
              <div className="mt-2 text-xs text-text-muted">
                This is the native coin ERC20 wrapper. Balance equals total {env.currencySymbol} supply.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
