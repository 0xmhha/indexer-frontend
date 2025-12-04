'use client'

import { useMemo } from 'react'
import { useConsensusStore } from '@/stores/consensusStore'
import { useRealtimeStore } from '@/stores/realtimeStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

/**
 * Network health status component
 * Displays overall network health based on consensus data
 * Uses centralized WebSocket connection status from realtimeStore
 */
export function NetworkHealthStatus() {
  const { networkHealth, stats } = useConsensusStore()
  const isConnected = useRealtimeStore((s) => s.isConnected)

  const healthColor = useMemo(() => {
    switch (networkHealth.status) {
      case 'excellent':
        return 'text-green-400'
      case 'good':
        return 'text-yellow-400'
      case 'fair':
        return 'text-orange-400'
      case 'poor':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }, [networkHealth.status])

  const healthBgColor = useMemo(() => {
    switch (networkHealth.status) {
      case 'excellent':
        return 'bg-green-500'
      case 'good':
        return 'bg-yellow-500'
      case 'fair':
        return 'bg-orange-500'
      case 'poor':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }, [networkHealth.status])

  const statusIcon = useMemo(() => {
    switch (networkHealth.status) {
      case 'excellent':
        return '🟢'
      case 'good':
        return '🟡'
      case 'fair':
        return '🟠'
      case 'poor':
        return '🔴'
      default:
        return '⚪'
    }
  }, [networkHealth.status])

  return (
    <Card>
      <CardHeader className="border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <CardTitle>NETWORK HEALTH</CardTitle>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
            />
            <span className="font-mono text-xs text-text-muted">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Health Score */}
        <div className="mb-6 rounded-lg border border-bg-tertiary bg-bg-secondary p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-sm text-text-muted">Health Score</span>
            <span className="font-mono text-sm text-text-muted">
              {statusIcon} {networkHealth.status.charAt(0).toUpperCase() + networkHealth.status.slice(1)}
            </span>
          </div>
          <div className="flex items-baseline">
            <span className={`font-mono text-5xl font-bold ${healthColor}`}>
              {networkHealth.score}
            </span>
            <span className="ml-2 font-mono text-lg text-text-muted">/100</span>
          </div>
          {/* Health bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-bg-tertiary">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${healthBgColor}`}
              style={{ width: `${networkHealth.score}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-3">
            <p className="font-mono text-xs text-text-muted">Total Blocks</p>
            <p className="font-mono text-xl font-bold text-text-primary">
              {stats.totalBlocks.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-3">
            <p className="font-mono text-xs text-text-muted">Avg Participation</p>
            <p className="font-mono text-xl font-bold text-accent-green">
              {stats.averageParticipation.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-3">
            <p className="font-mono text-xs text-text-muted">Round Changes</p>
            <p className="font-mono text-xl font-bold text-yellow-400">{stats.roundChanges}</p>
          </div>
          <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-3">
            <p className="font-mono text-xs text-text-muted">Errors</p>
            <p className="font-mono text-xl font-bold text-red-400">{stats.errorCount}</p>
          </div>
        </div>

        {/* Error breakdown if any */}
        {stats.errorCount > 0 && (
          <div className="mt-4 rounded-lg border border-bg-tertiary bg-bg-secondary p-3">
            <p className="mb-2 font-mono text-xs text-text-muted">Error Breakdown</p>
            <div className="flex flex-wrap gap-2">
              {stats.errorsBySeverity.critical > 0 && (
                <span className="rounded bg-red-900/30 px-2 py-1 font-mono text-xs text-red-400">
                  {stats.errorsBySeverity.critical} critical
                </span>
              )}
              {stats.errorsBySeverity.high > 0 && (
                <span className="rounded bg-orange-900/30 px-2 py-1 font-mono text-xs text-orange-400">
                  {stats.errorsBySeverity.high} high
                </span>
              )}
              {stats.errorsBySeverity.medium > 0 && (
                <span className="rounded bg-yellow-900/30 px-2 py-1 font-mono text-xs text-yellow-400">
                  {stats.errorsBySeverity.medium} medium
                </span>
              )}
              {stats.errorsBySeverity.low > 0 && (
                <span className="rounded bg-blue-900/30 px-2 py-1 font-mono text-xs text-blue-400">
                  {stats.errorsBySeverity.low} low
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Compact network health indicator for headers/sidebars
 * Uses centralized WebSocket connection status from realtimeStore
 */
export function NetworkHealthIndicator() {
  const { networkHealth } = useConsensusStore()
  const isConnected = useRealtimeStore((s) => s.isConnected)

  const statusColor = useMemo(() => {
    switch (networkHealth.status) {
      case 'excellent':
        return 'bg-green-500'
      case 'good':
        return 'bg-yellow-500'
      case 'fair':
        return 'bg-orange-500'
      case 'poor':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }, [networkHealth.status])

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full ${isConnected ? statusColor : 'bg-gray-500'} ${isConnected ? 'animate-pulse' : ''}`}
        title={`Network Health: ${networkHealth.score}/100 (${networkHealth.status})`}
      />
      <span className="font-mono text-xs text-text-muted">
        {isConnected ? networkHealth.score : '--'}
      </span>
    </div>
  )
}

/**
 * Connection status badge
 * Uses centralized WebSocket connection status from realtimeStore
 */
export function ConnectionStatus() {
  const isConnected = useRealtimeStore((s) => s.isConnected)

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
        isConnected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
      }`}
    >
      <div
        className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
      />
      <span className="font-mono text-xs">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  )
}
