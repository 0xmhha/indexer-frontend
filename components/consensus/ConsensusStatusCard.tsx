'use client'

import { Card, CardContent } from '@/components/ui/Card'

interface ConsensusStatusCardProps {
  title: string
  value: string | number
  subtitle?: string
  status?: 'success' | 'warning' | 'danger' | 'info'
  icon?: string
  trend?: {
    direction: 'up' | 'down' | 'stable'
    value: string
  }
}

/**
 * Consensus Status Card Component
 *
 * Displays key metrics in a card format with status indicators.
 */
export function ConsensusStatusCard({
  title,
  value,
  subtitle,
  status = 'info',
  icon,
  trend,
}: ConsensusStatusCardProps) {
  const statusColors = {
    success: 'border-accent-green/30 bg-accent-green/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    danger: 'border-accent-red/30 bg-accent-red/5',
    info: 'border-accent-blue/30 bg-accent-blue/5',
  }

  const valueColors = {
    success: 'text-accent-green',
    warning: 'text-yellow-500',
    danger: 'text-accent-red',
    info: 'text-accent-blue',
  }

  const trendIcons = {
    up: '▲',
    down: '▼',
    stable: '●',
  }

  const trendColors = {
    up: 'text-accent-green',
    down: 'text-accent-red',
    stable: 'text-text-muted',
  }

  return (
    <Card className={`border ${statusColors[status]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 font-mono text-xs uppercase tracking-wider text-text-muted">
              {title}
            </div>
            <div className={`font-mono text-2xl font-bold ${valueColors[status]}`}>
              {value}
            </div>
            {subtitle && (
              <div className="mt-1 font-mono text-xs text-text-secondary">{subtitle}</div>
            )}
            {trend && (
              <div className={`mt-2 flex items-center gap-1 font-mono text-xs ${trendColors[trend.direction]}`}>
                <span>{trendIcons[trend.direction]}</span>
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`text-3xl ${valueColors[status]} opacity-50`}>{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
