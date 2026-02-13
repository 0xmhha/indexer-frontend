import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingSkeleton } from '@/components/common/LoadingSpinner'

interface StatCardProps {
  /** Upper label text (annotation style) */
  label: string
  /** Primary value to display */
  value: string | null
  /** Show loading skeleton instead of value */
  loading?: boolean
  /** Optional emoji/icon to display top-right */
  icon?: string
  /** Color class for value text (default: text-accent-blue) */
  color?: string
  /** Subtitle or description below value */
  subtitle?: string
  /** Optional info text below value (alias for subtitle) */
  info?: string
  /** Link destination — wraps entire card in a link */
  link?: string
}

export function StatCard({
  label,
  value,
  loading = false,
  icon,
  color = 'text-accent-blue',
  subtitle,
  info,
  link,
}: StatCardProps) {
  const description = subtitle || info

  const content = (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="annotation mb-2">{label}</div>
            {loading ? (
              <LoadingSkeleton className="h-8 w-24" />
            ) : (
              <div className={`mb-1 font-mono text-2xl font-bold ${color}`}>{value}</div>
            )}
            {description && <div className="mt-1 font-mono text-xs text-text-muted">{description}</div>}
          </div>
          {icon && <div className="text-3xl">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )

  if (link) {
    return (
      <Link href={link} className="transition-transform hover:scale-105">
        {content}
      </Link>
    )
  }

  return content
}
