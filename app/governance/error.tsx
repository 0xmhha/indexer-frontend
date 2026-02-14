'use client'

import { RouteError } from '@/components/common/RouteError'

export default function GovernanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} title="Failed to load governance" backHref="/" />
}
