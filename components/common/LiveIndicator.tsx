'use client'

import { useRealtimeStore, selectIsConnected } from '@/stores/realtimeStore'

/**
 * LiveIndicator - Shows WebSocket connection status
 * Reads from centralized RealtimeStore instead of subscribing directly
 */
export function LiveIndicator() {
  const isConnected = useRealtimeStore(selectIsConnected)

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
