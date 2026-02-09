'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useLatestEpochData, useConsensusMonitoring } from '@/lib/hooks/useConsensus'
import { useBlocks } from '@/lib/hooks/useBlocks'
import { formatNumber } from '@/lib/utils/format'
import { ConsensusStatusCard } from './ConsensusStatusCard'
import { ValidatorLeaderboard } from './ValidatorLeaderboard'
import { RealTimeBlockCard } from './RealTimeBlockCard'
import { NetworkHealthStatus, ConnectionStatus } from './NetworkHealth'
import dynamic from 'next/dynamic'
import { ConsensusErrorHistory, ConsensusErrorAlert } from './ConsensusErrorAlert'
import { FEATURES, THRESHOLDS } from '@/lib/config/constants'

// Dynamic import for Recharts component to avoid SSR issues
const ParticipationChart = dynamic(
  () => import('./ParticipationChart').then((mod) => mod.ParticipationChart),
  { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-lg bg-bg-secondary" /> }
)

// Dynamic import for ValidatorHeatmap to avoid SSR issues
const ValidatorHeatmap = dynamic(
  () => import('./ValidatorHeatmap').then((mod) => mod.ValidatorHeatmap),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-lg bg-bg-secondary" /> }
)

// Import EpochTimeline
import { EpochTimeline } from './EpochTimeline'

/**
 * Consensus Dashboard Component
 *
 * Main dashboard displaying:
 * - Real-time block monitoring (WebSocket)
 * - Network health status
 * - Latest epoch overview
 * - Validator leaderboard
 * - Consensus error alerts
 */
export function ConsensusDashboard() {
  const { latestEpochData, loading: epochLoading } = useLatestEpochData()
  const { blocks } = useBlocks({ limit: 1 })

  // Real-time consensus monitoring
  const {
    isConnected,
    stats,
    networkHealth,
    highPriorityErrors,
  } = useConsensusMonitoring()

  const latestBlock = blocks?.[0]

  return (
    <div className="space-y-8">
      {/* Real-time Error Alerts (floating) */}
      {FEATURES.ENABLE_CONSENSUS_MONITORING && <ConsensusErrorAlert />}

      {/* Connection Status Bar */}
      {FEATURES.ENABLE_CONSENSUS_MONITORING && (
        <div className="flex items-center justify-between rounded-lg border border-bg-tertiary bg-bg-secondary p-4">
          <div className="flex items-center gap-4">
            <h2 className="font-mono text-lg font-semibold text-text-primary">
              Consensus Monitoring
            </h2>
            <ConnectionStatus />
          </div>
          {highPriorityErrors.length > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-red-900/30 px-3 py-1">
              <span className="font-mono text-sm text-red-400">
                {highPriorityErrors.length} Active Alerts
              </span>
            </div>
          )}
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ConsensusStatusCard
          title="Current Epoch"
          value={epochLoading ? '...' : latestEpochData?.epochNumber || 'N/A'}
          status="info"
          icon="📅"
        />
        <ConsensusStatusCard
          title="Active Validators"
          value={epochLoading ? '...' : formatNumber(latestEpochData?.validatorCount || 0)}
          status="success"
          icon="✓"
        />
        <ConsensusStatusCard
          title="Avg Participation"
          value={
            stats.totalBlocks > 0
              ? `${stats.averageParticipation.toFixed(1)}%`
              : epochLoading
                ? '...'
                : 'N/A'
          }
          status={stats.averageParticipation >= THRESHOLDS.HEALTH_EXCELLENT ? 'success' : stats.averageParticipation >= THRESHOLDS.HEALTH_GOOD ? 'warning' : 'danger'}
          icon="📊"
        />
        <ConsensusStatusCard
          title="Health Score"
          value={isConnected ? `${networkHealth.score}/100` : '--'}
          status={
            networkHealth.status === 'excellent'
              ? 'success'
              : networkHealth.status === 'good'
                ? 'info'
                : networkHealth.status === 'fair'
                  ? 'warning'
                  : 'danger'
          }
          icon={networkHealth.status === 'excellent' ? '🟢' : networkHealth.status === 'good' ? '🟡' : networkHealth.status === 'fair' ? '🟠' : '🔴'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Real-time Block & Network Health */}
        <div className="space-y-6">
          {/* Real-time Block Card */}
          {FEATURES.ENABLE_CONSENSUS_MONITORING ? (
            <RealTimeBlockCard />
          ) : (
            <Card>
              <CardHeader className="border-b border-bg-tertiary">
                <CardTitle>LATEST BLOCK</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="font-mono text-lg text-text-primary">
                  #{formatNumber(latestBlock?.number || 0)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Network Health */}
          {FEATURES.ENABLE_CONSENSUS_MONITORING && <NetworkHealthStatus />}
        </div>

        {/* Center Column - Validator Leaderboard */}
        <div className="lg:col-span-1">
          <ValidatorLeaderboard limit={10} />
        </div>

        {/* Right Column - Epoch Timeline & Error History */}
        <div className="space-y-6">
          {/* Epoch Timeline - Enhanced visual representation */}
          <EpochTimeline />

          {/* Error History */}
          {FEATURES.ENABLE_CONSENSUS_MONITORING && <ConsensusErrorHistory />}

          {/* Quick Links */}
          <Card>
            <CardHeader className="border-b border-bg-tertiary">
              <CardTitle>QUICK LINKS</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Link
                  href="/validators"
                  className="flex items-center justify-between rounded border border-bg-tertiary p-3 font-mono text-sm text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue"
                >
                  <span>All Validators</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/epochs"
                  className="flex items-center justify-between rounded border border-bg-tertiary p-3 font-mono text-sm text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue"
                >
                  <span>Epoch History</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/blocks"
                  className="flex items-center justify-between rounded border border-bg-tertiary p-3 font-mono text-sm text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue"
                >
                  <span>Block Explorer</span>
                  <span>→</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Validator Heatmap - Full Width */}
      {FEATURES.ENABLE_CONSENSUS_MONITORING && (
        <div className="mt-8">
          <ValidatorHeatmap limit={10} />
        </div>
      )}

      {/* Participation Rate Chart - Full Width */}
      {FEATURES.ENABLE_CONSENSUS_MONITORING && (
        <div className="mt-8">
          <ParticipationChart />
        </div>
      )}
    </div>
  )
}

