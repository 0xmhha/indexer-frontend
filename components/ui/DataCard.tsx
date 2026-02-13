'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorDisplay } from '@/components/common/ErrorBoundary'

interface DataCardProps {
  /** Card title displayed in the header */
  title: string
  /** Loading state — shows spinner */
  loading?: boolean
  /** Error state — shows error display */
  error?: Error | null | undefined
  /** Whether data is empty/null — shows empty message */
  isEmpty?: boolean
  /** Custom empty state message */
  emptyMessage?: string
  /** Card content to render when data is available */
  children?: React.ReactNode
  /** Additional className for the Card */
  className?: string
  /** Custom error title */
  errorTitle?: string
}

/**
 * Generic data card wrapper that handles loading/error/empty states.
 * Eliminates the repeated Card > CardHeader > loading/error/empty boilerplate.
 */
export function DataCard({
  title,
  loading = false,
  error,
  isEmpty = false,
  emptyMessage = 'No data available',
  children,
  className,
  errorTitle,
}: DataCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ErrorDisplay title={errorTitle ?? `Failed to load ${title.toLowerCase()}`} message={error.message} />
        </CardContent>
      </Card>
    )
  }

  if (isEmpty) {
    return (
      <Card className={className}>
        <CardHeader className="border-b border-bg-tertiary">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="font-mono text-sm text-text-muted">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {children}
    </Card>
  )
}
