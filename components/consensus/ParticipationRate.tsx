import { getParticipationRateColor } from '@/lib/utils/consensus'

interface ParticipationRateProps {
  rate: number
  size?: 'sm' | 'md' | 'lg'
  showBar?: boolean
  label?: string
}

/**
 * Participation Rate Component
 *
 * Displays participation rate with color coding:
 * - >= 95%: Green (Excellent)
 * - >= 80%: Cyan (Good)
 * - >= 67%: Yellow (Acceptable - 2/3 threshold)
 * - < 67%: Red (Critical)
 */
export function ParticipationRate({
  rate,
  size = 'md',
  showBar = true,
  label,
}: ParticipationRateProps) {
  const color = getParticipationRateColor(rate)

  const sizeClasses = {
    sm: { text: 'text-sm', bar: 'h-1' },
    md: { text: 'text-lg', bar: 'h-2' },
    lg: { text: 'text-2xl', bar: 'h-3' },
  }

  return (
    <div className="space-y-1">
      {label && (
        <div className="font-mono text-xs text-text-muted">{label}</div>
      )}
      <div className="flex items-center gap-2">
        <span className={`font-mono font-bold ${color.text} ${sizeClasses[size].text}`}>
          {rate.toFixed(2)}%
        </span>
      </div>
      {showBar && (
        <div className={`w-full overflow-hidden rounded-full bg-bg-tertiary ${sizeClasses[size].bar}`}>
          <div
            className={`h-full transition-all duration-300 ${color.bg}`}
            style={{ width: `${Math.min(rate, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
