'use client'

import { ReactNode } from 'react'
import { ApolloProvider } from './ApolloProvider'
import { NotificationProvider } from '@/lib/contexts/NotificationContext'
import { RealtimeProvider } from '@/components/providers/RealtimeProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider>
      <RealtimeProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </RealtimeProvider>
    </ApolloProvider>
  )
}
