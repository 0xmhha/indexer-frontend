'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { formatCurrency } from '@/lib/utils/format'
import { env } from '@/lib/config/env'

interface AddressOverviewCardProps {
  balance: bigint | null
  error: Error | null
}

/**
 * Address balance overview card (SRP: Only displays balance)
 */
export function AddressOverviewCard({ balance, error }: AddressOverviewCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-bg-tertiary">
        <CardTitle>OVERVIEW</CardTitle>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
