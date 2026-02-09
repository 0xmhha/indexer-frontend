'use client'

import { Card } from '@/components/ui/Card'
import { formatNumber } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

interface NetworkUtilizationBarProps {
  utilization: number
  gasUsed: bigint
  gasLimit: bigint
  className?: string
}

/**
 * Network block utilization indicator
 *
 * Shows how full the latest block was as a percentage
 */
export function NetworkUtilizationBar({
  utilization,
  gasUsed,
  gasLimit,
  className,
}: NetworkUtilizationBarProps) {
  // Determine color based on utilization level
  const getUtilizationColor = (util: number) => {
    if (util >= 90) return 'bg-accent-red'
    if (util >= 70) return 'bg-accent-orange'
    if (util >= 50) return 'bg-accent-yellow'
    return 'bg-accent-green'
  }

  const getUtilizationText = (util: number) => {
    if (util >= 90) return 'text-accent-red'
    if (util >= 70) return 'text-accent-orange'
    if (util >= 50) return 'text-accent-yellow'
    return 'text-accent-green'
  }

  const getNetworkStatus = (util: number) => {
    if (util >= 90) return 'CONGESTED'
    if (util >= 70) return 'BUSY'
    if (util >= 50) return 'MODERATE'
    return 'LOW'
  }

  const barColor = getUtilizationColor(utilization)
  const textColor = getUtilizationText(utilization)
  const status = getNetworkStatus(utilization)

  return (
    <Card className={cn('p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs text-text-muted">NETWORK UTILIZATION</span>
        <span className={cn('font-mono text-xs font-semibold', textColor)}>{status}</span>
      </div>

      {/* Utilization percentage */}
      <div className="mb-3 flex items-baseline gap-1">
        <span className={cn('font-mono text-3xl font-bold', textColor)}>
          {utilization.toFixed(1)}
        </span>
        <span className="font-mono text-lg text-text-secondary">%</span>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-bg-tertiary">
        <div
          className={cn('h-full transition-all duration-500', barColor)}
          style={{ width: `${Math.min(100, utilization)}%` }}
        />
      </div>

      {/* Gas used / Gas limit */}
      <div className="flex items-center justify-between font-mono text-xs text-text-muted">
        <span>Gas Used: {formatNumber(Number(gasUsed))}</span>
        <span>Limit: {formatNumber(Number(gasLimit))}</span>
      </div>
    </Card>
  )
}
