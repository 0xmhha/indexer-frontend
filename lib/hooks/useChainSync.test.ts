import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// ============================================================================
// Mocks
// ============================================================================

const mockSwitchChain = vi.fn()
const mockSelectNetwork = vi.fn()
const mockShowError = vi.fn()

let mockWalletChainId = 8283
let mockIsConnected = true
let mockSwitchError: Error | null = null
let mockIsSwitchError = false

let mockCurrentNetwork: { id: string; chain: { id: string } } | null = {
  id: 'stablenet-local',
  chain: { id: '8283' },
}

let mockCustomNetworks: Array<{ id: string; chain: { id: string } }> = []

let mockIsSwitching = false

vi.mock('wagmi', () => ({
  useChainId: () => mockWalletChainId,
  useSwitchChain: () => ({
    switchChain: mockSwitchChain,
    error: mockSwitchError,
    isError: mockIsSwitchError,
    isPending: mockIsSwitching,
  }),
  useAccount: () => ({
    isConnected: mockIsConnected,
  }),
}))

vi.mock('@/stores/networkStore', () => ({
  useNetworkStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      currentNetwork: mockCurrentNetwork,
      customNetworks: mockCustomNetworks,
      selectNetwork: mockSelectNetwork,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
  selectCurrentNetwork: (s: Record<string, unknown>) => s.currentNetwork,
  selectCustomNetworks: (s: Record<string, unknown>) => s.customNetworks,
}))

vi.mock('@/lib/contexts/NotificationContext', () => ({
  useNotifications: () => ({
    showError: mockShowError,
    showSuccess: vi.fn(),
    showWarning: vi.fn(),
    showInfo: vi.fn(),
  }),
}))

// Import after mocks
import { useChainSync } from './useChainSync'

// ============================================================================
// Tests
// ============================================================================

describe('useChainSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWalletChainId = 8283
    mockIsConnected = true
    mockSwitchError = null
    mockIsSwitchError = false
    mockIsSwitching = false
    mockCurrentNetwork = { id: 'stablenet-local', chain: { id: '8283' } }
    mockCustomNetworks = []
  })

  // ---------- Network Selector -> Wallet Chain ----------

  describe('network selector -> wallet chain switch', () => {
    it('does not switch when chain already matches', () => {
      renderHook(() => useChainSync())
      expect(mockSwitchChain).not.toHaveBeenCalled()
    })

    it('calls switchChain when chain differs', () => {
      mockCurrentNetwork = { id: 'stablenet-testnet', chain: { id: '8284' } }
      renderHook(() => useChainSync())
      expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 8284 })
    })

    it('does not switch when disconnected', () => {
      mockIsConnected = false
      mockCurrentNetwork = { id: 'stablenet-testnet', chain: { id: '8284' } }
      renderHook(() => useChainSync())
      expect(mockSwitchChain).not.toHaveBeenCalled()
    })

    it('does not switch when currentNetwork is null', () => {
      mockCurrentNetwork = null
      renderHook(() => useChainSync())
      expect(mockSwitchChain).not.toHaveBeenCalled()
    })
  })

  // ---------- Wallet Chain -> Network Store ----------

  describe('wallet chain -> network store sync', () => {
    it('does not sync when chain matches current network', () => {
      renderHook(() => useChainSync())
      expect(mockSelectNetwork).not.toHaveBeenCalled()
    })

    it('syncs network store for preset network', () => {
      mockWalletChainId = 8284
      renderHook(() => useChainSync())
      expect(mockSelectNetwork).toHaveBeenCalledWith('stablenet-testnet')
    })

    it('syncs network store for custom network', () => {
      mockWalletChainId = 99999
      mockCustomNetworks = [{ id: 'my-custom', chain: { id: '99999' } }]
      renderHook(() => useChainSync())
      expect(mockSelectNetwork).toHaveBeenCalledWith('my-custom')
    })

    it('does not sync when disconnected', () => {
      mockIsConnected = false
      mockWalletChainId = 8284
      renderHook(() => useChainSync())
      expect(mockSelectNetwork).not.toHaveBeenCalled()
    })

    it('does not sync for unknown chain id', () => {
      mockWalletChainId = 12345
      renderHook(() => useChainSync())
      expect(mockSelectNetwork).not.toHaveBeenCalled()
    })
  })

  // ---------- Chain Switch Error Handling ----------

  describe('chain switch error handling', () => {
    it('shows error toast on switch failure', () => {
      mockIsSwitchError = true
      mockSwitchError = new Error('Some chain switch error')
      renderHook(() => useChainSync())
      expect(mockShowError).toHaveBeenCalledWith(
        'Chain Switch Failed',
        'Could not switch to the selected network. Please switch manually in your wallet.'
      )
    })

    it('shows cancellation toast on user rejection', () => {
      mockIsSwitchError = true
      mockSwitchError = new Error('User rejected the request')
      renderHook(() => useChainSync())
      expect(mockShowError).toHaveBeenCalledWith(
        'Chain Switch Cancelled',
        'You rejected the network switch request'
      )
    })

    it('shows cancellation toast on user denied', () => {
      mockIsSwitchError = true
      mockSwitchError = new Error('User denied transaction')
      renderHook(() => useChainSync())
      expect(mockShowError).toHaveBeenCalledWith(
        'Chain Switch Cancelled',
        'You rejected the network switch request'
      )
    })

    it('does not show toast when no error', () => {
      renderHook(() => useChainSync())
      expect(mockShowError).not.toHaveBeenCalled()
    })

    it('does not show toast when isSwitchError but error is null', () => {
      mockIsSwitchError = true
      mockSwitchError = null
      renderHook(() => useChainSync())
      expect(mockShowError).not.toHaveBeenCalled()
    })
  })

  // ---------- Return State ----------

  describe('chain sync state', () => {
    it('returns not mismatched when chains match', () => {
      const { result } = renderHook(() => useChainSync())
      expect(result.current.isMismatched).toBe(false)
    })

    it('returns mismatched when chains differ', () => {
      mockCurrentNetwork = { id: 'stablenet-testnet', chain: { id: '8284' } }
      const { result } = renderHook(() => useChainSync())
      expect(result.current.isMismatched).toBe(true)
    })

    it('returns not mismatched when disconnected', () => {
      mockIsConnected = false
      mockCurrentNetwork = { id: 'stablenet-testnet', chain: { id: '8284' } }
      const { result } = renderHook(() => useChainSync())
      expect(result.current.isMismatched).toBe(false)
    })

    it('returns isSwitching from useSwitchChain', () => {
      mockIsSwitching = true
      const { result } = renderHook(() => useChainSync())
      expect(result.current.isSwitching).toBe(true)
    })

    it('returns wallet chain id and desired chain id', () => {
      mockWalletChainId = 8283
      mockCurrentNetwork = { id: 'stablenet-testnet', chain: { id: '8284' } }
      const { result } = renderHook(() => useChainSync())
      expect(result.current.walletChainId).toBe(8283)
      expect(result.current.desiredChainId).toBe(8284)
    })
  })
})
