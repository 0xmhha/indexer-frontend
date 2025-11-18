'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  createWebSocketClient,
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
  const [client] = useState(() => createWebSocketClient())
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  useEffect(() => {
    // Connect on mount
    client.connect()

    // Subscribe to messages
    const unsubscribe = client.onMessage((message) => {
      setLastMessage(message)

      if (message.type === 'connected') {
        setIsConnected(true)
      } else if (message.type === 'disconnected') {
        setIsConnected(false)
      }
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
      client.disconnect()
    }
  }, [client])

  return (
    <WebSocketContext.Provider value={{ client, isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  )
}
