'use client'

import { RouteError } from '@/components/common/RouteError'

export default function UserOpsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} title="User Operations Error" />
}
