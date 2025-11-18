'use client'

import { ReactNode } from 'react'
import { ApolloProvider } from './ApolloProvider'
import { WebSocketProvider } from './WebSocketProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider>
      <WebSocketProvider>{children}</WebSocketProvider>
    </ApolloProvider>
  )
}
