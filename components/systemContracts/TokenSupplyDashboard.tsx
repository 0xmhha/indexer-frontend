'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useTotalSupply, useActiveMinters, useMintEvents, useBurnEvents } from '@/lib/hooks/useSystemContracts'
import { formatNumber, formatDateTime } from '@/lib/utils/format'

/**
 * Token Supply Dashboard
 *
 * Displays comprehensive token supply information including:
 * - Total supply
 * - Active minters count
 * - Recent mint/burn activity
 */
export function TokenSupplyDashboard() {
  const { totalSupply, loading: supplyLoading, error: supplyError } = useTotalSupply()
  const { totalCount: mintersCount, loading: mintersLoading } = useActiveMinters({ limit: 1 })
  const { mintEvents, totalCount: totalMints, loading: mintsLoading } = useMintEvents({ limit: 5 })
  const { burnEvents, totalCount: totalBurns, loading: burnsLoading } = useBurnEvents({ limit: 5 })

  const loading = supplyLoading || mintersLoading || mintsLoading || burnsLoading

  if (loading && !totalSupply) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (supplyError) {
    return (
      <Card>
        <CardContent className="p-6">
          <ErrorDisplay title="Failed to load token supply data" message={supplyError.message} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Supply */}
        <StatCard
          label="TOTAL SUPPLY"
          value={totalSupply ? formatNumber(BigInt(totalSupply.amount)) : 'N/A'}
          icon="◈"
          color="text-accent-blue"
          {...(totalSupply && { subtitle: `Updated: ${formatDateTime(totalSupply.lastUpdated)}` })}
        />

        {/* Active Minters */}
        <StatCard
          label="ACTIVE MINTERS"
          value={mintersCount.toString()}
          icon="⚡"
          color="text-accent-cyan"
        />

        {/* Total Mints */}
        <StatCard
          label="TOTAL MINTS"
          value={formatNumber(totalMints)}
          icon="↑"
          color="text-accent-green"
        />

        {/* Total Burns */}
        <StatCard
          label="TOTAL BURNS"
          value={formatNumber(totalBurns)}
          icon="↓"
          color="text-accent-red"
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Mints */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>RECENT MINT EVENTS</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {mintsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : mintEvents.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="font-mono text-sm text-text-muted">No mint events found</p>
              </div>
            ) : (
              <div className="divide-y divide-bg-tertiary">
                {mintEvents.map((event, idx) => (
                  <div key={`${event.transactionHash}-${idx}`} className="p-4 hover:bg-bg-secondary">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 font-mono text-sm text-accent-green">
                          +{formatNumber(BigInt(event.amount))} tokens
                        </div>
                        <div className="mb-2 font-mono text-xs text-text-secondary">
                          Block {formatNumber(BigInt(event.blockNumber))} •{' '}
                          {formatDateTime(event.timestamp)}
                        </div>
                        <div className="space-y-1">
                          <div className="font-mono text-xs text-text-muted">
                            Minter: <span className="text-text-secondary">{event.minter}</span>
                          </div>
                          <div className="font-mono text-xs text-text-muted">
                            Recipient: <span className="text-text-secondary">{event.recipient}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Burns */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <CardTitle>RECENT BURN EVENTS</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {burnsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : burnEvents.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="font-mono text-sm text-text-muted">No burn events found</p>
              </div>
            ) : (
              <div className="divide-y divide-bg-tertiary">
                {burnEvents.map((event, idx) => (
                  <div key={`${event.transactionHash}-${idx}`} className="p-4 hover:bg-bg-secondary">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 font-mono text-sm text-accent-red">
                          -{formatNumber(BigInt(event.amount))} tokens
                        </div>
                        <div className="mb-2 font-mono text-xs text-text-secondary">
                          Block {formatNumber(BigInt(event.blockNumber))} •{' '}
                          {formatDateTime(event.timestamp)}
                        </div>
                        <div className="font-mono text-xs text-text-muted">
                          Burner: <span className="text-text-secondary">{event.burner}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
  subtitle,
}: {
  label: string
  value: string
  icon: string
  color: string
  subtitle?: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="annotation mb-2">{label}</div>
            <div className="font-mono text-2xl font-bold text-accent-blue">{value}</div>
            {subtitle && <div className="mt-1 font-mono text-xs text-text-muted">{subtitle}</div>}
          </div>
          <div className={`font-mono text-3xl ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
