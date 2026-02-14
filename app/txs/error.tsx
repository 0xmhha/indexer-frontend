'use client'

import { RouteError } from '@/components/common/RouteError'

export default function TxsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} title="Failed to load transactions" backHref="/" />
}
