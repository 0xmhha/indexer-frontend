'use client'

import { useSubscription } from '@apollo/client'
import { SUBSCRIBE_NEW_BLOCK } from '@/lib/apollo/queries'

export function LiveIndicator() {
  // Use Apollo Client subscription to check connection status
  const { loading, error } = useSubscription(SUBSCRIBE_NEW_BLOCK, {
    fetchPolicy: 'no-cache',
  })

  const isConnected = !loading && !error

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-success' : 'bg-error'}`}
      ></div>
      <span className="font-mono text-xs text-text-secondary">
        {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
      </span>
    </div>
  )
}
