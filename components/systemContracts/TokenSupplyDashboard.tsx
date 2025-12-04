'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'
import { useTotalSupply, useActiveMinters, useMintEvents, useBurnEvents } from '@/lib/hooks/useSystemContracts'
import { formatNumber, formatDateTime, formatTokenAmount, truncateAddress } from '@/lib/utils/format'
import { FORMATTING, UI } from '@/lib/config/constants'

/**
 * Token Supply Dashboard
 *
 * Displays comprehensive token supply information including:
 * - Total supply
 * - Active minters count
 * - 24-hour mint/burn statistics
 * - Recent mint/burn activity
 */
export function TokenSupplyDashboard() {
  const { totalSupply, loading: supplyLoading, error: supplyError } = useTotalSupply()
  const { minters, totalCount: mintersCount, loading: mintersLoading } = useActiveMinters()
  const { mintEvents, loading: mintsLoading } = useMintEvents({ limit: 50 })
  const { burnEvents, loading: burnsLoading } = useBurnEvents({ limit: 50 })

  // Calculate 24-hour statistics
  const stats24h = useMemo(() => {
    const now = Math.floor(Date.now() / FORMATTING.MS_PER_SECOND)
    const oneDayAgo = now - FORMATTING.SECONDS_PER_DAY

    // Filter events from last 24 hours (timestamp is string, convert to number)
    const recentMints = mintEvents.filter((e) => parseInt(e.timestamp) >= oneDayAgo)
    const recentBurns = burnEvents.filter((e) => parseInt(e.timestamp) >= oneDayAgo)

    // Calculate totals
    const totalMinted24h = recentMints.reduce((sum, e) => sum + BigInt(e.amount), BigInt(0))
    const totalBurned24h = recentBurns.reduce((sum, e) => sum + BigInt(e.amount), BigInt(0))

    // Calculate all-time totals from available events
    const totalMintedAll = mintEvents.reduce((sum, e) => sum + BigInt(e.amount), BigInt(0))
    const totalBurnedAll = burnEvents.reduce((sum, e) => sum + BigInt(e.amount), BigInt(0))

    return {
      mintCount24h: recentMints.length,
      burnCount24h: recentBurns.length,
      totalMinted24h,
      totalBurned24h,
      totalMintedAll,
      totalBurnedAll,
      netChange24h: totalMinted24h - totalBurned24h,
    }
  }, [mintEvents, burnEvents])

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

  // Get most recent events for display
  const recentMints = mintEvents.slice(0, UI.MAX_LIST_PREVIEW)
  const recentBurns = burnEvents.slice(0, UI.MAX_LIST_PREVIEW)

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Supply */}
        {totalSupply ? (
          <StatCard
            label="TOTAL SUPPLY"
            value={formatTokenAmount(totalSupply)}
            icon="◈"
            color="text-accent-blue"
            subtitle={`${formatNumber(BigInt(totalSupply))} wei`}
          />
        ) : (
          <StatCard
            label="TOTAL SUPPLY"
            value="N/A"
            icon="◈"
            color="text-accent-blue"
          />
        )}

        {/* Active Minters */}
        <StatCard
          label="ACTIVE MINTERS"
          value={mintersCount.toString()}
          icon="⚡"
          color="text-accent-cyan"
          subtitle={minters.length > 0 ? 'Currently authorized' : 'None active'}
        />

        {/* 24h Mint Volume */}
        <StatCard
          label="24H MINTED"
          value={formatTokenAmount(stats24h.totalMinted24h.toString())}
          icon="↑"
          color="text-accent-green"
          subtitle={`${stats24h.mintCount24h} transaction${stats24h.mintCount24h !== 1 ? 's' : ''}`}
        />

        {/* 24h Burn Volume */}
        <StatCard
          label="24H BURNED"
          value={formatTokenAmount(stats24h.totalBurned24h.toString())}
          icon="↓"
          color="text-accent-red"
          subtitle={`${stats24h.burnCount24h} transaction${stats24h.burnCount24h !== 1 ? 's' : ''}`}
        />
      </div>

      {/* 24h Net Change Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="annotation mb-1">24H NET CHANGE</div>
              <div
                className={`font-mono text-2xl font-bold ${
                  stats24h.netChange24h >= BigInt(0) ? 'text-accent-green' : 'text-accent-red'
                }`}
              >
                {stats24h.netChange24h >= BigInt(0) ? '+' : ''}
                {formatTokenAmount(stats24h.netChange24h.toString())}
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="font-mono text-xs text-text-muted">Total Minted (Recent)</div>
                <div className="font-mono text-lg text-accent-green">
                  +{formatTokenAmount(stats24h.totalMintedAll.toString())}
                </div>
              </div>
              <div className="text-center">
                <div className="font-mono text-xs text-text-muted">Total Burned (Recent)</div>
                <div className="font-mono text-lg text-accent-red">
                  -{formatTokenAmount(stats24h.totalBurnedAll.toString())}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Mints */}
        <Card>
          <CardHeader className="border-b border-bg-tertiary">
            <div className="flex items-center justify-between">
              <CardTitle>RECENT MINT EVENTS</CardTitle>
              <span className="font-mono text-xs text-text-muted">{mintEvents.length} loaded</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {mintsLoading && recentMints.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : recentMints.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="font-mono text-sm text-text-muted">No mint events found</p>
              </div>
            ) : (
              <div className="divide-y divide-bg-tertiary">
                {recentMints.map((event, idx) => (
                  <div key={`${event.transactionHash}-${idx}`} className="p-4 hover:bg-bg-secondary">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 font-mono text-sm text-accent-green">
                          +{formatTokenAmount(event.amount)}
                        </div>
                        <div className="mb-2 font-mono text-xs text-text-secondary">
                          Block {formatNumber(BigInt(event.blockNumber))} •{' '}
                          {formatDateTime(event.timestamp)}
                        </div>
                        <div className="space-y-1">
                          <div className="font-mono text-xs text-text-muted">
                            Minter:{' '}
                            <span className="text-text-secondary" title={event.minter}>
                              {truncateAddress(event.minter)}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-text-muted">
                            To:{' '}
                            <span className="text-text-secondary" title={event.to}>
                              {truncateAddress(event.to)}
                            </span>
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
            <div className="flex items-center justify-between">
              <CardTitle>RECENT BURN EVENTS</CardTitle>
              <span className="font-mono text-xs text-text-muted">{burnEvents.length} loaded</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {burnsLoading && recentBurns.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : recentBurns.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="font-mono text-sm text-text-muted">No burn events found</p>
              </div>
            ) : (
              <div className="divide-y divide-bg-tertiary">
                {recentBurns.map((event, idx) => (
                  <div key={`${event.transactionHash}-${idx}`} className="p-4 hover:bg-bg-secondary">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 font-mono text-sm text-accent-red">
                          -{formatTokenAmount(event.amount)}
                        </div>
                        <div className="mb-2 font-mono text-xs text-text-secondary">
                          Block {formatNumber(BigInt(event.blockNumber))} •{' '}
                          {formatDateTime(event.timestamp)}
                        </div>
                        <div className="font-mono text-xs text-text-muted">
                          Burner:{' '}
                          <span className="text-text-secondary" title={event.burner}>
                            {truncateAddress(event.burner)}
                          </span>
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
