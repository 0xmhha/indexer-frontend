'use client'

import { ReactNode } from 'react'
import { ApolloProvider } from './ApolloProvider'
import { WebSocketProvider } from './WebSocketProvider'
import { NotificationProvider } from '@/lib/contexts/NotificationContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider>
      <WebSocketProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </WebSocketProvider>
    </ApolloProvider>
  )
}
