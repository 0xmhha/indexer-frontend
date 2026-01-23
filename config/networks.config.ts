/**
 * Network Preset Configurations
 *
 * Pre-defined network configurations for the indexer frontend.
 * Includes development, testnet, and mainnet environments.
 */

import type { NetworkConfig } from '@/lib/config/networks.types'

/**
 * Default network ID to use when none is selected
 */
export const DEFAULT_NETWORK_ID = 'stable-one-local'

/**
 * Maximum number of custom networks allowed
 */
export const MAX_CUSTOM_NETWORKS = 10

/**
 * Preset network configurations
 *
 * Networks are organized by type:
 * - devnet: Local development networks
 * - testnet: Test networks for staging
 * - mainnet: Production networks
 */
export const PRESET_NETWORKS: NetworkConfig[] = [
  // ============================================================================
  // Development Networks (devnet)
  // ============================================================================
  {
    id: 'anvil-local',
    name: 'Anvil Local',
    type: 'devnet',
    endpoints: {
      graphqlEndpoint: 'http://localhost:8080/graphql',
      wsEndpoint: 'ws://localhost:8080/graphql/ws',
      jsonRpcEndpoint: 'http://localhost:8545',
    },
    chain: {
      name: 'Anvil',
      id: '31337',
      currencySymbol: 'ETH',
    },
    description: 'Local Anvil development chain',
  },
  {
    id: 'stable-one-local',
    name: 'Stable-One Local',
    type: 'devnet',
    endpoints: {
      graphqlEndpoint: 'http://localhost:8080/graphql',
      wsEndpoint: 'ws://localhost:8080/graphql/ws',
      jsonRpcEndpoint: 'http://localhost:8080/rpc',
    },
    chain: {
      name: 'Stable-One',
      id: '8283',
      currencySymbol: 'STABLEONE',
    },
    description: 'Local Stable-One development chain',
  },

  // ============================================================================
  // Test Networks (testnet)
  // ============================================================================
  {
    id: 'stablenet-testnet',
    name: 'StableNet Testnet',
    type: 'testnet',
    endpoints: {
      graphqlEndpoint: 'https://testnet-indexer.stablenet.io/graphql',
      wsEndpoint: 'wss://testnet-indexer.stablenet.io/graphql/ws',
      jsonRpcEndpoint: 'https://testnet-rpc.stablenet.io',
    },
    chain: {
      name: 'StableNet Testnet',
      id: '8284',
      currencySymbol: 'tSTABLE',
    },
    description: 'StableNet public test network',
  },

  // ============================================================================
  // Main Networks (mainnet)
  // ============================================================================
  {
    id: 'stablenet-mainnet',
    name: 'StableNet Mainnet',
    type: 'mainnet',
    endpoints: {
      graphqlEndpoint: 'https://indexer.stablenet.io/graphql',
      wsEndpoint: 'wss://indexer.stablenet.io/graphql/ws',
      jsonRpcEndpoint: 'https://rpc.stablenet.io',
    },
    chain: {
      name: 'StableNet',
      id: '8280',
      currencySymbol: 'STABLE',
    },
    description: 'StableNet production network',
  },
]

/**
 * Get a preset network by ID
 */
export function getPresetNetwork(id: string): NetworkConfig | undefined {
  return PRESET_NETWORKS.find((n) => n.id === id)
}

/**
 * Get all networks of a specific type
 */
export function getNetworksByType(type: NetworkConfig['type']): NetworkConfig[] {
  return PRESET_NETWORKS.filter((n) => n.type === type)
}

/**
 * Network type display labels
 */
export const NETWORK_TYPE_LABELS: Record<NetworkConfig['type'], string> = {
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  devnet: 'Development',
  custom: 'Custom',
}

/**
 * Network type order for display
 */
export const NETWORK_TYPE_ORDER: NetworkConfig['type'][] = [
  'mainnet',
  'testnet',
  'devnet',
  'custom',
]
