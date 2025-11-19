/**
 * WebSocket service for real-time blockchain updates
 */

import { env } from '@/lib/config/env'

export type WebSocketMessage =
  | { type: 'newBlock'; data: unknown }
  | { type: 'newTransaction'; data: unknown }
  | { type: 'error'; data: { message: string } }
  | { type: 'connected' }
  | { type: 'disconnected' }

export type WebSocketSubscription = 'newBlock' | 'newTransaction'

export interface WebSocketClient {
  connect: () => void
  disconnect: () => void
  subscribe: (subscription: WebSocketSubscription) => void
  unsubscribe: (subscription: WebSocketSubscription) => void
  onMessage: (callback: (message: WebSocketMessage) => void) => () => void
  isConnected: () => boolean
}

/**
 * Create WebSocket client for blockchain updates
 */
export function createWebSocketClient(): WebSocketClient {
  let ws: WebSocket | null = null
  let reconnectTimer: NodeJS.Timeout | null = null
  const messageHandlers: Set<(message: WebSocketMessage) => void> = new Set()
  const subscriptions: Set<WebSocketSubscription> = new Set()
  let messageIdCounter = 1

  const connect = () => {
    if (ws?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      ws = new WebSocket(env.wsEndpoint)

      ws.onopen = () => {
        if (env.isDevelopment) {
          console.log('[WebSocket] Connected to', env.wsEndpoint)
        }

        // Notify all handlers of connection
        messageHandlers.forEach((handler) => {
          handler({ type: 'connected' })
        })

        // Resubscribe to all active subscriptions
        subscriptions.forEach((sub) => {
          sendSubscription(sub)
        })
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Handle different message formats
          if (data.method === 'newBlock') {
            messageHandlers.forEach((handler) => {
              handler({ type: 'newBlock', data: data.params })
            })
          } else if (data.method === 'newTransaction') {
            messageHandlers.forEach((handler) => {
              handler({ type: 'newTransaction', data: data.params })
            })
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)

        messageHandlers.forEach((handler) => {
          handler({ type: 'error', data: { message: 'WebSocket connection error' } })
        })
      }

      ws.onclose = () => {
        if (env.isDevelopment) {
          console.log('[WebSocket] Disconnected')
        }

        messageHandlers.forEach((handler) => {
          handler({ type: 'disconnected' })
        })

        // Attempt to reconnect after 5 seconds
        if (reconnectTimer) {
          clearTimeout(reconnectTimer)
        }
        reconnectTimer = setTimeout(() => {
          connect()
        }, 5000)
      }
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error)
    }
  }

  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    if (ws) {
      ws.close()
      ws = null
    }

    subscriptions.clear()
  }

  const sendSubscription = (subscription: WebSocketSubscription) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return
    }

    const message = {
      jsonrpc: '2.0',
      method: 'subscribe',
      params: [subscription],
      id: messageIdCounter++,
    }

    ws.send(JSON.stringify(message))
  }

  const subscribe = (subscription: WebSocketSubscription) => {
    subscriptions.add(subscription)
    sendSubscription(subscription)
  }

  const unsubscribe = (subscription: WebSocketSubscription) => {
    subscriptions.delete(subscription)

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return
    }

    const message = {
      jsonrpc: '2.0',
      method: 'unsubscribe',
      params: [subscription],
      id: messageIdCounter++,
    }

    ws.send(JSON.stringify(message))
  }

  const onMessage = (callback: (message: WebSocketMessage) => void) => {
    messageHandlers.add(callback)

    // Return cleanup function
    return () => {
      messageHandlers.delete(callback)
    }
  }

  const isConnected = () => {
    return ws?.readyState === WebSocket.OPEN
  }

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    onMessage,
    isConnected,
  }
}
