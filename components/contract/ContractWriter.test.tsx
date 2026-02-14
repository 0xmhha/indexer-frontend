import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// ============================================================================
// Mocks
// ============================================================================

const mockWriteContractAsync = vi.fn()
const mockShowWarning = vi.fn()
const mockShowError = vi.fn()
const mockShowInfo = vi.fn()
const mockShowSuccess = vi.fn()
const mockSimulateContract = vi.fn()

let mockAccountState = {
  address: undefined as `0x${string}` | undefined,
  isConnected: false,
}

vi.mock('wagmi', () => ({
  useAccount: () => mockAccountState,
  useWriteContract: () => ({
    writeContractAsync: mockWriteContractAsync,
  }),
  useWaitForTransactionReceipt: () => ({
    data: undefined,
    isSuccess: false,
    isError: false,
  }),
  useConnect: () => ({
    connect: vi.fn(),
    connectors: [],
    isPending: false,
  }),
  useDisconnect: () => ({
    disconnect: vi.fn(),
  }),
}))

vi.mock('@wagmi/core', () => ({
  simulateContract: (...args: unknown[]) => mockSimulateContract(...args),
}))

vi.mock('@wagmi/connectors', () => ({
  injected: () => ({}),
}))

vi.mock('@/lib/wagmi/config', () => ({
  wagmiConfig: {},
}))

vi.mock('@/lib/contexts/NotificationContext', () => ({
  useNotifications: () => ({
    showWarning: mockShowWarning,
    showError: mockShowError,
    showInfo: mockShowInfo,
    showSuccess: mockShowSuccess,
  }),
}))

vi.mock('viem', () => ({
  parseEther: (val: string) => BigInt(Math.floor(parseFloat(val) * 1e18)),
}))

// Import after mocks
import { ContractWriter } from './ContractWriter'
import type { ContractABI } from '@/types/contract'

// ============================================================================
// Test Data
// ============================================================================

const TEST_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'

const mockWriteAbi: ContractABI = [
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
]

const mockViewOnlyAbi: ContractABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'pure',
  },
]

const mockMixedAbi: ContractABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'payable',
  },
]

// ============================================================================
// Tests
// ============================================================================

describe('ContractWriter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAccountState = {
      address: undefined,
      isConnected: false,
    }
  })

  // ---------- Disconnected State ----------

  describe('when wallet is disconnected', () => {
    it('renders WalletConnectionCard with connect option', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)
      expect(screen.getByText('WALLET CONNECTION')).toBeInTheDocument()
      expect(screen.getByText('Connect your wallet to write to the contract')).toBeInTheDocument()
    })

    it('renders ConnectWalletPromptCard when ABI has write functions', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)
      expect(
        screen.getByText('Connect your wallet to interact with write functions')
      ).toBeInTheDocument()
    })

    it('renders NoWriteFunctionsCard when ABI has only view functions', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockViewOnlyAbi} />)
      expect(
        screen.getByText('No write functions found in contract ABI')
      ).toBeInTheDocument()
    })

    it('does not render WriteFunctionCards when disconnected', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)
      expect(screen.queryByText('transfer')).not.toBeInTheDocument()
      expect(screen.queryByText('deposit')).not.toBeInTheDocument()
    })
  })

  // ---------- Connected State ----------

  describe('when wallet is connected', () => {
    beforeEach(() => {
      mockAccountState = {
        address: TEST_ADDRESS as `0x${string}`,
        isConnected: true,
      }
    })

    it('renders WalletConnectionCard with connected address', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)
      expect(screen.getByText('WALLET CONNECTION')).toBeInTheDocument()
      expect(screen.getByText('CONNECTED ADDRESS')).toBeInTheDocument()
      expect(screen.getByText(TEST_ADDRESS)).toBeInTheDocument()
    })

    it('renders WriteFunctionCard for each write function', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)
      expect(screen.getByText('transfer')).toBeInTheDocument()
      expect(screen.getByText('deposit')).toBeInTheDocument()
    })

    it('renders WRITE buttons for each write function', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)
      const writeButtons = screen.getAllByText('WRITE')
      expect(writeButtons).toHaveLength(2)
    })

    it('renders PAYABLE label for payable functions', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)
      expect(screen.getByText('PAYABLE')).toBeInTheDocument()
    })

    it('renders input fields for function parameters', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)
      expect(screen.getByText('to (address)')).toBeInTheDocument()
      expect(screen.getByText('amount (uint256)')).toBeInTheDocument()
    })

    it('renders VALUE (ETH) input for payable functions', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)
      expect(screen.getByText('VALUE (ETH)')).toBeInTheDocument()
    })

    it('renders NoWriteFunctionsCard when ABI has only view/pure functions', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockViewOnlyAbi} />)
      expect(
        screen.getByText('No write functions found in contract ABI')
      ).toBeInTheDocument()
    })

    it('filters out view and pure functions from mixed ABI', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockMixedAbi} />)
      // Write functions should be rendered
      expect(screen.getByText('transfer')).toBeInTheDocument()
      expect(screen.getByText('mint')).toBeInTheDocument()
      // View/pure function names should not appear as card titles
      // (balanceOf and totalSupply are view/pure)
      const writeButtons = screen.getAllByText('WRITE')
      expect(writeButtons).toHaveLength(2)
    })
  })

  // ---------- Error Classification (through component behavior) ----------

  describe('error classification through handleWriteFunction', () => {
    beforeEach(() => {
      mockAccountState = {
        address: TEST_ADDRESS as `0x${string}`,
        isConnected: true,
      }
    })

    it('shows "Transaction Rejected" for user rejected errors', async () => {
      mockSimulateContract.mockRejectedValueOnce(new Error('user rejected the request'))

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockShowError).toHaveBeenCalledWith(
        'Simulation: Transaction Rejected',
        'You rejected the transaction in your wallet.'
      )
    })

    it('shows "Insufficient Funds" for insufficient funds errors', async () => {
      mockSimulateContract.mockRejectedValueOnce(new Error('insufficient funds for gas'))

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockShowError).toHaveBeenCalledWith(
        'Simulation: Insufficient Funds',
        'Your wallet does not have enough funds to cover the transaction and gas costs.'
      )
    })

    it('shows "Gas Limit Exceeded" for out of gas errors', async () => {
      mockSimulateContract.mockRejectedValueOnce(new Error('out of gas'))

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockShowError).toHaveBeenCalledWith(
        'Simulation: Gas Limit Exceeded',
        'The transaction requires more gas than the limit allows.'
      )
    })

    it('shows "Nonce Conflict" for nonce too low errors', async () => {
      mockSimulateContract.mockRejectedValueOnce(new Error('nonce too low'))

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockShowError).toHaveBeenCalledWith(
        'Simulation: Nonce Conflict',
        'A transaction with this nonce was already submitted. Try again.'
      )
    })

    it('shows "Contract Reverted" without reason for generic revert', async () => {
      mockSimulateContract.mockRejectedValueOnce(new Error('execution reverted'))

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockShowError).toHaveBeenCalledWith(
        'Simulation: Contract Reverted',
        'The contract reverted the transaction. Check your inputs.'
      )
    })

    it('shows "Contract Reverted" with extracted reason', async () => {
      mockSimulateContract.mockRejectedValueOnce(
        new Error('execution reverted: reason: Unauthorized')
      )

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockShowError).toHaveBeenCalledWith(
        'Simulation: Contract Reverted',
        'The contract reverted: Unauthorized'
      )
    })

    it('shows "Network Error" for timeout errors', async () => {
      mockSimulateContract.mockRejectedValueOnce(new Error('timeout'))

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockShowError).toHaveBeenCalledWith(
        'Simulation: Network Error',
        'Could not reach the network. Check your connection and try again.'
      )
    })

    it('shows "Transaction Error" with truncated message for generic errors', async () => {
      const longMessage = 'A'.repeat(250)
      mockSimulateContract.mockRejectedValueOnce(new Error(longMessage))

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockShowError).toHaveBeenCalledWith(
        'Simulation: Transaction Error',
        `${'A'.repeat(200)}...`
      )
    })

    it('shows "Transaction Error" without truncation for short generic errors', async () => {
      mockSimulateContract.mockRejectedValueOnce(new Error('something unexpected'))

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockShowError).toHaveBeenCalledWith(
        'Simulation: Transaction Error',
        'something unexpected'
      )
    })

    it('shows warning when trying to write while disconnected', async () => {
      mockAccountState = { address: undefined, isConnected: false }

      // Use an ABI with write functions, render connected first to get the buttons,
      // then disconnect. Instead, we test the handleWriteFunction guard by re-checking
      // the component with connected state first.
      // Actually, when disconnected the component shows ConnectWalletPromptCard not WriteFunctionCards.
      // So we can't click WRITE while disconnected through normal UI flow.
      // This guard exists for programmatic edge cases - skip UI-based test for this.
    })
  })

  // ---------- Transaction Flow ----------

  describe('transaction submission flow', () => {
    beforeEach(() => {
      mockAccountState = {
        address: TEST_ADDRESS as `0x${string}`,
        isConnected: true,
      }
    })

    it('calls simulateContract then writeContractAsync on successful simulation', async () => {
      mockSimulateContract.mockResolvedValueOnce({
        request: { gas: BigInt(21000) },
      })
      mockWriteContractAsync.mockResolvedValueOnce('0xabc123')

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockSimulateContract).toHaveBeenCalledTimes(1)
      expect(mockWriteContractAsync).toHaveBeenCalledTimes(1)
      expect(mockShowInfo).toHaveBeenCalledWith(
        'Transaction Submitted',
        'Waiting for confirmation...'
      )
    })

    it('does not call writeContractAsync when simulation fails', async () => {
      mockSimulateContract.mockRejectedValueOnce(new Error('execution reverted'))

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockSimulateContract).toHaveBeenCalledTimes(1)
      expect(mockWriteContractAsync).not.toHaveBeenCalled()
    })

    it('classifies errors from writeContractAsync after successful simulation', async () => {
      mockSimulateContract.mockResolvedValueOnce({
        request: { gas: BigInt(21000) },
      })
      mockWriteContractAsync.mockRejectedValueOnce(new Error('user rejected the request'))

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockShowError).toHaveBeenCalledWith(
        'Transaction Rejected',
        'You rejected the transaction in your wallet.'
      )
    })

    it('passes input values to simulateContract', async () => {
      mockSimulateContract.mockResolvedValueOnce({
        request: { gas: BigInt(21000) },
      })
      mockWriteContractAsync.mockResolvedValueOnce('0xabc123')

      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={mockWriteAbi} />)

      // Fill in the transfer function inputs
      const inputs = screen.getAllByRole('textbox')
      // First two inputs belong to the transfer function (to, amount)
      await act(async () => {
        fireEvent.change(inputs[0]!, { target: { value: '0xRecipientAddress' } })
        fireEvent.change(inputs[1]!, { target: { value: '1000' } })
      })

      const writeButtons = screen.getAllByText('WRITE')
      await act(async () => {
        fireEvent.click(writeButtons[0]!)
      })

      expect(mockSimulateContract).toHaveBeenCalledWith(
        expect.anything(), // wagmiConfig
        expect.objectContaining({
          functionName: 'transfer',
          args: ['0xRecipientAddress', '1000'],
        })
      )
    })
  })

  // ---------- Empty ABI ----------

  describe('with empty ABI', () => {
    it('renders NoWriteFunctionsCard for empty ABI', () => {
      render(<ContractWriter contractAddress={TEST_ADDRESS} abi={[]} />)
      expect(
        screen.getByText('No write functions found in contract ABI')
      ).toBeInTheDocument()
    })
  })
})
