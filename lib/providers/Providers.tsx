'use client'

import { ReactNode } from 'react'
import { ApolloProvider } from './ApolloProvider'
import { NotificationProvider } from '@/lib/contexts/NotificationContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </ApolloProvider>
  )
}
