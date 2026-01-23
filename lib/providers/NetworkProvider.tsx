'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { ApolloProvider } from '@apollo/client'
import { createApolloClient, ApolloClientInstance } from '@/lib/apollo/client'
import { useNetworkStore, selectCurrentNetwork, selectIsConnecting } from '@/stores/networkStore'
import { useRealtimeStore } from '@/stores/realtimeStore'
import { useConsensusStore } from '@/stores/consensusStore'

// Client-side cache for Apollo instances
const apolloClientCache = new Map<string, ApolloClientInstance>()

/**
 * Get or create Apollo Client for a network
 */
function getApolloClientForNetwork(networkId: string, endpoints: { graphqlEndpoint: string; wsEndpoint: string; jsonRpcEndpoint: string }): ApolloClientInstance {
  // Check cache first
  const cached = apolloClientCache.get(networkId)
  if (cached) {
    return cached
  }

  // Create new instance
  const instance = createApolloClient(endpoints)
  apolloClientCache.set(networkId, instance)

  console.info(`[NetworkProvider] Created client for network: ${networkId}`)

  return instance
}

/**
 * Dispose all cached clients except the current one
 */
function disposeOtherClients(currentNetworkId: string): void {
  apolloClientCache.forEach((instance, id) => {
    if (id !== currentNetworkId) {
      instance.dispose()
      apolloClientCache.delete(id)
    }
  })
}

/**
 * Reset application state when switching networks
 */
function resetApplicationState(): void {
  useRealtimeStore.getState().reset()
  useConsensusStore.getState().clearAll()
}

/**
 * Loading component for network connection
 */
function NetworkLoading({ networkName, chainId }: { networkName?: string; chainId?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-bg-tertiary border-t-accent-blue"></div>
        </div>
        <div className="text-center">
          <p className="font-mono text-sm text-text-primary">
            {networkName ? `Connecting to ${networkName}...` : 'Initializing...'}
          </p>
          {chainId && (
            <p className="mt-1 font-mono text-xs text-text-muted">Chain ID: {chainId}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Inner provider that handles Apollo Client
 */
function ApolloClientProvider({ networkId, endpoints, children }: {
  networkId: string
  endpoints: { graphqlEndpoint: string; wsEndpoint: string; jsonRpcEndpoint: string }
  children: ReactNode
}) {
  const setConnectionStatus = useNetworkStore((state) => state.setConnectionStatus)
  const previousNetworkIdRef = useRef<string | null>(null)

  // Get Apollo client instance
  const instance = getApolloClientForNetwork(networkId, endpoints)

  // Handle network changes and cleanup
  useEffect(() => {
    if (previousNetworkIdRef.current !== networkId) {
      // Network changed - reset app state and dispose old clients
      if (previousNetworkIdRef.current !== null) {
        resetApplicationState()
        disposeOtherClients(networkId)
      }
      previousNetworkIdRef.current = networkId
      setConnectionStatus('connected')
    }

    return () => {
      // Cleanup on unmount (when switching away from this network)
    }
  }, [networkId, setConnectionStatus])

  return <ApolloProvider client={instance.client}>{children}</ApolloProvider>
}

/**
 * Network-aware Apollo Provider
 *
 * Manages Apollo Client lifecycle based on network selection.
 * Uses a key-based remounting strategy for clean network switches.
 */
export function NetworkProvider({ children }: { children: ReactNode }) {
  const currentNetwork = useNetworkStore(selectCurrentNetwork)
  const isConnecting = useNetworkStore(selectIsConnecting)

  // Hydrate Zustand stores on client
  useEffect(() => {
    useNetworkStore.persist.rehydrate()
  }, [])

  // Show loading state while connecting
  if (!currentNetwork || isConnecting) {
    const networkName = currentNetwork?.name
    const chainId = currentNetwork?.chain.id
    return (
      <NetworkLoading
        {...(networkName ? { networkName } : {})}
        {...(chainId ? { chainId } : {})}
      />
    )
  }

  // Use key to force remount when network changes
  return (
    <ApolloClientProvider
      key={currentNetwork.id}
      networkId={currentNetwork.id}
      endpoints={currentNetwork.endpoints}
    >
      {children}
    </ApolloClientProvider>
  )
}
