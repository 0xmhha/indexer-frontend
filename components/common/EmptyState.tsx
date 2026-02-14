import { Card, CardContent } from '@/components/ui/Card'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon = '📭', title, description, className }: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mb-3 text-3xl" aria-hidden="true">{icon}</div>
        <p className="font-mono text-sm font-bold text-text-secondary">{title}</p>
        {description && (
          <p className="mt-1 font-mono text-xs text-text-muted">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
