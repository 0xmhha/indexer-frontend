/**
 * Network State Store (Zustand)
 *
 * Manages network selection and custom network configurations.
 * Persists selected network ID and custom networks to localStorage.
 *
 * Pattern:
 *   User Selection → Network Store → Apollo Client Recreation → App Re-render
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { errorLogger } from '@/lib/errors/logger'
import type { NetworkConfig, ConnectionStatus } from '@/lib/config/networks.types'
import {
  PRESET_NETWORKS,
  DEFAULT_NETWORK_ID,
  MAX_CUSTOM_NETWORKS,
  getPresetNetwork,
} from '@/config/networks.config'

// ============================================================================
// Types
// ============================================================================

interface NetworkState {
  // Current network
  currentNetworkId: string
  currentNetwork: NetworkConfig | null

  // Custom networks
  customNetworks: NetworkConfig[]

  // Connection state
  connectionStatus: ConnectionStatus
  connectionError: string | null

  // Actions
  selectNetwork: (networkId: string) => void
  addCustomNetwork: (network: Omit<NetworkConfig, 'id' | 'isCustom' | 'type'>) => string | null
  updateCustomNetwork: (networkId: string, updates: Partial<NetworkConfig>) => boolean
  removeCustomNetwork: (networkId: string) => boolean
  setConnectionStatus: (status: ConnectionStatus, error?: string) => void
  reset: () => void
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Find a network by ID from presets or custom networks
 */
function findNetwork(networkId: string, customNetworks: NetworkConfig[]): NetworkConfig | null {
  // Check presets first
  const preset = getPresetNetwork(networkId)
  if (preset) {
    return preset
  }

  // Check custom networks
  return customNetworks.find((n) => n.id === networkId) ?? null
}

// Random ID generation constants
const RADIX_BASE_36 = 36
const RANDOM_SUFFIX_START = 2
const RANDOM_SUFFIX_END = 9

/**
 * Generate a unique ID for custom networks
 */
function generateCustomNetworkId(): string {
  return `custom-${Date.now()}-${Math.random().toString(RADIX_BASE_36).substring(RANDOM_SUFFIX_START, RANDOM_SUFFIX_END)}`
}

/**
 * Validate network configuration
 */
function isValidNetworkConfig(network: Partial<NetworkConfig>): boolean {
  return !!(
    network.name &&
    network.endpoints?.graphqlEndpoint &&
    network.endpoints?.wsEndpoint &&
    network.endpoints?.jsonRpcEndpoint &&
    network.chain?.name &&
    network.chain?.id &&
    network.chain?.currencySymbol
  )
}

// ============================================================================
// Store
// ============================================================================

export const useNetworkStore = create<NetworkState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentNetworkId: DEFAULT_NETWORK_ID,
        currentNetwork: getPresetNetwork(DEFAULT_NETWORK_ID) ?? null,
        customNetworks: [],
        connectionStatus: 'disconnected',
        connectionError: null,

        // Select a network
        selectNetwork: (networkId) => {
          const state = get()
          const network = findNetwork(networkId, state.customNetworks)

          if (!network) {
            errorLogger.warn(`Network not found: ${networkId}`, { component: 'NetworkStore', action: 'selectNetwork' })
            return
          }

          // Only update if different network
          if (state.currentNetworkId === networkId) {
            return
          }

          set({
            currentNetworkId: networkId,
            currentNetwork: network,
            connectionStatus: 'connecting',
            connectionError: null,
          })
        },

        // Add a custom network
        addCustomNetwork: (networkData) => {
          const state = get()

          // Check limit
          if (state.customNetworks.length >= MAX_CUSTOM_NETWORKS) {
            errorLogger.warn(`Maximum custom networks reached (${MAX_CUSTOM_NETWORKS})`, { component: 'NetworkStore', action: 'addCustomNetwork' })
            return null
          }

          // Validate
          if (!isValidNetworkConfig(networkData as Partial<NetworkConfig>)) {
            errorLogger.warn('Invalid network configuration', { component: 'NetworkStore', action: 'addCustomNetwork' })
            return null
          }

          const id = generateCustomNetworkId()
          const newNetwork: NetworkConfig = {
            ...networkData,
            id,
            type: 'custom',
            isCustom: true,
          }

          set({
            customNetworks: [...state.customNetworks, newNetwork],
          })

          return id
        },

        // Update a custom network
        updateCustomNetwork: (networkId, updates) => {
          const state = get()
          const networkIndex = state.customNetworks.findIndex((n) => n.id === networkId)

          if (networkIndex === -1) {
            errorLogger.warn(`Custom network not found: ${networkId}`, { component: 'NetworkStore', action: 'updateCustomNetwork' })
            return false
          }

          const existingNetwork = state.customNetworks[networkIndex]
          if (!existingNetwork) {
            errorLogger.warn(`Custom network not found at index: ${networkIndex}`, { component: 'NetworkStore', action: 'updateCustomNetwork' })
            return false
          }

          // Build updated network with explicit handling of optional fields
          const updatedNetwork: NetworkConfig = {
            name: updates.name ?? existingNetwork.name,
            endpoints: updates.endpoints ?? existingNetwork.endpoints,
            chain: updates.chain ?? existingNetwork.chain,
            // Preserve immutable fields
            id: networkId,
            type: 'custom',
            isCustom: true,
          }

          // Handle optional description
          const newDescription = updates.description !== undefined ? updates.description : existingNetwork.description
          if (newDescription) {
            updatedNetwork.description = newDescription
          }

          // Handle optional icon
          const newIcon = updates.icon !== undefined ? updates.icon : existingNetwork.icon
          if (newIcon) {
            updatedNetwork.icon = newIcon
          }

          const updatedNetworks = [...state.customNetworks]
          updatedNetworks[networkIndex] = updatedNetwork

          const newState: Partial<NetworkState> = {
            customNetworks: updatedNetworks,
          }

          // Update current network if it's the one being updated
          if (state.currentNetworkId === networkId) {
            newState.currentNetwork = updatedNetwork
          }

          set(newState)
          return true
        },

        // Remove a custom network
        removeCustomNetwork: (networkId) => {
          const state = get()
          const networkIndex = state.customNetworks.findIndex((n) => n.id === networkId)

          if (networkIndex === -1) {
            errorLogger.warn(`Custom network not found: ${networkId}`, { component: 'NetworkStore', action: 'removeCustomNetwork' })
            return false
          }

          const updatedNetworks = state.customNetworks.filter((n) => n.id !== networkId)

          const newState: Partial<NetworkState> = {
            customNetworks: updatedNetworks,
          }

          // Switch to default network if currently selected network is being removed
          if (state.currentNetworkId === networkId) {
            const defaultNetwork = getPresetNetwork(DEFAULT_NETWORK_ID)
            newState.currentNetworkId = DEFAULT_NETWORK_ID
            newState.currentNetwork = defaultNetwork !== undefined ? defaultNetwork : null
            newState.connectionStatus = 'connecting'
          }

          set(newState)
          return true
        },

        // Update connection status
        setConnectionStatus: (status, error) => {
          set({
            connectionStatus: status,
            connectionError: error ?? null,
          })
        },

        // Reset to initial state
        reset: () => {
          const defaultNetwork = getPresetNetwork(DEFAULT_NETWORK_ID)
          set({
            currentNetworkId: DEFAULT_NETWORK_ID,
            currentNetwork: defaultNetwork ?? null,
            customNetworks: [],
            connectionStatus: 'disconnected',
            connectionError: null,
          })
        },
      }),
      {
        name: 'network-store',
        // Only persist network ID and custom networks
        partialize: (state) => ({
          currentNetworkId: state.currentNetworkId,
          customNetworks: state.customNetworks,
        }),
        // Rehydrate with proper network object
        onRehydrateStorage: () => (state) => {
          if (state) {
            const network = findNetwork(state.currentNetworkId, state.customNetworks)
            state.currentNetwork = network
            state.connectionStatus = 'disconnected'
            state.connectionError = null
          }
        },
        // Skip hydration on server
        skipHydration: true,
      }
    ),
    { name: 'NetworkStore' }
  )
)

// ============================================================================
// Selectors
// ============================================================================

export const selectCurrentNetwork = (state: NetworkState) => state.currentNetwork
export const selectCurrentNetworkId = (state: NetworkState) => state.currentNetworkId
export const selectCustomNetworks = (state: NetworkState) => state.customNetworks
export const selectConnectionStatus = (state: NetworkState) => state.connectionStatus
export const selectConnectionError = (state: NetworkState) => state.connectionError
export const selectIsConnected = (state: NetworkState) => state.connectionStatus === 'connected'
export const selectIsConnecting = (state: NetworkState) => state.connectionStatus === 'connecting'

/**
 * Get all available networks (presets + custom)
 */
export const selectAllNetworks = (state: NetworkState): NetworkConfig[] => [
  ...PRESET_NETWORKS,
  ...state.customNetworks,
]
