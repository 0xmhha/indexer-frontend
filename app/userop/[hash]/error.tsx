'use client'

import { RouteError } from '@/components/common/RouteError'

export default function UserOpError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} title="UserOperation Error" />
}
