interface BenefitCardProps {
  icon: string
  title: string
  description: string
  color: string
}

export function BenefitCard({ icon, title, description, color }: BenefitCardProps) {
  return (
    <div className="rounded border border-bg-tertiary bg-bg-secondary p-4">
      <div className="mb-2 text-3xl">{icon}</div>
      <div className={`mb-2 font-mono text-sm font-bold ${color}`}>{title}</div>
      <div className="font-mono text-xs text-text-secondary">{description}</div>
    </div>
  )
}
