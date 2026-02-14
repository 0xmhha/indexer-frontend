'use client'

import { RouteError } from '@/components/common/RouteError'

export default function SystemContractsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} title="Failed to load system contracts" backHref="/" />
}
