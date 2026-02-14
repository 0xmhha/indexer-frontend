'use client'

import { RouteError } from '@/components/common/RouteError'

export default function ProposalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} title="Failed to load proposal" backHref="/governance" />
}
