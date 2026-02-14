import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionSimulator } from './TransactionSimulator'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}))

vi.mock('@/lib/utils/gas', () => ({
  calculateEffectiveGasPrice: (baseFee: bigint, maxFee: bigint, priorityFee: bigint) => {
    const actual = baseFee + priorityFee
    return actual < maxFee ? actual : maxFee
  },
  calculateTxCost: (gasUsed: bigint, gasPrice: bigint) => gasUsed * gasPrice,
  gweiToWei: (gwei: number) => BigInt(Math.floor(gwei * 1e9)),
  weiToGwei: (wei: bigint) => Number(wei) / 1e9,
}))

vi.mock('@/lib/utils/format', () => ({
  formatCurrency: (value: bigint | string, symbol: string) => `${Number(value)} ${symbol}`,
}))

vi.mock('@/lib/config/env', () => ({
  env: { currencySymbol: 'WKRC' },
}))

vi.mock('@/lib/config/constants', () => ({
  GAS: {
    GAS_LIMIT_TRANSFER: 21000,
    GAS_LIMIT_CONTRACT: 100000,
    GAS_LIMIT_TOKEN: 65000,
    GAS_LIMIT_NFT: 150000,
    BASE_FEE_LOW: 15,
    BASE_FEE_MEDIUM: 25,
    BASE_FEE_HIGH: 50,
    BASE_FEE_EXTREME: 100,
    MAX_GAS_PRICE: 35,
    PRIORITY_FEE_LOW_THRESHOLD: 1,
    PRIORITY_FEE_STANDARD_THRESHOLD: 2,
    PRIORITY_FEE_HIGH_THRESHOLD: 5,
    SUCCESS_PROB_LOW_PRIORITY: 60,
    SUCCESS_PROB_STANDARD_PRIORITY: 75,
    SUCCESS_PROB_HIGH_PRIORITY: 90,
    SUCCESS_PROB_VERY_HIGH_PRIORITY: 98,
    PROB_ADJUSTMENT_EXTREME: 20,
    PROB_ADJUSTMENT_HIGH: 10,
    PROB_MIN_EXTREME: 50,
    PROB_MIN_HIGH: 60,
    MAX_FEE_OFFSET: 10,
  },
  THRESHOLDS: {
    HEALTH_EXCELLENT: 90,
    HEALTH_GOOD: 75,
    HEALTH_FAIR: 60,
    CHART_OPACITY: 0.6,
  },
  FORMATTING: {
    WEI_PER_GWEI: 1e9,
    DEFAULT_DECIMALS: 18,
  },
}))

// ---------------------------------------------------------------------------
// Tests - Rendering
// ---------------------------------------------------------------------------

describe('TransactionSimulator - Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the simulator title', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('TRANSACTION SIMULATOR')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('ESTIMATE COSTS & TIMING')).toBeInTheDocument()
  })

  it('renders the CONFIGURATION section header', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('CONFIGURATION')).toBeInTheDocument()
  })

  it('renders the SIMULATION RESULTS section header', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('SIMULATION RESULTS')).toBeInTheDocument()
  })

  it('renders the COST BREAKDOWN section header', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('COST BREAKDOWN')).toBeInTheDocument()
  })

  it('renders all four transaction type buttons', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('Transfer')).toBeInTheDocument()
    expect(screen.getByText('Contract')).toBeInTheDocument()
    expect(screen.getByText('Token')).toBeInTheDocument()
    expect(screen.getByText('NFT')).toBeInTheDocument()
  })

  it('renders all four network condition buttons', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('Low Activity')).toBeInTheDocument()
    expect(screen.getByText('Medium Activity')).toBeInTheDocument()
    expect(screen.getByText('High Activity')).toBeInTheDocument()
    expect(screen.getByText('Extreme Congestion')).toBeInTheDocument()
  })

  it('renders GAS PARAMETERS section', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('GAS PARAMETERS')).toBeInTheDocument()
  })

  it('renders priority fee input', () => {
    render(<TransactionSimulator />)
    const input = screen.getByLabelText('Priority Fee (Gwei)') as HTMLInputElement
    expect(input).toBeInTheDocument()
  })

  it('renders max fee input', () => {
    render(<TransactionSimulator />)
    const input = screen.getByLabelText('Max Fee (Gwei)') as HTMLInputElement
    expect(input).toBeInTheDocument()
  })

  it('applies custom className to the card', () => {
    render(<TransactionSimulator className="test-class" />)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('test-class')
  })
})

// ---------------------------------------------------------------------------
// Tests - Default State
// ---------------------------------------------------------------------------

describe('TransactionSimulator - Default State', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('defaults to transfer transaction type (pressed state)', () => {
    render(<TransactionSimulator />)
    const transferBtn = screen.getByRole('button', { name: /Select Transfer transaction type/ })
    expect(transferBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('defaults to medium network condition (pressed state)', () => {
    render(<TransactionSimulator />)
    const mediumBtn = screen.getByRole('button', { name: /Select Medium Activity network condition/ })
    expect(mediumBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows transfer gas limit (21,000) in cost breakdown', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('21,000')).toBeInTheDocument()
  })

  it('shows default priority fee of 2 in the input', () => {
    render(<TransactionSimulator />)
    const input = screen.getByLabelText('Priority Fee (Gwei)') as HTMLInputElement
    expect(input.value).toBe('2')
  })

  it('shows default base fee of 25.00 in cost breakdown', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('25.00 Gwei')).toBeInTheDocument()
  })

  it('shows network base fees next to each condition button', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('~15 Gwei')).toBeInTheDocument()
    expect(screen.getByText('~25 Gwei')).toBeInTheDocument()
    expect(screen.getByText('~50 Gwei')).toBeInTheDocument()
    expect(screen.getByText('~100 Gwei')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests - Transaction Type Selection
// ---------------------------------------------------------------------------

describe('TransactionSimulator - Transaction Type Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('selects contract type and updates gas limit', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const contractBtn = screen.getByRole('button', { name: /Select Contract transaction type/ })
    await user.click(contractBtn)
    expect(contractBtn).toHaveAttribute('aria-pressed', 'true')
    // Gas limit in breakdown should show 100,000
    expect(screen.getByText('100,000')).toBeInTheDocument()
  })

  it('selects token type and updates gas limit', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const tokenBtn = screen.getByRole('button', { name: /Select Token transaction type/ })
    await user.click(tokenBtn)
    expect(tokenBtn).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('65,000')).toBeInTheDocument()
  })

  it('selects NFT type and updates gas limit', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const nftBtn = screen.getByRole('button', { name: /Select NFT transaction type/ })
    await user.click(nftBtn)
    expect(nftBtn).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('150,000')).toBeInTheDocument()
  })

  it('un-presses transfer when contract is selected', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const transferBtn = screen.getByRole('button', { name: /Select Transfer transaction type/ })
    const contractBtn = screen.getByRole('button', { name: /Select Contract transaction type/ })
    await user.click(contractBtn)
    expect(transferBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows gas amount for each transaction type button', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('21,000 gas')).toBeInTheDocument()
    expect(screen.getByText('100,000 gas')).toBeInTheDocument()
    expect(screen.getByText('65,000 gas')).toBeInTheDocument()
    expect(screen.getByText('150,000 gas')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests - Network Condition Selection
// ---------------------------------------------------------------------------

describe('TransactionSimulator - Network Condition Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('selects low activity and updates base fee', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const lowBtn = screen.getByRole('button', { name: /Select Low Activity network condition/ })
    await user.click(lowBtn)
    expect(lowBtn).toHaveAttribute('aria-pressed', 'true')
    // Base fee in cost breakdown should update to 15.00 Gwei
    expect(screen.getByText('15.00 Gwei')).toBeInTheDocument()
  })

  it('selects high activity and updates base fee', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const highBtn = screen.getByRole('button', { name: /Select High Activity network condition/ })
    await user.click(highBtn)
    expect(highBtn).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('50.00 Gwei')).toBeInTheDocument()
  })

  it('selects extreme congestion and updates base fee', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const extremeBtn = screen.getByRole('button', {
      name: /Select Extreme Congestion network condition/,
    })
    await user.click(extremeBtn)
    expect(extremeBtn).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('100.00 Gwei')).toBeInTheDocument()
  })

  it('un-presses medium when low is selected', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const mediumBtn = screen.getByRole('button', { name: /Select Medium Activity network condition/ })
    const lowBtn = screen.getByRole('button', { name: /Select Low Activity network condition/ })
    await user.click(lowBtn)
    expect(mediumBtn).toHaveAttribute('aria-pressed', 'false')
  })
})

// ---------------------------------------------------------------------------
// Tests - Gas Parameter Inputs
// ---------------------------------------------------------------------------

describe('TransactionSimulator - Gas Parameter Inputs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates priority fee when user types', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const input = screen.getByLabelText('Priority Fee (Gwei)') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '10')
    expect(input.value).toBe('10')
  })

  it('updates max fee when user types', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const input = screen.getByLabelText('Max Fee (Gwei)') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '100')
    expect(input.value).toBe('100')
  })

  it('recalculates cost when priority fee changes', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)

    const initialCostTexts = screen.getAllByText(/WKRC/).map((el) => el.textContent)

    const input = screen.getByLabelText('Priority Fee (Gwei)') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '20')

    const updatedCostTexts = screen.getAllByText(/WKRC/).map((el) => el.textContent)
    expect(updatedCostTexts).not.toEqual(initialCostTexts)
  })

  it('recalculates cost when max fee changes', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)

    const initialCostTexts = screen.getAllByText(/WKRC/).map((el) => el.textContent)

    // Set maxFee lower than baseFee+priorityFee (25+2=27) so effective price changes
    const input = screen.getByLabelText('Max Fee (Gwei)') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '20')

    const updatedCostTexts = screen.getAllByText(/WKRC/).map((el) => el.textContent)
    expect(updatedCostTexts).not.toEqual(initialCostTexts)
  })
})

// ---------------------------------------------------------------------------
// Tests - Simulation Results
// ---------------------------------------------------------------------------

describe('TransactionSimulator - Simulation Results', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows Estimated Cost section', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('Estimated Cost')).toBeInTheDocument()
  })

  it('shows cost formatted with WKRC', () => {
    render(<TransactionSimulator />)
    const wkrcElements = screen.getAllByText(/WKRC/)
    expect(wkrcElements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows effective gas price in Gwei', () => {
    render(<TransactionSimulator />)
    // Result shows "{weiToGwei(effectiveGasPrice).toFixed(2)} Gwei effective gas price"
    expect(screen.getByText(/effective gas price/)).toBeInTheDocument()
  })

  it('shows Estimated Confirmation section', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('Estimated Confirmation')).toBeInTheDocument()
  })

  it('shows confirmation time estimate for default settings', () => {
    render(<TransactionSimulator />)
    // Default priority fee = 2 (PRIORITY_FEE_STANDARD_THRESHOLD), so >= standard
    // priorityFeeGwei < PRIORITY_FEE_HIGH_THRESHOLD (5), so it is "30-120 seconds"
    expect(screen.getByText('30-120 seconds')).toBeInTheDocument()
  })

  it('shows based on current network conditions note', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('Based on current network conditions')).toBeInTheDocument()
  })

  it('shows Success Probability section', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('Success Probability')).toBeInTheDocument()
  })

  it('shows success probability percentage', () => {
    render(<TransactionSimulator />)
    // Default: priorityFee=2 >= STANDARD(2) and < HIGH(5) => 90%
    // medium network: no adjustment
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('shows RECOMMENDATION section', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('RECOMMENDATION')).toBeInTheDocument()
  })

  it('shows recommendation text for default settings', () => {
    render(<TransactionSimulator />)
    // Default: priorityFee=2 is >= STANDARD(2) and < HIGH(5)
    expect(
      screen.getByText('High priority - good for time-sensitive transactions')
    ).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests - Network-Adjusted Results
// ---------------------------------------------------------------------------

describe('TransactionSimulator - Network Adjustments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reduces success probability for extreme congestion', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)

    const extremeBtn = screen.getByRole('button', {
      name: /Select Extreme Congestion network condition/,
    })
    await user.click(extremeBtn)

    // Default priority=2 => base prob 90%, extreme adjustment -20 => 70%
    expect(screen.getByText('70%')).toBeInTheDocument()
  })

  it('appends stabilize message for extreme congestion', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)

    const extremeBtn = screen.getByRole('button', {
      name: /Select Extreme Congestion network condition/,
    })
    await user.click(extremeBtn)

    expect(screen.getByText(/Consider waiting for network to stabilize/)).toBeInTheDocument()
  })

  it('reduces success probability for high activity', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)

    const highBtn = screen.getByRole('button', { name: /Select High Activity network condition/ })
    await user.click(highBtn)

    // Default priority=2 => base prob 90%, high adjustment -10 => 80%
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('does not adjust probability for low activity', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)

    const lowBtn = screen.getByRole('button', { name: /Select Low Activity network condition/ })
    await user.click(lowBtn)

    // Default priority=2 => base prob 90%, no adjustment for low
    expect(screen.getByText('90%')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests - Cost Breakdown
// ---------------------------------------------------------------------------

describe('TransactionSimulator - Cost Breakdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows Gas Limit label and value', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('Gas Limit:')).toBeInTheDocument()
    expect(screen.getByText('21,000')).toBeInTheDocument()
  })

  it('shows Base Fee label and value', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('Base Fee:')).toBeInTheDocument()
    expect(screen.getByText('25.00 Gwei')).toBeInTheDocument()
  })

  it('shows Priority Fee label and value', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('Priority Fee:')).toBeInTheDocument()
    expect(screen.getByText('2.00 Gwei')).toBeInTheDocument()
  })

  it('shows Effective Price label', () => {
    render(<TransactionSimulator />)
    expect(screen.getByText('Effective Price:')).toBeInTheDocument()
  })

  it('updates gas limit in breakdown when transaction type changes', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)

    expect(screen.getByText('21,000')).toBeInTheDocument()

    const nftBtn = screen.getByRole('button', { name: /Select NFT transaction type/ })
    await user.click(nftBtn)

    expect(screen.getByText('150,000')).toBeInTheDocument()
    expect(screen.queryByText('21,000')).not.toBeInTheDocument()
  })

  it('updates base fee in breakdown when network changes', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)

    expect(screen.getByText('25.00 Gwei')).toBeInTheDocument()

    const lowBtn = screen.getByRole('button', { name: /Select Low Activity network condition/ })
    await user.click(lowBtn)

    expect(screen.getByText('15.00 Gwei')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests - Edge Cases
// ---------------------------------------------------------------------------

describe('TransactionSimulator - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles zero priority fee without crashing', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const input = screen.getByLabelText('Priority Fee (Gwei)') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '0')
    expect(screen.getByText('TRANSACTION SIMULATOR')).toBeInTheDocument()
  })

  it('handles zero max fee without crashing', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const input = screen.getByLabelText('Max Fee (Gwei)') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '0')
    expect(screen.getByText('TRANSACTION SIMULATOR')).toBeInTheDocument()
  })

  it('handles very large priority fee values', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const input = screen.getByLabelText('Priority Fee (Gwei)') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '1000')
    expect(screen.getByText('TRANSACTION SIMULATOR')).toBeInTheDocument()
    // Very high priority fee => "< 30 seconds" and 98% prob
    expect(screen.getByText('< 30 seconds')).toBeInTheDocument()
  })

  it('renders without className prop', () => {
    render(<TransactionSimulator />)
    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
  })

  it('shows low priority confirmation time for very low priority fee', async () => {
    const user = userEvent.setup()
    render(<TransactionSimulator />)
    const input = screen.getByLabelText('Priority Fee (Gwei)') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '0.5')
    // priorityFee 0.5 < LOW_THRESHOLD(1) => "5-10 minutes"
    expect(screen.getByText('5-10 minutes')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
  })
})
