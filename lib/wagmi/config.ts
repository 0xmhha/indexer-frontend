/**
 * wagmi Configuration
 *
 * Central wagmi config for wallet connection and chain management.
 * Supports: MetaMask (injected), WalletConnect, Coinbase Wallet.
 *
 * Custom networks persisted in localStorage are included at build time.
 * Runtime-added custom networks require page refresh for wallet features.
 */

import { createConfig, createStorage, http, type Transport } from 'wagmi'
import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors'
import type { Chain } from 'viem'
import {
  stablenetMainnet,
  stablenetTestnet,
  stablenetLocal,
  anvilLocal,
  networkConfigToChain,
} from '@/config/chains.config'
import type { NetworkConfig } from '@/lib/config/networks.types'

// ============================================================================
// Preset Chains
// ============================================================================

const PRESET_CHAINS: Chain[] = [stablenetMainnet, stablenetTestnet, stablenetLocal, anvilLocal]

// ============================================================================
// Connectors
// ============================================================================

const connectors = (() => {
  const list = [
    injected(),
    coinbaseWallet({ appName: 'StableNet Explorer' }),
  ]

  const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  if (wcProjectId) {
    list.push(
      walletConnect({
        projectId: wcProjectId,
        showQrModal: true,
        metadata: {
          name: 'StableNet Explorer',
          description: 'Blockchain explorer for StableNet',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://stablenet.io',
          icons: [],
        },
      })
    )
  }

  return list
})()

// ============================================================================
// Custom Network Persistence
// ============================================================================

const NETWORK_STORE_KEY = 'network-store'

/**
 * Read custom networks from localStorage (persisted by Zustand).
 * Called once at module init to include them in the wagmi config.
 */
function getPersistedCustomNetworks(): NetworkConfig[] {
  if (typeof window === 'undefined') { return [] }

  try {
    const stored = localStorage.getItem(NETWORK_STORE_KEY)
    if (!stored) { return [] }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed?.state?.customNetworks) ? parsed.state.customNetworks : []
  } catch {
    return []
  }
}

// ============================================================================
// Config Builder
// ============================================================================

/**
 * Build wagmi config with preset chains + custom networks.
 * Custom networks are converted to viem Chains via networkConfigToChain().
 */
export function buildWagmiConfig(customNetworks: NetworkConfig[] = []) {
  const customChains = customNetworks
    .filter((n) => n.chain?.id && n.endpoints?.jsonRpcEndpoint)
    .map(networkConfigToChain)

  const allChains = [...PRESET_CHAINS, ...customChains] as [Chain, ...Chain[]]

  const transports: Record<number, Transport> = {}
  for (const chain of allChains) {
    transports[chain.id] = http(chain.rpcUrls.default.http[0])
  }

  return createConfig({
    chains: allChains,
    connectors,
    transports: transports as Record<(typeof allChains)[number]['id'], Transport>,
    // Persist wallet connection for automatic reconnection on page reload
    storage: createStorage({
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      key: 'wagmi',
    }),
    // Auto-switch wagmi chain when wallet chain changes
    syncConnectedChain: true,
    // Discover multiple injected wallets (MetaMask, Rabby, etc.)
    multiInjectedProviderDiscovery: true,
    ssr: false,
  })
}

// ============================================================================
// Singleton Config (includes persisted custom networks)
// ============================================================================

export const wagmiConfig = buildWagmiConfig(getPersistedCustomNetworks())
