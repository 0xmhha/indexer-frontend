'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'
import { getSystemContractInfo } from '@/lib/config/constants'

interface AddressOverviewCardProps {
  address?: string
  balance: bigint | null
  error: Error | null
}

/**
 * Address balance overview card (SRP: Only displays balance)
 */
export function AddressOverviewCard({ address, balance, error }: AddressOverviewCardProps) {
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
        {error ? (
          <ErrorDisplay title="Failed to load balance" message={error.message} />
        ) : (
          <div>
            <div className="annotation mb-2">BALANCE</div>
            <div className="font-mono text-3xl font-bold text-accent-blue">
              {balance !== null ? formatCurrency(balance, env.currencySymbol) : 'Loading...'}
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
