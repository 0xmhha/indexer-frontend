'use client'

import { useEffect } from 'react'
import { useConsensusErrorSubscription } from '@/lib/hooks/useConsensus'
import { FEATURES } from '@/lib/config/constants'
import { formatNumber } from '@/lib/utils/format'
import {
  getSeverityBgColor,
  getSeverityIcon,
  isHighPrioritySeverity,
  type ConsensusErrorEvent,
} from '@/types/consensus'

/**
 * Real-time consensus error alert component
 * Subscribes to consensus errors and displays alerts
 */
export function ConsensusErrorAlert() {
  const { recentErrors } = useConsensusErrorSubscription()

  // Request browser notification permission on mount
  useEffect(() => {
    if (
      FEATURES.ENABLE_BROWSER_NOTIFICATIONS &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission()
    }
  }, [])

  // Send browser notification for critical errors
  useEffect(() => {
    if (!FEATURES.ENABLE_BROWSER_NOTIFICATIONS) return

    const latestError = recentErrors[0]
    if (!latestError || latestError.severity !== 'critical') return

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Critical Consensus Error', {
        body: `Block #${formatNumber(latestError.blockNumber)}: ${latestError.errorMessage}`,
        icon: '/logo.png',
        tag: `consensus-error-${latestError.blockNumber}`,
      })
    }
  }, [recentErrors])

  // Filter high priority errors
  const highPriorityErrors = recentErrors.filter((e) => isHighPrioritySeverity(e.severity))

  if (highPriorityErrors.length === 0) {
    return null
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex w-96 flex-col gap-2">
      {highPriorityErrors.slice(0, 3).map((error, index) => (
        <ErrorAlertCard key={`${error.blockNumber}-${index}`} error={error} />
      ))}
      {highPriorityErrors.length > 3 && (
        <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-2 text-center font-mono text-xs text-text-muted">
          +{highPriorityErrors.length - 3} more alerts
        </div>
      )}
    </div>
  )
}

interface ErrorAlertCardProps {
  error: ConsensusErrorEvent
}

function ErrorAlertCard({ error }: ErrorAlertCardProps) {
  const severityStyles = getSeverityBgColor(error.severity)
  const severityIcon = getSeverityIcon(error.severity)

  return (
    <div
      className={`animate-in slide-in-from-right rounded-lg border p-4 shadow-lg ${severityStyles}`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{severityIcon}</span>
          <div>
            <p className="font-mono text-sm font-semibold text-text-primary">
              Block #{formatNumber(error.blockNumber)}
            </p>
            <p className="font-mono text-xs text-text-muted">
              Round {error.round} • {error.errorType.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        <span
          className={`rounded px-2 py-0.5 font-mono text-xs font-semibold uppercase ${severityStyles}`}
        >
          {error.severity}
        </span>
      </div>

      <p className="mb-2 font-mono text-sm text-text-secondary">{error.errorMessage}</p>

      <div className="flex flex-wrap gap-3 font-mono text-xs text-text-muted">
        <span>Participation: {error.participationRate.toFixed(1)}%</span>
        {error.missedValidators && error.missedValidators.length > 0 && (
          <span>Missed: {error.missedValidators.length}</span>
        )}
        {error.consensusImpacted && (
          <span className="font-semibold text-red-400">Consensus Impacted</span>
        )}
      </div>
    </div>
  )
}

/**
 * Error history panel component
 * Displays a scrollable list of recent errors
 */
export function ConsensusErrorHistory() {
  const { recentErrors, errorsBySeverity, errorCount } = useConsensusErrorSubscription()

  if (recentErrors.length === 0) {
    return (
      <div className="rounded-lg border border-bg-tertiary bg-bg-secondary p-6 text-center">
        <p className="font-mono text-lg text-accent-green">No errors detected</p>
        <p className="mt-1 font-mono text-sm text-text-muted">Network is running smoothly</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-bg-tertiary bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bg-tertiary p-4">
        <h3 className="font-mono text-sm font-semibold text-text-primary">
          Recent Errors ({errorCount})
        </h3>
        <div className="flex gap-2">
          {errorsBySeverity.critical > 0 && (
            <span className="rounded bg-red-900/30 px-2 py-0.5 font-mono text-xs text-red-400">
              {errorsBySeverity.critical} critical
            </span>
          )}
          {errorsBySeverity.high > 0 && (
            <span className="rounded bg-orange-900/30 px-2 py-0.5 font-mono text-xs text-orange-400">
              {errorsBySeverity.high} high
            </span>
          )}
        </div>
      </div>

      {/* Error list */}
      <div className="max-h-96 overflow-y-auto p-2">
        <div className="space-y-2">
          {recentErrors.map((error, index) => (
            <ErrorHistoryItem key={`${error.blockNumber}-${index}`} error={error} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorHistoryItem({ error }: { error: ConsensusErrorEvent }) {
  const severityStyles = getSeverityBgColor(error.severity)
  const severityIcon = getSeverityIcon(error.severity)

  return (
    <div className={`rounded-lg border p-3 ${severityStyles}`}>
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{severityIcon}</span>
          <span className="font-mono text-sm font-semibold text-text-primary">
            Block #{formatNumber(error.blockNumber)}
          </span>
        </div>
        <span className="font-mono text-xs text-text-muted">
          {error.receivedAt
            ? new Date(error.receivedAt).toLocaleTimeString()
            : new Date(error.timestamp * 1000).toLocaleTimeString()}
        </span>
      </div>
      <p className="font-mono text-xs text-text-secondary">{error.errorMessage}</p>
      <div className="mt-1 flex gap-3 font-mono text-xs text-text-muted">
        <span>{error.errorType.replace(/_/g, ' ')}</span>
        <span>Rate: {error.participationRate.toFixed(1)}%</span>
      </div>
    </div>
  )
}
