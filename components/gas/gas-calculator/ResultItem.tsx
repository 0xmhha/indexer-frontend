interface ResultItemProps {
  label: string
  value: string
  description: string
  color: string
}

export function ResultItem({ label, value, description, color }: ResultItemProps) {
  return (
    <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
      <div className="mb-1 font-mono text-xs text-text-muted">{label}</div>
      <div className={`mb-2 font-mono text-xl font-bold ${color}`}>{value}</div>
      <div className="font-mono text-xs text-text-secondary">{description}</div>
    </div>
  )
}
