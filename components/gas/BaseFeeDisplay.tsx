'use client'

import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface BaseFeeDisplayProps {
  baseFeeGwei: number
  blockNumber: number
  className?: string
}

/**
 * Current base fee display component
 *
 * Shows the EIP-1559 base fee per gas from the latest block
 */
export function BaseFeeDisplay({ baseFeeGwei, blockNumber, className }: BaseFeeDisplayProps) {
  // Determine color based on base fee level
  const getFeeLevel = (fee: number) => {
    if (fee >= 100) return { color: 'text-accent-red', label: 'EXTREME' }
    if (fee >= 50) return { color: 'text-accent-orange', label: 'HIGH' }
    if (fee >= 25) return { color: 'text-accent-yellow', label: 'MODERATE' }
    return { color: 'text-accent-green', label: 'LOW' }
  }

  const { color, label } = getFeeLevel(baseFeeGwei)

  return (
    <Card className={cn('p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs text-text-muted">BASE FEE (EIP-1559)</span>
        <span className={cn('font-mono text-xs font-semibold', color)}>{label}</span>
      </div>

      {/* Base fee value */}
      <div className="mb-3 flex items-baseline gap-1">
        <span className={cn('font-mono text-3xl font-bold', color)}>{baseFeeGwei.toFixed(2)}</span>
        <span className="font-mono text-lg text-text-secondary">Gwei</span>
      </div>

      {/* Block info */}
      <div className="flex items-center justify-between border-t border-bg-tertiary pt-3">
        <span className="font-mono text-xs text-text-muted">Block</span>
        <span className="font-mono text-sm text-accent-cyan">#{blockNumber.toLocaleString()}</span>
      </div>
    </Card>
  )
}
