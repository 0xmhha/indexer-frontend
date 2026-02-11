import { Card, CardContent } from '@/components/ui/Card'

interface StatCardProps {
  label: string
  value: string
  icon: string
  color: string
  description: string
}

export function StatCard({ label, value, icon, color, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="annotation mb-2">{label}</div>
            <div className={`mb-1 font-mono text-2xl font-bold ${color}`}>{value}</div>
            <div className="font-mono text-xs text-text-muted">{description}</div>
          </div>
          <div className="text-3xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
