'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'
import {
  getWebSocketClient,
  type WebSocketClient,
  type WebSocketMessage,
} from '@/lib/services/websocket'

interface WebSocketContextValue {
  client: WebSocketClient | null
  isConnected: boolean
  lastMessage: WebSocketMessage | null
}

const WebSocketContext = createContext<WebSocketContextValue>({
  client: null,
  isConnected: false,
  lastMessage: null,
})

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider')
  }
  return context
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  // Use singleton client - persists across page navigations
  const client = useMemo(() => getWebSocketClient(), [])
  const [isConnected, setIsConnected] = useState(() => client.isConnected())
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  useEffect(() => {
    // Connect if not already connected
    if (!client.isConnected()) {
      client.connect()
    }

    // Subscribe to messages
    const unsubscribe = client.onMessage((message) => {
      setLastMessage(message)

      if (message.type === 'connected') {
        setIsConnected(true)
      } else if (message.type === 'disconnected') {
        setIsConnected(false)
      }
    })

    // Only unsubscribe on unmount, don't disconnect the singleton
    return () => {
      unsubscribe()
    }
  }, [client])

  return (
    <WebSocketContext.Provider value={{ client, isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  )
}
