'use client'

import { Card } from '@/components/ui/Card'
import { weiToGwei } from '@/lib/utils/gas'
import type { GasPriceLevel } from '@/lib/hooks/useGasTracker'
import { cn } from '@/lib/utils'

interface GasPriceLevelCardProps {
  level: GasPriceLevel
  className?: string
}

/**
 * Individual gas price recommendation card
 *
 * Displays a single gas price tier with its recommended values
 */
export function GasPriceLevelCard({ level, className }: GasPriceLevelCardProps) {
  const { tier, label, icon, maxFeePerGas, maxPriorityFee, displayLabel } = level

  const maxFeeGwei = weiToGwei(maxFeePerGas)
  const priorityGwei = weiToGwei(maxPriorityFee)

  // Tier-specific styling
  const tierStyles = {
    economy: {
      border: 'border-accent-green/30 hover:border-accent-green/50',
      bg: 'bg-accent-green/5',
      text: 'text-accent-green',
      glow: 'hover:shadow-accent-green/10',
    },
    standard: {
      border: 'border-accent-blue/30 hover:border-accent-blue/50',
      bg: 'bg-accent-blue/5',
      text: 'text-accent-blue',
      glow: 'hover:shadow-accent-blue/10',
    },
    priority: {
      border: 'border-accent-orange/30 hover:border-accent-orange/50',
      bg: 'bg-accent-orange/5',
      text: 'text-accent-orange',
      glow: 'hover:shadow-accent-orange/10',
    },
  }

  const styles = tierStyles[tier]

  return (
    <Card
      className={cn(
        'p-4 transition-all duration-200',
        styles.border,
        styles.bg,
        styles.glow,
        'hover:shadow-lg',
        className
      )}
    >
      {/* Header with icon and label */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label={label}>
            {icon}
          </span>
          <span className={cn('font-mono text-sm font-semibold uppercase', styles.text)}>
            {label}
          </span>
        </div>
        <span className="font-mono text-xs text-text-muted">{displayLabel}</span>
      </div>

      {/* Max Fee Per Gas */}
      <div className="mb-3">
        <div className="mb-1 font-mono text-xs text-text-muted">Max Fee</div>
        <div className={cn('font-mono text-2xl font-bold', styles.text)}>
          {maxFeeGwei.toFixed(1)}
          <span className="ml-1 text-sm font-normal text-text-secondary">Gwei</span>
        </div>
      </div>

      {/* Priority Fee */}
      <div className="border-t border-bg-tertiary pt-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-text-muted">Priority Fee</span>
          <span className="font-mono text-sm text-text-secondary">
            {priorityGwei.toFixed(2)} Gwei
          </span>
        </div>
      </div>
    </Card>
  )
}
