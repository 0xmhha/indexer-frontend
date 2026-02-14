import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GasCalculator } from './GasCalculator'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock useGasTracker hook
const mockMetrics = {
  baseFee: BigInt(25000000000),
  baseFeeGwei: 25,
  priceLevels: [
    {
      tier: 'economy' as const,
      label: 'Economy',
      icon: '🐢',
      maxFeePerGas: BigInt(30000000000),
      maxPriorityFee: BigInt(1000000000), // 1 Gwei
      estimatedSeconds: 60,
      displayLabel: '~1m',
    },
    {
      tier: 'standard' as const,
      label: 'Standard',
      icon: '🚗',
      maxFeePerGas: BigInt(35000000000),
      maxPriorityFee: BigInt(2000000000), // 2 Gwei
      estimatedSeconds: 15,
      displayLabel: '~15s',
    },
    {
      tier: 'priority' as const,
      label: 'Priority',
      icon: '🚀',
      maxFeePerGas: BigInt(45000000000),
      maxPriorityFee: BigInt(3000000000), // 3 Gwei
      estimatedSeconds: 5,
      displayLabel: '~5s',
    },
  ],
  networkUtilization: 55,
  pendingCount: 0,
  lastBlockGasUsed: BigInt(15000000),
  lastBlockGasLimit: BigInt(30000000),
  lastBlockNumber: 100,
  lastBlockTimestamp: 1700000000,
  updatedAt: new Date(),
}

const mockUseGasTracker = vi.fn(() => ({
  metrics: mockMetrics,
  history: [],
  loading: false,
  error: undefined,
  refetch: vi.fn(),
}))

vi.mock('@/lib/hooks/useGasTracker', () => ({
  useGasTracker: (...args: Parameters<typeof mockUseGasTracker>) => mockUseGasTracker(...args),
}))

// Mock UI components
vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-title" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
}))

// Mock format utility
vi.mock('@/lib/utils/format', () => ({
  formatCurrency: (value: bigint, symbol: string) => `${Number(value)} ${symbol}`,
}))

// Mock env config
vi.mock('@/lib/config/env', () => ({
  env: {
    currencySymbol: 'ETH',
  },
}))

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(' '),
}))

// Mock constants
vi.mock('@/lib/config/constants', () => ({
  THRESHOLDS: {
    NETWORK_UTILIZATION_HIGH: 80,
    NETWORK_UTILIZATION_MEDIUM: 50,
  },
  GAS: {
    DEFAULT_PRIORITY_FEE_FALLBACK: 3,
  },
  FORMATTING: {
    WEI_PER_GWEI: 1e9,
    DEFAULT_DECIMALS: 18,
  },
  BLOCKCHAIN: {
    ZERO_BIGINT: BigInt(0),
  },
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GasCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGasTracker.mockReturnValue({
      metrics: mockMetrics,
      history: [],
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    })
  })

  // =========================================================================
  // Rendering
  // =========================================================================

  describe('Rendering', () => {
    it('renders the gas calculator title', () => {
      render(<GasCalculator />)
      expect(screen.getByText('EIP-1559 GAS CALCULATOR')).toBeInTheDocument()
    })

    it('renders the estimate subtitle', () => {
      render(<GasCalculator />)
      expect(screen.getByText('ESTIMATE TRANSACTION COSTS')).toBeInTheDocument()
    })

    it('renders all four input fields', () => {
      render(<GasCalculator />)
      expect(screen.getByLabelText('Gas Limit')).toBeInTheDocument()
      expect(screen.getByLabelText('Base Fee Per Gas (Gwei)')).toBeInTheDocument()
      expect(screen.getByLabelText('Max Priority Fee Per Gas (Gwei)')).toBeInTheDocument()
      expect(screen.getByLabelText('Max Fee Per Gas (Gwei)')).toBeInTheDocument()
    })

    it('renders transaction type presets', () => {
      render(<GasCalculator />)
      expect(screen.getByText('TRANSACTION TYPE')).toBeInTheDocument()
      expect(screen.getByText('Transfer')).toBeInTheDocument()
      expect(screen.getByText('ERC20 Transfer')).toBeInTheDocument()
      expect(screen.getByText('DEX Swap')).toBeInTheDocument()
      expect(screen.getByText('NFT Mint')).toBeInTheDocument()
      expect(screen.getByText('Contract Deploy')).toBeInTheDocument()
      expect(screen.getByText('Custom')).toBeInTheDocument()
    })

    it('renders the calculated results section', () => {
      render(<GasCalculator />)
      expect(screen.getByText('CALCULATED RESULTS')).toBeInTheDocument()
    })

    it('renders all result labels', () => {
      render(<GasCalculator />)
      // "Effective Gas Price" appears in both results and formula, so use getAllByText
      expect(screen.getAllByText('Effective Gas Price').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Total Transaction Cost')).toBeInTheDocument()
      expect(screen.getByText('Max Possible Cost')).toBeInTheDocument()
      expect(screen.getByText('Potential Refund')).toBeInTheDocument()
      expect(screen.getByText('Priority Fee to Miner')).toBeInTheDocument()
    })

    it('renders the EIP-1559 formula section', () => {
      render(<GasCalculator />)
      expect(screen.getByText('EIP-1559 FORMULA')).toBeInTheDocument()
    })

    it('renders with default gas limit of 21000', () => {
      render(<GasCalculator />)
      const gasLimitInput = screen.getByLabelText('Gas Limit') as HTMLInputElement
      expect(gasLimitInput.value).toBe('21000')
    })

    it('renders with custom default values when provided', () => {
      render(
        <GasCalculator
          defaultGasLimit={100000}
          defaultBaseFee={30}
          defaultPriorityFee={5}
        />
      )
      const gasLimitInput = screen.getByLabelText('Gas Limit') as HTMLInputElement
      expect(gasLimitInput.value).toBe('100000')
    })

    it('applies custom className', () => {
      render(<GasCalculator className="custom-class" />)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })
  })

  // =========================================================================
  // User Interactions
  // =========================================================================

  describe('User Interactions', () => {
    it('can type in gas limit input', () => {
      render(<GasCalculator />)
      const gasLimitInput = screen.getByLabelText('Gas Limit') as HTMLInputElement
      fireEvent.change(gasLimitInput, { target: { value: '50000' } })
      expect(gasLimitInput.value).toBe('50000')
    })

    it('can type in base fee input', () => {
      render(<GasCalculator />)
      const baseFeeInput = screen.getByLabelText('Base Fee Per Gas (Gwei)') as HTMLInputElement
      fireEvent.change(baseFeeInput, { target: { value: '30' } })
      expect(baseFeeInput.value).toBe('30')
    })

    it('can type in priority fee input', () => {
      render(<GasCalculator />)
      const priorityFeeInput = screen.getByLabelText('Max Priority Fee Per Gas (Gwei)') as HTMLInputElement
      fireEvent.change(priorityFeeInput, { target: { value: '5' } })
      expect(priorityFeeInput.value).toBe('5')
    })

    it('can type in max fee input', () => {
      render(<GasCalculator />)
      const maxFeeInput = screen.getByLabelText('Max Fee Per Gas (Gwei)') as HTMLInputElement
      fireEvent.change(maxFeeInput, { target: { value: '50' } })
      expect(maxFeeInput.value).toBe('50')
    })

    it('selects transfer preset by default', () => {
      render(<GasCalculator />)
      // Transfer button should be highlighted (has accent-blue class via cn mock)
      const transferButton = screen.getByTitle('Simple native token transfer')
      expect(transferButton.className).toContain('accent-blue')
    })

    it('switches gas limit when selecting ERC20 Transfer preset', () => {
      render(<GasCalculator />)
      const erc20Button = screen.getByTitle('Token transfer')
      fireEvent.click(erc20Button)
      const gasLimitInput = screen.getByLabelText('Gas Limit') as HTMLInputElement
      expect(gasLimitInput.value).toBe('65000')
    })

    it('switches gas limit when selecting DEX Swap preset', () => {
      render(<GasCalculator />)
      const swapButton = screen.getByTitle('Decentralized exchange swap')
      fireEvent.click(swapButton)
      const gasLimitInput = screen.getByLabelText('Gas Limit') as HTMLInputElement
      expect(gasLimitInput.value).toBe('150000')
    })

    it('switches gas limit when selecting NFT Mint preset', () => {
      render(<GasCalculator />)
      const nftButton = screen.getByTitle('Mint NFT token')
      fireEvent.click(nftButton)
      const gasLimitInput = screen.getByLabelText('Gas Limit') as HTMLInputElement
      expect(gasLimitInput.value).toBe('120000')
    })

    it('switches gas limit when selecting Contract Deploy preset', () => {
      render(<GasCalculator />)
      const deployButton = screen.getByTitle('Deploy smart contract')
      fireEvent.click(deployButton)
      const gasLimitInput = screen.getByLabelText('Gas Limit') as HTMLInputElement
      expect(gasLimitInput.value).toBe('500000')
    })

    it('does not change gas limit when selecting Custom preset', () => {
      render(<GasCalculator />)
      // First change to a known value
      const gasLimitInput = screen.getByLabelText('Gas Limit') as HTMLInputElement
      fireEvent.change(gasLimitInput, { target: { value: '99999' } })
      // Then click custom preset
      const customButton = screen.getByTitle('Custom gas limit')
      fireEvent.click(customButton)
      expect(gasLimitInput.value).toBe('99999')
    })

    it('sets preset to custom when gas limit input is changed manually', () => {
      render(<GasCalculator />)
      const gasLimitInput = screen.getByLabelText('Gas Limit')
      fireEvent.change(gasLimitInput, { target: { value: '42000' } })
      // The description hint should show custom text
      expect(screen.getByText('Custom gas limit')).toBeInTheDocument()
    })

    it('updates max fee when base fee changes', () => {
      render(<GasCalculator />)
      const baseFeeInput = screen.getByLabelText('Base Fee Per Gas (Gwei)') as HTMLInputElement
      const maxFeeInput = screen.getByLabelText('Max Fee Per Gas (Gwei)') as HTMLInputElement

      // Default: base=25, priority=2, so max = 25+2+10 = 37
      const initialMax = Number(maxFeeInput.value)

      // Change base fee to 50
      fireEvent.change(baseFeeInput, { target: { value: '50' } })

      // Max fee should have updated: 50 + priority + 10
      const updatedMax = Number(maxFeeInput.value)
      expect(updatedMax).toBeGreaterThan(initialMax)
    })

    it('updates max fee when priority fee changes', () => {
      render(<GasCalculator />)
      const priorityFeeInput = screen.getByLabelText('Max Priority Fee Per Gas (Gwei)') as HTMLInputElement
      const maxFeeInput = screen.getByLabelText('Max Fee Per Gas (Gwei)') as HTMLInputElement

      const initialMax = Number(maxFeeInput.value)

      // Change priority fee to 10
      fireEvent.change(priorityFeeInput, { target: { value: '10' } })

      const updatedMax = Number(maxFeeInput.value)
      expect(updatedMax).toBeGreaterThan(initialMax)
    })
  })

  // =========================================================================
  // Calculations & Results
  // =========================================================================

  describe('Calculations', () => {
    it('displays effective gas price in results', () => {
      render(<GasCalculator />)
      // The ResultItem for effective gas price should be present with a Gwei value
      // Multiple elements may contain "Gwei" (input labels + result)
      expect(screen.getAllByText(/Gwei/).length).toBeGreaterThanOrEqual(1)
    })

    it('displays transaction cost results with currency symbol', () => {
      render(<GasCalculator />)
      // formatCurrency mock returns "{value} ETH"
      const ethValues = screen.getAllByText(/ETH/)
      expect(ethValues.length).toBeGreaterThanOrEqual(1)
    })

    it('shows savings percentage when max cost is positive', () => {
      render(<GasCalculator />)
      // The savings box should appear since default values produce maxCost > 0
      expect(screen.getByText(/SAVINGS:/)).toBeInTheDocument()
    })

    it('renders result descriptions', () => {
      render(<GasCalculator />)
      expect(screen.getByText('Actual gas price that will be paid')).toBeInTheDocument()
      expect(screen.getByText('Expected cost based on effective gas price')).toBeInTheDocument()
      expect(screen.getByText('Maximum cost if base fee rises to max fee')).toBeInTheDocument()
      expect(screen.getByText('Amount refunded if not all max fee is used')).toBeInTheDocument()
      expect(screen.getByText('Tip paid to miner for transaction inclusion')).toBeInTheDocument()
    })
  })

})

// ===========================================================================
// Network Status
// ===========================================================================

describe('GasCalculator – Network Status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGasTracker.mockReturnValue({
      metrics: mockMetrics,
      history: [],
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    })
  })

  it('shows LIVE indicator when metrics are available', () => {
    render(<GasCalculator />)
    expect(screen.getByText('LIVE')).toBeInTheDocument()
  })

  it('does not show LIVE indicator when no metrics', () => {
    mockUseGasTracker.mockReturnValue({
      metrics: null as unknown as typeof mockMetrics,
      history: [],
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    })
    render(<GasCalculator />)
    expect(screen.queryByText('LIVE')).not.toBeInTheDocument()
  })

  it('shows network priority fee suggestions when metrics available', () => {
    render(<GasCalculator />)
    expect(screen.getByText('Network Priority Fees (Gwei)')).toBeInTheDocument()
    expect(screen.getByText(/Economy:/)).toBeInTheDocument()
    expect(screen.getByText(/Standard:/)).toBeInTheDocument()
    expect(screen.getByText(/Priority:/)).toBeInTheDocument()
  })

  it('does not show network status section when no metrics', () => {
    mockUseGasTracker.mockReturnValue({
      metrics: null as unknown as typeof mockMetrics,
      history: [],
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    })
    render(<GasCalculator />)
    expect(screen.queryByText('Network Priority Fees (Gwei)')).not.toBeInTheDocument()
  })

  it('shows utilization percentage', () => {
    render(<GasCalculator />)
    expect(screen.getByText('55%')).toBeInTheDocument()
  })

  it('applies yellow color class for medium utilization', () => {
    render(<GasCalculator />)
    // networkUtilization is 55, which is > 50 (MEDIUM) but <= 80 (HIGH)
    const utilizationValue = screen.getByText('55%')
    expect(utilizationValue.className).toContain('accent-yellow')
  })

  it('applies green color class for low utilization', () => {
    mockUseGasTracker.mockReturnValue({
      metrics: { ...mockMetrics, networkUtilization: 30 },
      history: [],
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    })
    render(<GasCalculator />)
    const utilizationValue = screen.getByText('30%')
    expect(utilizationValue.className).toContain('accent-green')
  })

  it('applies red color class for high utilization', () => {
    mockUseGasTracker.mockReturnValue({
      metrics: { ...mockMetrics, networkUtilization: 90 },
      history: [],
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    })
    render(<GasCalculator />)
    const utilizationValue = screen.getByText('90%')
    expect(utilizationValue.className).toContain('accent-red')
  })

  it('clicking economy fee suggestion updates priority fee input', () => {
    render(<GasCalculator />)
    const economyButton = screen.getByText(/Economy:/)
    fireEvent.click(economyButton)
    const priorityFeeInput = screen.getByLabelText('Max Priority Fee Per Gas (Gwei)') as HTMLInputElement
    expect(Number(priorityFeeInput.value)).toBe(1)
  })

  it('clicking standard fee suggestion updates priority fee input', () => {
    render(<GasCalculator />)
    const standardButton = screen.getByText(/Standard:/)
    fireEvent.click(standardButton)
    const priorityFeeInput = screen.getByLabelText('Max Priority Fee Per Gas (Gwei)') as HTMLInputElement
    expect(Number(priorityFeeInput.value)).toBe(2)
  })

  it('clicking priority fee suggestion updates priority fee input', () => {
    render(<GasCalculator />)
    const priorityButton = screen.getByText(/Priority:/)
    fireEvent.click(priorityButton)
    const priorityFeeInput = screen.getByLabelText('Max Priority Fee Per Gas (Gwei)') as HTMLInputElement
    expect(Number(priorityFeeInput.value)).toBe(3)
  })
})

// ===========================================================================
// Edge Cases
// ===========================================================================

describe('GasCalculator – Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGasTracker.mockReturnValue({
      metrics: mockMetrics,
      history: [],
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    })
  })

  it('handles zero gas limit without crashing', () => {
    render(<GasCalculator />)
    const gasLimitInput = screen.getByLabelText('Gas Limit')
    fireEvent.change(gasLimitInput, { target: { value: '0' } })
    // Component should still render without errors
    expect(screen.getByText('EIP-1559 GAS CALCULATOR')).toBeInTheDocument()
  })

  it('handles zero base fee without crashing', () => {
    render(<GasCalculator />)
    const baseFeeInput = screen.getByLabelText('Base Fee Per Gas (Gwei)')
    fireEvent.change(baseFeeInput, { target: { value: '0' } })
    expect(screen.getByText('EIP-1559 GAS CALCULATOR')).toBeInTheDocument()
  })

  it('handles very large gas limit values', () => {
    render(<GasCalculator />)
    const gasLimitInput = screen.getByLabelText('Gas Limit')
    fireEvent.change(gasLimitInput, { target: { value: '30000000' } })
    expect(screen.getByText('EIP-1559 GAS CALCULATOR')).toBeInTheDocument()
  })

  it('handles zero priority fee without crashing', () => {
    render(<GasCalculator />)
    const priorityFeeInput = screen.getByLabelText('Max Priority Fee Per Gas (Gwei)')
    fireEvent.change(priorityFeeInput, { target: { value: '0' } })
    expect(screen.getByText('EIP-1559 GAS CALCULATOR')).toBeInTheDocument()
  })

  it('renders without crashing when metrics have empty priceLevels', () => {
    mockUseGasTracker.mockReturnValue({
      metrics: { ...mockMetrics, priceLevels: [] },
      history: [],
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    })
    render(<GasCalculator />)
    expect(screen.getByText('EIP-1559 GAS CALCULATOR')).toBeInTheDocument()
  })

  it('calls useGasTracker with correct options', () => {
    render(<GasCalculator />)
    expect(mockUseGasTracker).toHaveBeenCalledWith({
      blockCount: 10,
      enableSubscription: true,
    })
  })

  it('renders all six preset buttons', () => {
    render(<GasCalculator />)
    const presetButtons = [
      'Simple native token transfer',
      'Token transfer',
      'Decentralized exchange swap',
      'Mint NFT token',
      'Deploy smart contract',
      'Custom gas limit',
    ]
    for (const title of presetButtons) {
      expect(screen.getByTitle(title)).toBeInTheDocument()
    }
  })

  it('renders formula explanations correctly', () => {
    render(<GasCalculator />)
    // "Effective Gas Price" appears in both results and formula sections
    const effectiveLabels = screen.getAllByText('Effective Gas Price')
    expect(effectiveLabels.length).toBeGreaterThanOrEqual(2) // one in results, one in formula
    expect(screen.getByText(/min\(Max Fee Per Gas, Base Fee \+ Priority Fee\)/)).toBeInTheDocument()
    expect(screen.getByText(/Gas Limit × Effective Gas Price/)).toBeInTheDocument()
    expect(screen.getByText(/\(Max Fee - Effective Gas Price\) × Gas Limit/)).toBeInTheDocument()
  })
})
