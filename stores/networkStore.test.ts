import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useNetworkStore } from '@/stores/networkStore'
import {
  selectCurrentNetwork,
  selectCurrentNetworkId,
  selectCustomNetworks,
  selectConnectionStatus,
  selectConnectionError,
  selectIsConnected,
  selectIsConnecting,
  selectAllNetworks,
} from '@/stores/networkStore'
import {
  DEFAULT_NETWORK_ID,
  PRESET_NETWORKS,
  MAX_CUSTOM_NETWORKS,
  getPresetNetwork,
} from '@/config/networks.config'
import type { NetworkConfig } from '@/lib/config/networks.types'

// Mock errorLogger to prevent console noise
vi.mock('@/lib/errors/logger', () => ({
  errorLogger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

const validCustomNetworkData = {
  name: 'My Custom Net',
  endpoints: {
    graphqlEndpoint: 'http://custom:8080/graphql',
    wsEndpoint: 'ws://custom:8080/graphql/ws',
    jsonRpcEndpoint: 'http://custom:8545',
  },
  chain: {
    name: 'CustomChain',
    id: '99999',
    currencySymbol: 'CST',
  },
  description: 'A test custom network',
}

describe('networkStore', () => {
  beforeEach(() => {
    useNetworkStore.getState().reset()
  })

  // --------------------------------------------------------------------------
  // Initial state
  // --------------------------------------------------------------------------
  describe('initial state', () => {
    it('has the default network selected', () => {
      const state = useNetworkStore.getState()
      expect(state.currentNetworkId).toBe(DEFAULT_NETWORK_ID)
    })

    it('resolves currentNetwork from default ID', () => {
      const state = useNetworkStore.getState()
      const expected = getPresetNetwork(DEFAULT_NETWORK_ID)
      expect(state.currentNetwork).toEqual(expected ?? null)
    })

    it('starts with empty custom networks', () => {
      expect(useNetworkStore.getState().customNetworks).toEqual([])
    })

    it('starts disconnected', () => {
      expect(useNetworkStore.getState().connectionStatus).toBe('disconnected')
    })

    it('has no connection error', () => {
      expect(useNetworkStore.getState().connectionError).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // selectNetwork
  // --------------------------------------------------------------------------
  describe('selectNetwork', () => {
    it('switches to a valid preset network', () => {
      const target = PRESET_NETWORKS.find((n) => n.id !== DEFAULT_NETWORK_ID)!
      useNetworkStore.getState().selectNetwork(target.id)

      const state = useNetworkStore.getState()
      expect(state.currentNetworkId).toBe(target.id)
      expect(state.currentNetwork).toEqual(target)
    })

    it('sets connectionStatus to connecting on switch', () => {
      const target = PRESET_NETWORKS.find((n) => n.id !== DEFAULT_NETWORK_ID)!
      useNetworkStore.getState().selectNetwork(target.id)
      expect(useNetworkStore.getState().connectionStatus).toBe('connecting')
    })

    it('clears connection error on switch', () => {
      useNetworkStore.getState().setConnectionStatus('error', 'old error')
      const target = PRESET_NETWORKS.find((n) => n.id !== DEFAULT_NETWORK_ID)!
      useNetworkStore.getState().selectNetwork(target.id)
      expect(useNetworkStore.getState().connectionError).toBeNull()
    })

    it('does not update if selecting the same network', () => {
      useNetworkStore.getState().setConnectionStatus('connected')
      useNetworkStore.getState().selectNetwork(DEFAULT_NETWORK_ID)
      // connectionStatus should remain 'connected', not change to 'connecting'
      expect(useNetworkStore.getState().connectionStatus).toBe('connected')
    })

    it('does nothing for a non-existent network ID', () => {
      const before = useNetworkStore.getState().currentNetworkId
      useNetworkStore.getState().selectNetwork('non-existent-id')
      expect(useNetworkStore.getState().currentNetworkId).toBe(before)
    })

    it('can select a custom network', () => {
      const id = useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)!
      useNetworkStore.getState().selectNetwork(id)
      expect(useNetworkStore.getState().currentNetworkId).toBe(id)
      expect(useNetworkStore.getState().currentNetwork!.name).toBe('My Custom Net')
    })
  })

  // --------------------------------------------------------------------------
  // addCustomNetwork
  // --------------------------------------------------------------------------
  describe('addCustomNetwork', () => {
    it('adds a valid custom network and returns its ID', () => {
      const id = useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)
      expect(id).toBeTruthy()
      expect(typeof id).toBe('string')
      expect(useNetworkStore.getState().customNetworks).toHaveLength(1)
    })

    it('sets isCustom and type on the created network', () => {
      useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)
      const custom = useNetworkStore.getState().customNetworks[0]!
      expect(custom.isCustom).toBe(true)
      expect(custom.type).toBe('custom')
    })

    it('returns null for invalid configuration', () => {
      const result = useNetworkStore.getState().addCustomNetwork({
        name: 'Missing fields',
      } as Omit<NetworkConfig, 'id' | 'isCustom' | 'type'>)
      expect(result).toBeNull()
      expect(useNetworkStore.getState().customNetworks).toHaveLength(0)
    })

    it('returns null when MAX_CUSTOM_NETWORKS is reached', () => {
      // Fill up to max
      for (let i = 0; i < MAX_CUSTOM_NETWORKS; i++) {
        useNetworkStore.getState().addCustomNetwork({
          ...validCustomNetworkData,
          name: `Net-${i}`,
        })
      }
      expect(useNetworkStore.getState().customNetworks).toHaveLength(MAX_CUSTOM_NETWORKS)

      const result = useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)
      expect(result).toBeNull()
      expect(useNetworkStore.getState().customNetworks).toHaveLength(MAX_CUSTOM_NETWORKS)
    })
  })

  // --------------------------------------------------------------------------
  // updateCustomNetwork
  // --------------------------------------------------------------------------
  describe('updateCustomNetwork', () => {
    it('updates name of an existing custom network', () => {
      const id = useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)!
      const result = useNetworkStore.getState().updateCustomNetwork(id, { name: 'Updated Name' })
      expect(result).toBe(true)
      expect(useNetworkStore.getState().customNetworks[0]!.name).toBe('Updated Name')
    })

    it('returns false for non-existent network', () => {
      const result = useNetworkStore.getState().updateCustomNetwork('fake-id', { name: 'X' })
      expect(result).toBe(false)
    })

    it('updates currentNetwork if currently selected', () => {
      const id = useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)!
      useNetworkStore.getState().selectNetwork(id)
      useNetworkStore.getState().updateCustomNetwork(id, { name: 'Active Updated' })
      expect(useNetworkStore.getState().currentNetwork!.name).toBe('Active Updated')
    })

    it('does not update currentNetwork if a different network is selected', () => {
      const id = useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)!
      // Keep default network selected
      useNetworkStore.getState().updateCustomNetwork(id, { name: 'Changed' })
      expect(useNetworkStore.getState().currentNetwork!.name).not.toBe('Changed')
    })

    it('preserves id, type, and isCustom when updating', () => {
      const id = useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)!
      useNetworkStore.getState().updateCustomNetwork(id, { name: 'New Name' })
      const updated = useNetworkStore.getState().customNetworks[0]!
      expect(updated.id).toBe(id)
      expect(updated.type).toBe('custom')
      expect(updated.isCustom).toBe(true)
    })
  })

  // --------------------------------------------------------------------------
  // removeCustomNetwork
  // --------------------------------------------------------------------------
  describe('removeCustomNetwork', () => {
    it('removes an existing custom network', () => {
      const id = useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)!
      const result = useNetworkStore.getState().removeCustomNetwork(id)
      expect(result).toBe(true)
      expect(useNetworkStore.getState().customNetworks).toHaveLength(0)
    })

    it('returns false for non-existent network', () => {
      expect(useNetworkStore.getState().removeCustomNetwork('fake')).toBe(false)
    })

    it('switches to default network when removing the currently selected', () => {
      const id = useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)!
      useNetworkStore.getState().selectNetwork(id)
      useNetworkStore.getState().removeCustomNetwork(id)

      const state = useNetworkStore.getState()
      expect(state.currentNetworkId).toBe(DEFAULT_NETWORK_ID)
      expect(state.connectionStatus).toBe('connecting')
    })

    it('does not change selection when removing a non-selected network', () => {
      const id = useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)!
      const before = useNetworkStore.getState().currentNetworkId
      useNetworkStore.getState().removeCustomNetwork(id)
      expect(useNetworkStore.getState().currentNetworkId).toBe(before)
    })
  })

  // --------------------------------------------------------------------------
  // setConnectionStatus
  // --------------------------------------------------------------------------
  describe('setConnectionStatus', () => {
    it('sets status to connected', () => {
      useNetworkStore.getState().setConnectionStatus('connected')
      expect(useNetworkStore.getState().connectionStatus).toBe('connected')
    })

    it('sets error message when provided', () => {
      useNetworkStore.getState().setConnectionStatus('error', 'Connection refused')
      expect(useNetworkStore.getState().connectionStatus).toBe('error')
      expect(useNetworkStore.getState().connectionError).toBe('Connection refused')
    })

    it('clears error when not provided', () => {
      useNetworkStore.getState().setConnectionStatus('error', 'err')
      useNetworkStore.getState().setConnectionStatus('connected')
      expect(useNetworkStore.getState().connectionError).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // reset
  // --------------------------------------------------------------------------
  describe('reset', () => {
    it('restores default state', () => {
      // Make various changes
      useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)
      useNetworkStore.getState().setConnectionStatus('error', 'bad')

      useNetworkStore.getState().reset()
      const state = useNetworkStore.getState()
      expect(state.currentNetworkId).toBe(DEFAULT_NETWORK_ID)
      expect(state.customNetworks).toEqual([])
      expect(state.connectionStatus).toBe('disconnected')
      expect(state.connectionError).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // Selectors
  // --------------------------------------------------------------------------
  describe('selectors', () => {
    it('selectCurrentNetwork returns the current network', () => {
      const state = useNetworkStore.getState()
      expect(selectCurrentNetwork(state)).toEqual(state.currentNetwork)
    })

    it('selectCurrentNetworkId returns the current ID', () => {
      const state = useNetworkStore.getState()
      expect(selectCurrentNetworkId(state)).toBe(DEFAULT_NETWORK_ID)
    })

    it('selectCustomNetworks returns custom networks array', () => {
      useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)
      const state = useNetworkStore.getState()
      expect(selectCustomNetworks(state)).toHaveLength(1)
    })

    it('selectConnectionStatus returns the status', () => {
      useNetworkStore.getState().setConnectionStatus('connected')
      expect(selectConnectionStatus(useNetworkStore.getState())).toBe('connected')
    })

    it('selectConnectionError returns the error', () => {
      useNetworkStore.getState().setConnectionStatus('error', 'fail')
      expect(selectConnectionError(useNetworkStore.getState())).toBe('fail')
    })

    it('selectIsConnected returns true only when connected', () => {
      useNetworkStore.getState().setConnectionStatus('connected')
      expect(selectIsConnected(useNetworkStore.getState())).toBe(true)
      useNetworkStore.getState().setConnectionStatus('connecting')
      expect(selectIsConnected(useNetworkStore.getState())).toBe(false)
    })

    it('selectIsConnecting returns true only when connecting', () => {
      useNetworkStore.getState().setConnectionStatus('connecting')
      expect(selectIsConnecting(useNetworkStore.getState())).toBe(true)
      useNetworkStore.getState().setConnectionStatus('connected')
      expect(selectIsConnecting(useNetworkStore.getState())).toBe(false)
    })

    it('selectAllNetworks includes presets and custom networks', () => {
      useNetworkStore.getState().addCustomNetwork(validCustomNetworkData)
      const state = useNetworkStore.getState()
      const all = selectAllNetworks(state)
      expect(all).toHaveLength(PRESET_NETWORKS.length + 1)
    })
  })
})
