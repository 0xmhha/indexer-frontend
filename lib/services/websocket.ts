/**
 * WebSocket service for real-time blockchain updates
 * Uses singleton pattern to prevent reconnection on page navigation
 */

import { env } from '@/lib/config/env'
import { TIMEOUTS } from '@/lib/config/constants'
import { errorLogger } from '@/lib/errors/logger'

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
  getConnectionState: () => 'connecting' | 'connected' | 'disconnected' | 'error'
}

// Singleton instance for the WebSocket client
let singletonClient: WebSocketClient | null = null
let connectionState: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected'

/**
 * Get or create singleton WebSocket client
 * This ensures only one connection exists across all page navigations
 */
export function getWebSocketClient(): WebSocketClient {
  if (!singletonClient) {
    singletonClient = createWebSocketClientInternal()
  }
  return singletonClient
}

/**
 * Create WebSocket client for blockchain updates (internal)
 */
function createWebSocketClientInternal(): WebSocketClient {
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
      connectionState = 'connecting'
      ws = new WebSocket(env.wsEndpoint)

      ws.onopen = () => {
        connectionState = 'connected'
        if (env.isDevelopment) {
          errorLogger.info(`WebSocket connected to ${env.wsEndpoint}`, { component: 'WebSocket', action: 'connect' })
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
          errorLogger.error(error, { component: 'WebSocket', action: 'parse-message' })
        }
      }

      ws.onerror = (error) => {
        connectionState = 'error'
        errorLogger.error(error, { component: 'WebSocket', action: 'error' })

        messageHandlers.forEach((handler) => {
          handler({ type: 'error', data: { message: 'WebSocket connection error' } })
        })
      }

      ws.onclose = () => {
        connectionState = 'disconnected'
        if (env.isDevelopment) {
          errorLogger.info('WebSocket disconnected', { component: 'WebSocket', action: 'disconnect' })
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
        }, TIMEOUTS.WS_RECONNECT_DELAY)
      }
    } catch (error) {
      errorLogger.error(error, { component: 'WebSocket', action: 'connect' })
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

  const getConnectionState = () => connectionState

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    onMessage,
    isConnected,
    getConnectionState,
  }
}

/**
 * Reset singleton (for testing purposes only)
 */
export function resetWebSocketClient(): void {
  if (singletonClient) {
    singletonClient.disconnect()
    singletonClient = null
  }
  connectionState = 'disconnected'
}
