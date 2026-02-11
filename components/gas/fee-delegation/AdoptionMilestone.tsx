interface AdoptionMilestoneProps {
  label: string
  threshold: number
  current: number
  reached: boolean
}

export function AdoptionMilestone({ label, threshold, current, reached }: AdoptionMilestoneProps) {
  return (
    <div
      className={`rounded border p-3 ${
        reached
          ? 'border-accent-green/30 bg-accent-green/5'
          : 'border-bg-tertiary bg-bg-secondary'
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className={`text-lg ${reached ? 'text-accent-green' : 'text-text-muted'}`}>
          {reached ? '\u2713' : '\u25CB'}
        </span>
        <span
          className={`font-mono text-xs font-bold ${
            reached ? 'text-accent-green' : 'text-text-secondary'
          }`}
        >
          {label}
        </span>
      </div>
      <div className="font-mono text-xs text-text-muted">
        {threshold}% threshold {reached ? 'reached' : `(${(threshold - current).toFixed(1)}% to go)`}
      </div>
    </div>
  )
}
