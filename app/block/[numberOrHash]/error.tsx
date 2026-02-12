'use client'

import { RouteError } from '@/components/common/RouteError'

export default function BlockError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} title="Failed to load block" backHref="/blocks" backLabel="VIEW BLOCKS" />
}
