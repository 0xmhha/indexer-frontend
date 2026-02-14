import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// ============================================================================
// Mocks
// ============================================================================

const mockConnect = vi.fn()
const mockDisconnect = vi.fn()

vi.mock('wagmi', () => ({
  useConnect: () => ({
    connect: mockConnect,
    connectors: [{ uid: 'injected-1', name: 'MetaMask' }],
  }),
  useDisconnect: () => ({
    disconnect: mockDisconnect,
  }),
}))

vi.mock('@wagmi/connectors', () => ({
  injected: () => ({ uid: 'injected-mock', name: 'Injected' }),
}))

// Import after mocks
import {
  getPlaceholder,
  validateAbiInput,
  WalletConnectionCard,
  FunctionInputField,
  ValueInput,
  TransactionResultDisplay,
  TransactionErrorDisplay,
  WriteFunctionCard,
  NoWriteFunctionsCard,
  ConnectWalletPromptCard,
} from './ContractWriterComponents'

import type { TransactionResult } from './ContractWriterComponents'
import type { AbiFunction, AbiInput } from '@/types/contract'

// ============================================================================
// getPlaceholder
// ============================================================================

describe('getPlaceholder', () => {
  it('returns "0x..." for address type', () => {
    expect(getPlaceholder('address')).toBe('0x...')
  })

  it('returns "0" for uint256 type', () => {
    expect(getPlaceholder('uint256')).toBe('0')
  })

  it('returns "0" for int256 type', () => {
    expect(getPlaceholder('int256')).toBe('0')
  })

  it('returns "true or false" for bool type', () => {
    expect(getPlaceholder('bool')).toBe('true or false')
  })

  it('returns "Enter string" for string type', () => {
    expect(getPlaceholder('string')).toBe('Enter string')
  })

  it('returns "0x..." for bytes32 type', () => {
    expect(getPlaceholder('bytes32')).toBe('0x...')
  })

  it('returns "[value1, value2, ...]" for pure array types', () => {
    expect(getPlaceholder('string[]')).toBe('[value1, value2, ...]')
  })

  it('returns "0" for uint256[] (uint match takes priority)', () => {
    expect(getPlaceholder('uint256[]')).toBe('0')
  })

  it('returns "Enter <type>" for unknown types', () => {
    expect(getPlaceholder('other')).toBe('Enter other')
  })
})

// ============================================================================
// validateAbiInput
// ============================================================================

describe('validateAbiInput', () => {
  it('returns null for empty value', () => {
    expect(validateAbiInput('', 'address')).toBeNull()
  })

  // ---- address ----

  describe('address type', () => {
    it('returns null for valid address', () => {
      expect(validateAbiInput(`0x${'aB'.repeat(20)}`, 'address')).toBeNull()
    })

    it('returns error for invalid address (too short)', () => {
      expect(validateAbiInput('0x1234', 'address')).toMatch(/hex address/)
    })

    it('returns error for address without 0x prefix', () => {
      expect(validateAbiInput('ab'.repeat(20), 'address')).toMatch(/hex address/)
    })
  })

  // ---- bool ----

  describe('bool type', () => {
    it('returns null for "true"', () => {
      expect(validateAbiInput('true', 'bool')).toBeNull()
    })

    it('returns null for "false"', () => {
      expect(validateAbiInput('false', 'bool')).toBeNull()
    })

    it('returns error for "yes"', () => {
      expect(validateAbiInput('yes', 'bool')).toMatch(/true.*false/)
    })
  })

  // ---- uint256 ----

  describe('uint256 type', () => {
    it('returns null for positive integer', () => {
      expect(validateAbiInput('123', 'uint256')).toBeNull()
    })

    it('returns error for negative value', () => {
      expect(validateAbiInput('-1', 'uint256')).toMatch(/cannot be negative/i)
    })

    it('returns error for non-numeric value', () => {
      expect(validateAbiInput('abc', 'uint256')).toMatch(/integer/i)
    })
  })

  // ---- int256 ----

  describe('int256 type', () => {
    it('returns null for positive integer', () => {
      expect(validateAbiInput('123', 'int256')).toBeNull()
    })

    it('returns null for negative integer', () => {
      expect(validateAbiInput('-1', 'int256')).toBeNull()
    })

    it('returns error for non-numeric value', () => {
      expect(validateAbiInput('abc', 'int256')).toMatch(/integer/i)
    })
  })

  // ---- bytes32 (fixed-size bytes) ----

  describe('bytes32 type', () => {
    it('returns null for valid bytes32 hex', () => {
      const validBytes32 = `0x${'ab'.repeat(32)}`
      expect(validateAbiInput(validBytes32, 'bytes32')).toBeNull()
    })

    it('returns error for wrong length', () => {
      const tooShort = `0x${'ab'.repeat(16)}`
      expect(validateAbiInput(tooShort, 'bytes32')).toMatch(/Expected/)
    })

    it('returns error for invalid hex characters', () => {
      expect(validateAbiInput('0xZZZZ', 'bytes32')).toMatch(/hex/)
    })
  })

  // ---- bytes (dynamic) ----

  describe('bytes type', () => {
    it('returns null for valid even-length hex', () => {
      expect(validateAbiInput('0xabcd', 'bytes')).toBeNull()
    })

    it('returns error for odd-length hex', () => {
      expect(validateAbiInput('0xabc', 'bytes')).toMatch(/even length/)
    })

    it('returns error for non-hex value', () => {
      expect(validateAbiInput('0xGG', 'bytes')).toMatch(/hex/)
    })
  })

  // ---- array (string[]) ----

  describe('array type (string[])', () => {
    it('returns null for valid JSON array', () => {
      expect(validateAbiInput('["a","b"]', 'string[]')).toBeNull()
    })

    it('returns error for invalid non-comma value', () => {
      expect(validateAbiInput('hello', 'string[]')).toMatch(/JSON array|comma/)
    })

    it('returns null for comma-separated values (lenient)', () => {
      expect(validateAbiInput('a,b,c', 'string[]')).toBeNull()
    })
  })

  // ---- array (uint256[]) — note: uint match takes priority ----

  describe('array type (uint256[])', () => {
    it('hits numeric validator since type includes "uint"', () => {
      expect(validateAbiInput('[1,2,3]', 'uint256[]')).toMatch(/integer/i)
    })
  })

  // ---- tuple ----

  describe('tuple type', () => {
    it('returns null for valid JSON object', () => {
      expect(validateAbiInput('{"a":1}', 'tuple')).toBeNull()
    })

    it('returns error for invalid JSON', () => {
      expect(validateAbiInput('{bad}', 'tuple')).toMatch(/valid JSON/)
    })
  })
})

// ============================================================================
// WalletConnectionCard
// ============================================================================

describe('WalletConnectionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders connect prompt when not connected', () => {
    render(<WalletConnectionCard isConnected={false} address="" />)
    expect(screen.getByText(/connect your wallet/i)).toBeInTheDocument()
    expect(screen.getByText('CONNECT WALLET')).toBeInTheDocument()
  })

  it('calls connect when CONNECT WALLET button is clicked', () => {
    render(<WalletConnectionCard isConnected={false} address="" />)
    fireEvent.click(screen.getByText('CONNECT WALLET'))
    expect(mockConnect).toHaveBeenCalledTimes(1)
  })

  it('renders address and disconnect when connected', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678'
    render(<WalletConnectionCard isConnected={true} address={addr} />)
    expect(screen.getByText(addr)).toBeInTheDocument()
    expect(screen.getByText('DISCONNECT')).toBeInTheDocument()
  })

  it('calls disconnect when DISCONNECT button is clicked', () => {
    render(<WalletConnectionCard isConnected={true} address="0xabc" />)
    fireEvent.click(screen.getByText('DISCONNECT'))
    expect(mockDisconnect).toHaveBeenCalledTimes(1)
  })
})

// ============================================================================
// FunctionInputField
// ============================================================================

describe('FunctionInputField', () => {
  const defaultInput: AbiInput = { name: 'amount', type: 'uint256' }

  it('renders label with name and type', () => {
    render(
      <FunctionInputField
        input={defaultInput}
        index={0}
        disabled={false}
        value=""
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText(/amount.*uint256/)).toBeInTheDocument()
  })

  it('uses param index when name is empty', () => {
    const unnamed: AbiInput = { name: '', type: 'address' }
    render(
      <FunctionInputField
        input={unnamed}
        index={2}
        disabled={false}
        value=""
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText(/param2.*address/)).toBeInTheDocument()
  })

  it('shows validation error for invalid input', () => {
    render(
      <FunctionInputField
        input={defaultInput}
        index={0}
        disabled={false}
        value="abc"
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText(/integer/i)).toBeInTheDocument()
  })

  it('does not show validation error for valid input', () => {
    render(
      <FunctionInputField
        input={defaultInput}
        index={0}
        disabled={false}
        value="123"
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByText(/integer/i)).not.toBeInTheDocument()
  })

  it('calls onChange when input changes', () => {
    const onChange = vi.fn()
    render(
      <FunctionInputField
        input={defaultInput}
        index={0}
        disabled={false}
        value=""
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '42' } })
    expect(onChange).toHaveBeenCalledWith('42')
  })

  it('disables input when disabled prop is true', () => {
    render(
      <FunctionInputField
        input={defaultInput}
        index={0}
        disabled={true}
        value=""
        onChange={vi.fn()}
      />
    )
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})

// ============================================================================
// ValueInput
// ============================================================================

describe('ValueInput', () => {
  it('renders VALUE (ETH) label', () => {
    render(<ValueInput disabled={false} value="" onChange={vi.fn()} />)
    expect(screen.getByText('VALUE (ETH)')).toBeInTheDocument()
  })

  it('renders input with placeholder 0.0', () => {
    render(<ValueInput disabled={false} value="" onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('0.0')).toBeInTheDocument()
  })

  it('calls onChange on input change', () => {
    const onChange = vi.fn()
    render(<ValueInput disabled={false} value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1.5' } })
    expect(onChange).toHaveBeenCalledWith('1.5')
  })

  it('disables input when disabled', () => {
    render(<ValueInput disabled={true} value="" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})

// ============================================================================
// TransactionResultDisplay
// ============================================================================

describe('TransactionResultDisplay', () => {
  const baseResult: TransactionResult = {
    hash: '',
    loading: false,
    success: null,
    error: null,
    gasEstimate: null,
  }

  it('renders nothing when hash is empty', () => {
    const { container } = render(<TransactionResultDisplay result={baseResult} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders hash link when hash is present', () => {
    const result = { ...baseResult, hash: '0xabc123' }
    render(<TransactionResultDisplay result={result} />)
    const link = screen.getByText('0xabc123')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/tx/0xabc123')
  })

  it('shows success status', () => {
    const result = { ...baseResult, hash: '0xabc', success: true }
    render(<TransactionResultDisplay result={result} />)
    expect(screen.getByText(/Success/)).toBeInTheDocument()
  })

  it('shows failed status', () => {
    const result = { ...baseResult, hash: '0xabc', success: false }
    render(<TransactionResultDisplay result={result} />)
    expect(screen.getByText(/Failed/)).toBeInTheDocument()
  })

  it('does not show status when success is null', () => {
    const result = { ...baseResult, hash: '0xabc', success: null }
    render(<TransactionResultDisplay result={result} />)
    expect(screen.queryByText(/Success/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Failed/)).not.toBeInTheDocument()
  })
})

// ============================================================================
// TransactionErrorDisplay
// ============================================================================

describe('TransactionErrorDisplay', () => {
  it('shows error message', () => {
    render(<TransactionErrorDisplay error="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('shows RETRY button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<TransactionErrorDisplay error="Error" onRetry={onRetry} />)
    const retryBtn = screen.getByText('RETRY')
    expect(retryBtn).toBeInTheDocument()
    fireEvent.click(retryBtn)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not show RETRY button when onRetry is not provided', () => {
    render(<TransactionErrorDisplay error="Error" />)
    expect(screen.queryByText('RETRY')).not.toBeInTheDocument()
  })
})

// ============================================================================
// WriteFunctionCard
// ============================================================================

describe('WriteFunctionCard', () => {
  const mockFunc: AbiFunction = {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  }

  it('renders function name', () => {
    render(
      <WriteFunctionCard
        func={mockFunc}
        index={0}
        latestTx={undefined}
        onWrite={vi.fn()}
        inputValues={['', '']}
        onInputChange={vi.fn()}
        payableValue=""
        onPayableValueChange={vi.fn()}
      />
    )
    expect(screen.getByText('transfer')).toBeInTheDocument()
  })

  it('renders function inputs', () => {
    render(
      <WriteFunctionCard
        func={mockFunc}
        index={0}
        latestTx={undefined}
        onWrite={vi.fn()}
        inputValues={['', '']}
        onInputChange={vi.fn()}
        payableValue=""
        onPayableValueChange={vi.fn()}
      />
    )
    expect(screen.getByText(/to.*address/)).toBeInTheDocument()
    expect(screen.getByText(/amount.*uint256/)).toBeInTheDocument()
  })

  it('renders WRITE button', () => {
    render(
      <WriteFunctionCard
        func={mockFunc}
        index={0}
        latestTx={undefined}
        onWrite={vi.fn()}
        inputValues={['', '']}
        onInputChange={vi.fn()}
        payableValue=""
        onPayableValueChange={vi.fn()}
      />
    )
    expect(screen.getByText('WRITE')).toBeInTheDocument()
  })

  it('shows PROCESSING... when loading', () => {
    const tx: TransactionResult = {
      hash: '',
      loading: true,
      success: null,
      error: null,
      gasEstimate: null,
    }
    render(
      <WriteFunctionCard
        func={mockFunc}
        index={0}
        latestTx={tx}
        onWrite={vi.fn()}
        inputValues={['', '']}
        onInputChange={vi.fn()}
        payableValue=""
        onPayableValueChange={vi.fn()}
      />
    )
    expect(screen.getByText('PROCESSING...')).toBeInTheDocument()
  })

  it('shows PAYABLE badge for payable functions', () => {
    const payableFunc: AbiFunction = {
      ...mockFunc,
      stateMutability: 'payable',
    }
    render(
      <WriteFunctionCard
        func={payableFunc}
        index={0}
        latestTx={undefined}
        onWrite={vi.fn()}
        inputValues={['', '']}
        onInputChange={vi.fn()}
        payableValue=""
        onPayableValueChange={vi.fn()}
      />
    )
    expect(screen.getByText('PAYABLE')).toBeInTheDocument()
  })

  it('shows VALUE (ETH) input for payable functions', () => {
    const payableFunc: AbiFunction = {
      ...mockFunc,
      stateMutability: 'payable',
    }
    render(
      <WriteFunctionCard
        func={payableFunc}
        index={0}
        latestTx={undefined}
        onWrite={vi.fn()}
        inputValues={['', '']}
        onInputChange={vi.fn()}
        payableValue=""
        onPayableValueChange={vi.fn()}
      />
    )
    expect(screen.getByText('VALUE (ETH)')).toBeInTheDocument()
  })

  it('calls onWrite when WRITE button is clicked', () => {
    const onWrite = vi.fn()
    render(
      <WriteFunctionCard
        func={mockFunc}
        index={0}
        latestTx={undefined}
        onWrite={onWrite}
        inputValues={['', '']}
        onInputChange={vi.fn()}
        payableValue=""
        onPayableValueChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('WRITE'))
    expect(onWrite).toHaveBeenCalledTimes(1)
  })

  it('shows gas estimate when available', () => {
    const tx: TransactionResult = {
      hash: '',
      loading: false,
      success: null,
      error: null,
      gasEstimate: '21000',
    }
    render(
      <WriteFunctionCard
        func={mockFunc}
        index={0}
        latestTx={tx}
        onWrite={vi.fn()}
        inputValues={['', '']}
        onInputChange={vi.fn()}
        payableValue=""
        onPayableValueChange={vi.fn()}
      />
    )
    expect(screen.getByText(/21000/)).toBeInTheDocument()
  })

  it('uses fallback name when func.name is undefined', () => {
    const { name: _name, ...rest } = mockFunc
    const unnamed: AbiFunction = {
      ...rest,
    }
    render(
      <WriteFunctionCard
        func={unnamed}
        index={3}
        latestTx={undefined}
        onWrite={vi.fn()}
        inputValues={['', '']}
        onInputChange={vi.fn()}
        payableValue=""
        onPayableValueChange={vi.fn()}
      />
    )
    expect(screen.getByText('function-3')).toBeInTheDocument()
  })

  it('shows gas consumption warning', () => {
    render(
      <WriteFunctionCard
        func={mockFunc}
        index={0}
        latestTx={undefined}
        onWrite={vi.fn()}
        inputValues={['', '']}
        onInputChange={vi.fn()}
        payableValue=""
        onPayableValueChange={vi.fn()}
      />
    )
    expect(screen.getByText(/consume gas/)).toBeInTheDocument()
  })
})

// ============================================================================
// NoWriteFunctionsCard
// ============================================================================

describe('NoWriteFunctionsCard', () => {
  it('renders "No write functions" text', () => {
    render(<NoWriteFunctionsCard />)
    expect(screen.getByText(/no write functions/i)).toBeInTheDocument()
  })
})

// ============================================================================
// ConnectWalletPromptCard
// ============================================================================

describe('ConnectWalletPromptCard', () => {
  it('renders "Connect your wallet" text', () => {
    render(<ConnectWalletPromptCard />)
    expect(screen.getByText(/connect your wallet/i)).toBeInTheDocument()
  })
})
