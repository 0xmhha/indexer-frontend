'use client'

import { ReactNode } from 'react'
import { WagmiProvider } from './WagmiProvider'
import { NetworkProvider } from './NetworkProvider'
import { NotificationProvider } from '@/lib/contexts/NotificationContext'
import { RealtimeProvider } from '@/components/providers/RealtimeProvider'

/**
 * Root Providers Component
 *
 * Wraps the application with all necessary providers in the correct order:
 * 1. WagmiProvider - Wallet connection and chain management (wagmi + react-query)
 * 2. NetworkProvider - Manages Apollo Client based on selected network
 * 3. RealtimeProvider - Handles WebSocket subscriptions for real-time data
 * 4. NotificationProvider - Manages toast notifications
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider>
      <NetworkProvider>
        <RealtimeProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </RealtimeProvider>
      </NetworkProvider>
    </WagmiProvider>
  )
}
