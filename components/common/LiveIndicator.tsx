'use client'

import { useWebSocket } from '@/lib/providers/WebSocketProvider'

export function LiveIndicator() {
  const { isConnected } = useWebSocket()

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
