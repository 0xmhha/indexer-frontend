'use client'

import { RouteError } from '@/components/common/RouteError'

export default function PaymasterDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} title="Paymaster Detail Error" />
}
