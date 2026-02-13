/**
 * Chain Definitions (viem)
 *
 * Custom chain definitions for wagmi/viem integration.
 * Maps to the preset networks in networks.config.ts.
 */

import { defineChain, type Chain } from 'viem'
import type { NetworkConfig } from '@/lib/config/networks.types'

// ============================================================================
// Custom Chain Definitions
// ============================================================================

export const anvilLocal = defineChain({
  id: 31337,
  name: 'Anvil',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
})

export const stablenetLocal = defineChain({
  id: 8283,
  name: 'StableNet',
  nativeCurrency: { name: 'WKRC', symbol: 'WKRC', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:8080/rpc'] },
  },
})

export const stablenetTestnet = defineChain({
  id: 8284,
  name: 'StableNet Testnet',
  nativeCurrency: { name: 'tSTABLE', symbol: 'tSTABLE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.stablenet.io'] },
  },
})

export const stablenetMainnet = defineChain({
  id: 8280,
  name: 'StableNet',
  nativeCurrency: { name: 'STABLE', symbol: 'STABLE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.stablenet.io'] },
  },
})

// ============================================================================
// Chain ID Mappings
// ============================================================================

/** Map from numeric chain ID to network store ID */
export const CHAIN_ID_TO_NETWORK_ID: Record<number, string> = {
  [anvilLocal.id]: 'anvil-local',
  [stablenetLocal.id]: 'stablenet-local',
  [stablenetTestnet.id]: 'stablenet-testnet',
  [stablenetMainnet.id]: 'stablenet-mainnet',
}

/** All supported chains */
export const ALL_CHAINS = [stablenetMainnet, stablenetTestnet, stablenetLocal, anvilLocal] as const

/**
 * Look up a viem Chain by chain ID string (from NetworkConfig.chain.id)
 */
export function getChainById(chainId: string): Chain | undefined {
  const numericId = Number(chainId)
  return ALL_CHAINS.find((chain) => chain.id === numericId)
}

/**
 * Convert a NetworkConfig to a viem Chain for wagmi integration.
 * Used to register custom networks with wagmi at runtime.
 */
const DEFAULT_DECIMALS = 18

export function networkConfigToChain(config: NetworkConfig): Chain {
  return defineChain({
    id: Number(config.chain.id),
    name: config.chain.name,
    nativeCurrency: {
      name: config.chain.currencySymbol,
      symbol: config.chain.currencySymbol,
      decimals: DEFAULT_DECIMALS,
    },
    rpcUrls: {
      default: { http: [config.endpoints.jsonRpcEndpoint] },
    },
  })
}

/**
 * Look up network store ID by numeric chain ID.
 * Checks preset mapping first, then falls back to custom networks.
 */
export function getNetworkIdByChainId(
  chainId: number,
  customNetworks: Array<{ id: string; chain: { id: string } }>
): string | undefined {
  // Check preset mapping first
  const presetId = CHAIN_ID_TO_NETWORK_ID[chainId]
  if (presetId) { return presetId }

  // Check custom networks
  const chainIdStr = String(chainId)
  const custom = customNetworks.find((n) => n.chain.id === chainIdStr)
  return custom?.id
}
