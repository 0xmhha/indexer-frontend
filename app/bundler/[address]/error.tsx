'use client'

import { RouteError } from '@/components/common/RouteError'

export default function BundlerDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} title="Bundler Detail Error" />
}
