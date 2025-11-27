'use client'

interface RoundIndicatorProps {
  round: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

/**
 * Round Indicator Component
 *
 * Displays the consensus round status with color coding:
 * - Round 0: Green (Success on first try)
 * - Round 1: Yellow (Minor consensus delay)
 * - Round 2: Orange (Multiple rounds needed)
 * - Round 3+: Red (Significant delay)
 */
export function RoundIndicator({ round, size = 'md', showLabel = true }: RoundIndicatorProps) {
  const getStatus = () => {
    if (round === 0) return { color: 'accent-green', bgColor: 'bg-accent-green/10', borderColor: 'border-accent-green', label: 'Success' }
    if (round === 1) return { color: 'yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500', label: 'Round Change' }
    if (round === 2) return { color: 'orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500', label: 'Multiple Rounds' }
    return { color: 'accent-red', bgColor: 'bg-accent-red/10', borderColor: 'border-accent-red', label: 'Significant Delay' }
  }

  const status = getStatus()

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded border font-mono ${sizeClasses[size]} ${status.bgColor} ${status.borderColor}`}
    >
      <span className={`font-bold text-${status.color}`}>R:{round}</span>
      {showLabel && (
        <span className={`text-${status.color} opacity-80`}>{status.label}</span>
      )}
    </div>
  )
}
