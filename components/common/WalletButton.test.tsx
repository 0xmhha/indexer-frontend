import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// ============================================================================
// Mocks
// ============================================================================

const mockConnect = vi.fn()
const mockDisconnect = vi.fn()
const mockShowError = vi.fn()

const mockConnectors = [
  { uid: 'injected-1', name: 'MetaMask' },
  { uid: 'wc-1', name: 'WalletConnect' },
  { uid: 'cb-1', name: 'Coinbase Wallet' },
]

let mockAccountState = {
  address: undefined as `0x${string}` | undefined,
  isConnected: false,
  connector: undefined as { name: string } | undefined,
}

let mockConnectState = {
  isPending: false,
}

vi.mock('wagmi', () => ({
  useAccount: () => mockAccountState,
  useConnect: () => ({
    connect: mockConnect,
    connectors: mockConnectors,
    isPending: mockConnectState.isPending,
  }),
  useDisconnect: () => ({
    disconnect: mockDisconnect,
  }),
  useChainId: () => 8283,
  useSwitchChain: () => ({
    switchChain: vi.fn(),
    error: null,
    isError: false,
  }),
}))

vi.mock('@/lib/hooks/useChainSync', () => ({
  useChainSync: vi.fn(() => ({
    isMismatched: false,
    isSwitching: false,
    walletChainId: 8283,
    desiredChainId: 8283,
  })),
}))

vi.mock('@/lib/hooks/useClickOutside', () => ({
  useClickOutside: vi.fn(),
}))

vi.mock('@/lib/contexts/NotificationContext', () => ({
  useNotifications: () => ({
    showError: mockShowError,
    showWarning: vi.fn(),
    showSuccess: vi.fn(),
    showInfo: vi.fn(),
  }),
}))

vi.mock('@/stores/networkStore', () => ({
  useNetworkStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      currentNetwork: { id: 'stablenet-local', chain: { id: '8283' } },
      customNetworks: [],
      selectNetwork: vi.fn(),
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
  selectCurrentNetwork: (s: Record<string, unknown>) => s.currentNetwork,
  selectCustomNetworks: (s: Record<string, unknown>) => s.customNetworks,
}))

// Import after mocks
import { WalletButton } from './WalletButton'

// ============================================================================
// Tests
// ============================================================================

describe('WalletButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAccountState = {
      address: undefined,
      isConnected: false,
      connector: undefined,
    }
    mockConnectState = { isPending: false }

    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  // ---------- Disconnected State ----------

  describe('when disconnected', () => {
    it('renders CONNECT button', () => {
      render(<WalletButton />)
      expect(screen.getByText('CONNECT')).toBeInTheDocument()
    })

    it('shows CONNECTING... when pending', () => {
      mockConnectState.isPending = true
      render(<WalletButton />)
      expect(screen.getByText('CONNECTING...')).toBeInTheDocument()
    })

    it('disables button when pending', () => {
      mockConnectState.isPending = true
      render(<WalletButton />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('shows connector list on click', () => {
      render(<WalletButton />)
      fireEvent.click(screen.getByText('CONNECT'))
      expect(screen.getByText('SELECT WALLET')).toBeInTheDocument()
      expect(screen.getByText('MetaMask')).toBeInTheDocument()
      expect(screen.getByText('WalletConnect')).toBeInTheDocument()
      expect(screen.getByText('Coinbase Wallet')).toBeInTheDocument()
    })

    it('calls connect with selected connector', () => {
      render(<WalletButton />)
      fireEvent.click(screen.getByText('CONNECT'))
      fireEvent.click(screen.getByText('WalletConnect'))
      expect(mockConnect).toHaveBeenCalledWith({
        connector: mockConnectors[1],
      })
    })

    it('closes dropdown after selecting connector', () => {
      render(<WalletButton />)
      fireEvent.click(screen.getByText('CONNECT'))
      expect(screen.getByText('SELECT WALLET')).toBeInTheDocument()
      fireEvent.click(screen.getByText('MetaMask'))
      expect(screen.queryByText('SELECT WALLET')).not.toBeInTheDocument()
    })

    it('has correct aria attributes', () => {
      render(<WalletButton />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Connect wallet')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })
  })

  // ---------- Connected State ----------

  describe('when connected', () => {
    const TEST_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`

    beforeEach(() => {
      mockAccountState = {
        address: TEST_ADDRESS,
        isConnected: true,
        connector: { name: 'MetaMask' },
      }
    })

    it('renders truncated address', () => {
      render(<WalletButton />)
      expect(screen.getByText('0x1234...5678')).toBeInTheDocument()
    })

    it('shows connected indicator dot', () => {
      const { container } = render(<WalletButton />)
      expect(container.querySelector('.bg-success')).toBeInTheDocument()
    })

    it('shows account menu on click', () => {
      render(<WalletButton />)
      fireEvent.click(screen.getByText('0x1234...5678'))
      expect(screen.getByText('MetaMask')).toBeInTheDocument()
      expect(screen.getByText(TEST_ADDRESS)).toBeInTheDocument()
      expect(screen.getByText('Copy Address')).toBeInTheDocument()
      expect(screen.getByText('Disconnect')).toBeInTheDocument()
    })

    it('copies address to clipboard', async () => {
      render(<WalletButton />)
      fireEvent.click(screen.getByText('0x1234...5678'))

      await act(async () => {
        fireEvent.click(screen.getByText('Copy Address'))
      })

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(TEST_ADDRESS)
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    it('calls disconnect and closes menu', () => {
      render(<WalletButton />)
      fireEvent.click(screen.getByText('0x1234...5678'))
      fireEvent.click(screen.getByText('Disconnect'))
      expect(mockDisconnect).toHaveBeenCalled()
      expect(screen.queryByText('Disconnect')).not.toBeInTheDocument()
    })

    it('shows CONNECTED when no connector name', () => {
      mockAccountState.connector = undefined
      render(<WalletButton />)
      fireEvent.click(screen.getByText('0x1234...5678'))
      expect(screen.getByText('CONNECTED')).toBeInTheDocument()
    })

    it('shows connector label for known connectors', () => {
      mockAccountState.connector = { name: 'Coinbase Wallet' }
      render(<WalletButton />)
      fireEvent.click(screen.getByText('0x1234...5678'))
      expect(screen.getByText('Coinbase Wallet')).toBeInTheDocument()
    })

    it('has correct aria attributes when connected', () => {
      render(<WalletButton />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', `Wallet menu. Address: ${TEST_ADDRESS}`)
    })

    it('closes dropdown on Escape key', () => {
      render(<WalletButton />)
      fireEvent.click(screen.getByText('0x1234...5678'))
      expect(screen.getByText('Copy Address')).toBeInTheDocument()

      fireEvent.keyDown(screen.getByText('0x1234...5678').closest('div')!, {
        key: 'Escape',
      })
      expect(screen.queryByText('Copy Address')).not.toBeInTheDocument()
    })
  })
})
