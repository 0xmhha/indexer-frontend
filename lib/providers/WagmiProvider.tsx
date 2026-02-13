'use client'

import { type ReactNode } from 'react'
import { WagmiProvider as WagmiProviderBase } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/lib/wagmi/config'

// ============================================================================
// Cache Configuration
// ============================================================================

/** How long query data is considered fresh (10s for wagmi block/balance data) */
const STALE_TIME_MS = 10_000
/** How long unused query data stays in cache before garbage collection (5min) */
const GC_TIME_MS = 300_000
/** Max retry attempts for failed queries */
const RETRY_COUNT = 2
/** Base delay between retries (doubles each attempt: 1s, 2s) */
const RETRY_DELAY_BASE_MS = 1_000

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      retry: RETRY_COUNT,
      retryDelay: (attemptIndex) => RETRY_DELAY_BASE_MS * Math.pow(2, attemptIndex),
      refetchOnWindowFocus: false,
      structuralSharing: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

// ============================================================================
// Provider
// ============================================================================

export function WagmiProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProviderBase config={wagmiConfig} reconnectOnMount>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProviderBase>
  )
}
