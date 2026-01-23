/**
 * Network Configuration Types
 *
 * Type definitions for multi-network support.
 * Enables runtime network selection for the indexer frontend.
 */

/**
 * Network endpoint URLs
 */
export interface NetworkEndpoints {
  /** GraphQL HTTP endpoint */
  graphqlEndpoint: string
  /** WebSocket endpoint for subscriptions */
  wsEndpoint: string
  /** JSON-RPC endpoint for direct calls */
  jsonRpcEndpoint: string
}

/**
 * Chain-specific configuration
 */
export interface NetworkChain {
  /** Human-readable chain name */
  name: string
  /** Chain ID (decimal string) */
  id: string
  /** Native currency symbol */
  currencySymbol: string
}

/**
 * Network type classification
 */
export type NetworkType = 'mainnet' | 'testnet' | 'devnet' | 'custom'

/**
 * Complete network configuration
 */
export interface NetworkConfig {
  /** Unique network identifier */
  id: string
  /** Display name */
  name: string
  /** Network classification */
  type: NetworkType
  /** API endpoints */
  endpoints: NetworkEndpoints
  /** Chain configuration */
  chain: NetworkChain
  /** Optional icon URL or component name */
  icon?: string
  /** Whether this is a user-defined custom network */
  isCustom?: boolean
  /** Optional description */
  description?: string
}

/**
 * Network store persistence data
 */
export interface NetworkStorageData {
  /** Currently selected network ID */
  currentNetworkId: string
  /** User-defined custom networks */
  customNetworks: NetworkConfig[]
}

/**
 * Network connection status
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
