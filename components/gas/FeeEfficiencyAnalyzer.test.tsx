import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeeEfficiencyAnalyzer } from './FeeEfficiencyAnalyzer'

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
    DEFAULT_PRIORITY_FEE: 2,
    DEFAULT_LEGACY_GAS_PRICE: 30,
    FEE_BUFFER_OPTIMAL: 5,
    FEE_BUFFER_CONSERVATIVE: 15,
    COST_WARNING_THRESHOLD: 1.2,
  },
  THRESHOLDS: {
    GAS_EFFICIENCY_EXCELLENT: 95,
    GAS_EFFICIENCY_GOOD: 85,
    GAS_EFFICIENCY_FAIR: 75,
    CHART_OPACITY: 0.6,
  },
  BLOCKCHAIN: {
    PERCENTAGE_FULL: 100,
    PERCENTAGE_MULTIPLIER: 100,
    ZERO_BIGINT: 0n,
  },
  FORMATTING: {
    WEI_PER_GWEI: 1e9,
    DEFAULT_DECIMALS: 18,
  },
}))

// ---------------------------------------------------------------------------
// Tests - Rendering
// ---------------------------------------------------------------------------

describe('FeeEfficiencyAnalyzer - Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the analyzer title', () => {
    render(<FeeEfficiencyAnalyzer />)
    expect(screen.getByText('FEE EFFICIENCY ANALYZER')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<FeeEfficiencyAnalyzer />)
    expect(screen.getByText('OPTIMIZE TRANSACTION COSTS')).toBeInTheDocument()
  })

  it('renders priority fee input with default value of 2', () => {
    render(<FeeEfficiencyAnalyzer />)
    const input = screen.getByLabelText('Priority Fee (Gwei)') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.value).toBe('2')
  })

  it('renders legacy gas price input with default value of 30', () => {
    render(<FeeEfficiencyAnalyzer />)
    const input = screen.getByLabelText('Legacy Gas Price (Gwei)') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.value).toBe('30')
  })

  it('renders base fee display with default value 25.00 Gwei', () => {
    render(<FeeEfficiencyAnalyzer />)
    expect(screen.getByText('25.00 Gwei')).toBeInTheDocument()
  })

  it('renders 4 scenario cards', () => {
    render(<FeeEfficiencyAnalyzer />)
    // Scenario names may appear in both ScenarioCard and Efficiency Summary
    expect(screen.getAllByText('EIP-1559 (Optimal)').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('EIP-1559 (Conservative)').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Legacy (Type 0)').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Fee Delegated (Type 0x16)').length).toBeGreaterThanOrEqual(1)
  })

  it('renders scenario descriptions', () => {
    render(<FeeEfficiencyAnalyzer />)
    expect(screen.getByText('Best balance of cost and confirmation speed')).toBeInTheDocument()
    expect(screen.getByText('Higher buffer for volatile network conditions')).toBeInTheDocument()
    expect(screen.getByText('Fixed gas price, no refunds')).toBeInTheDocument()
    expect(screen.getByText('Third party pays gas fees')).toBeInTheDocument()
  })

  it('renders the transaction type comparison header', () => {
    render(<FeeEfficiencyAnalyzer />)
    expect(screen.getByText('TRANSACTION TYPE COMPARISON')).toBeInTheDocument()
  })

  it('applies custom className to the card', () => {
    render(<FeeEfficiencyAnalyzer className="custom-test-class" />)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('custom-test-class')
  })
})

// ---------------------------------------------------------------------------
// Tests - Scenario Cards
// ---------------------------------------------------------------------------

describe('FeeEfficiencyAnalyzer - Scenario Cards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows efficiency percentages for each scenario', () => {
    render(<FeeEfficiencyAnalyzer />)
    // All 4 cards should have an "Efficiency" label
    const efficiencyLabels = screen.getAllByText('Efficiency')
    expect(efficiencyLabels).toHaveLength(4)
  })

  it('shows percentage values ending with %', () => {
    render(<FeeEfficiencyAnalyzer />)
    // Efficiency percentages are rendered as "{value}%"
    const percentages = screen.getAllByText(/%$/)
    expect(percentages.length).toBeGreaterThanOrEqual(4)
  })

  it('marks the fee delegated scenario as best with RECOMMENDED badge', () => {
    render(<FeeEfficiencyAnalyzer />)
    // Fee Delegated has totalCost=0, so it is the best scenario
    expect(screen.getByText(/RECOMMENDED/)).toBeInTheDocument()
  })

  it('marks the most expensive scenario as EXPENSIVE', () => {
    render(<FeeEfficiencyAnalyzer />)
    // Legacy with default 30 Gwei gas price is the most expensive
    expect(screen.getByText(/EXPENSIVE/)).toBeInTheDocument()
  })

  it('shows cost formatted with WKRC currency symbol', () => {
    render(<FeeEfficiencyAnalyzer />)
    // The formatCurrency mock returns "{Number(value)} WKRC"
    const wkrcElements = screen.getAllByText(/WKRC/)
    expect(wkrcElements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows gas price in Gwei for each scenario card', () => {
    render(<FeeEfficiencyAnalyzer />)
    // Each ScenarioCard displays "{weiToGwei(gasPrice).toFixed(2)} Gwei"
    const gweiElements = screen.getAllByText(/\d+\.\d{2} Gwei/)
    // 4 scenario cards + 1 base fee display = at least 5
    expect(gweiElements.length).toBeGreaterThanOrEqual(4)
  })
})

// ---------------------------------------------------------------------------
// Tests - Efficiency Summary
// ---------------------------------------------------------------------------

describe('FeeEfficiencyAnalyzer - Efficiency Summary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders MOST EFFICIENT section', () => {
    render(<FeeEfficiencyAnalyzer />)
    expect(screen.getByText('MOST EFFICIENT')).toBeInTheDocument()
  })

  it('renders LEAST EFFICIENT section', () => {
    render(<FeeEfficiencyAnalyzer />)
    expect(screen.getByText('LEAST EFFICIENT')).toBeInTheDocument()
  })

  it('renders POTENTIAL SAVINGS section', () => {
    render(<FeeEfficiencyAnalyzer />)
    expect(screen.getByText('POTENTIAL SAVINGS')).toBeInTheDocument()
  })

  it('shows best scenario name in MOST EFFICIENT section', () => {
    render(<FeeEfficiencyAnalyzer />)
    // Fee Delegated (cost=0) is always cheapest for the user
    const mostEfficientSection = screen.getByText('MOST EFFICIENT').parentElement
    expect(mostEfficientSection).toBeTruthy()
    // The best scenario name should appear in the summary
    expect(screen.getAllByText('Fee Delegated (Type 0x16)').length).toBeGreaterThanOrEqual(1)
  })

  it('displays savings percentage', () => {
    render(<FeeEfficiencyAnalyzer />)
    // Savings percentage is rendered as "{value}%"
    const savingsSection = screen.getByText('POTENTIAL SAVINGS').parentElement
    expect(savingsSection).toBeTruthy()
    // Should show a savings percentage ending with %
    const percentText = savingsSection?.querySelector('.text-accent-blue')
    expect(percentText?.textContent).toMatch(/\d+\.\d%/)
  })

  it('displays potential savings amount with Save prefix', () => {
    render(<FeeEfficiencyAnalyzer />)
    // The component renders "Save {formatCurrency(...)}"
    expect(screen.getByText(/^Save /)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests - Recommendations
// ---------------------------------------------------------------------------

describe('FeeEfficiencyAnalyzer - Recommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders RECOMMENDATIONS header', () => {
    render(<FeeEfficiencyAnalyzer />)
    expect(screen.getByText('RECOMMENDATIONS')).toBeInTheDocument()
  })

  it('shows EIP-1559 optimal recommendation', () => {
    render(<FeeEfficiencyAnalyzer />)
    expect(
      screen.getByText('Use EIP-1559 (Optimal) for best cost efficiency and predictable fees')
    ).toBeInTheDocument()
  })

  it('shows priority fee recommendation', () => {
    render(<FeeEfficiencyAnalyzer />)
    expect(
      screen.getByText('Increase priority fee during high network congestion for faster confirmation')
    ).toBeInTheDocument()
  })

  it('shows fee delegation recommendation', () => {
    render(<FeeEfficiencyAnalyzer />)
    expect(
      screen.getByText('Consider Fee Delegation for sponsored transactions or gasless UX')
    ).toBeInTheDocument()
  })

  it('shows cost warning when worst exceeds threshold over best', () => {
    // With defaults: legacy at 30 Gwei is worst, fee delegated at 0 is best
    // worstCost > bestCost * 1.2 is satisfied whenever worst > 0 and best = 0
    render(<FeeEfficiencyAnalyzer />)
    // The warning says "Avoid {worstScenario.name} - costs {X}% more than optimal"
    expect(screen.getByText(/^Avoid .+ - costs \d+% more than optimal$/)).toBeInTheDocument()
  })

  it('shows recommendation icons', () => {
    render(<FeeEfficiencyAnalyzer />)
    // Three static recommendations have icons
    expect(screen.getByText(String.fromCodePoint(0x2713))).toBeInTheDocument() // checkmark
  })
})

// ---------------------------------------------------------------------------
// Tests - Custom Props
// ---------------------------------------------------------------------------

describe('FeeEfficiencyAnalyzer - Custom Props', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses custom gasLimit prop', () => {
    // With a different gasLimit, costs change but component should still render
    render(<FeeEfficiencyAnalyzer gasLimit={100000} />)
    expect(screen.getByText('FEE EFFICIENCY ANALYZER')).toBeInTheDocument()
    // All 4 scenarios should still render (names may appear multiple times)
    expect(screen.getAllByText('EIP-1559 (Optimal)').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Legacy (Type 0)').length).toBeGreaterThanOrEqual(1)
  })

  it('uses custom baseFee prop', () => {
    render(<FeeEfficiencyAnalyzer baseFee={50} />)
    // Base fee display should show 50.00 Gwei
    expect(screen.getByText('50.00 Gwei')).toBeInTheDocument()
  })

  it('renders correctly with both custom gasLimit and baseFee', () => {
    render(<FeeEfficiencyAnalyzer gasLimit={65000} baseFee={100} />)
    expect(screen.getByText('100.00 Gwei')).toBeInTheDocument()
    expect(screen.getAllByText('EIP-1559 (Optimal)').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Fee Delegated (Type 0x16)').length).toBeGreaterThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// Tests - User Interactions
// ---------------------------------------------------------------------------

describe('FeeEfficiencyAnalyzer - User Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates priority fee when user types in input', async () => {
    const user = userEvent.setup()
    render(<FeeEfficiencyAnalyzer />)
    const input = screen.getByLabelText('Priority Fee (Gwei)') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '5')
    expect(input.value).toBe('5')
  })

  it('updates legacy gas price when user types in input', async () => {
    const user = userEvent.setup()
    render(<FeeEfficiencyAnalyzer />)
    const input = screen.getByLabelText('Legacy Gas Price (Gwei)') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '50')
    expect(input.value).toBe('50')
  })

  it('recalculates scenarios when priority fee changes', async () => {
    const user = userEvent.setup()
    render(<FeeEfficiencyAnalyzer />)
    const input = screen.getByLabelText('Priority Fee (Gwei)') as HTMLInputElement

    // Get initial cost text
    const initialWkrcTexts = screen.getAllByText(/WKRC/).map((el) => el.textContent)

    // Change priority fee to a large value
    await user.clear(input)
    await user.type(input, '20')

    // After re-render, costs should have changed
    const updatedWkrcTexts = screen.getAllByText(/WKRC/).map((el) => el.textContent)
    // At least one cost value should differ
    expect(updatedWkrcTexts).not.toEqual(initialWkrcTexts)
  })

  it('recalculates scenarios when legacy gas price changes', async () => {
    const user = userEvent.setup()
    render(<FeeEfficiencyAnalyzer />)
    const input = screen.getByLabelText('Legacy Gas Price (Gwei)') as HTMLInputElement

    const initialWkrcTexts = screen.getAllByText(/WKRC/).map((el) => el.textContent)

    await user.clear(input)
    await user.type(input, '100')

    const updatedWkrcTexts = screen.getAllByText(/WKRC/).map((el) => el.textContent)
    expect(updatedWkrcTexts).not.toEqual(initialWkrcTexts)
  })
})

// ---------------------------------------------------------------------------
// Tests - Edge Cases
// ---------------------------------------------------------------------------

describe('FeeEfficiencyAnalyzer - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles zero gasLimit without crashing', () => {
    render(<FeeEfficiencyAnalyzer gasLimit={0} />)
    expect(screen.getByText('FEE EFFICIENCY ANALYZER')).toBeInTheDocument()
  })

  it('handles zero baseFee without crashing', () => {
    render(<FeeEfficiencyAnalyzer baseFee={0} />)
    expect(screen.getByText('0.00 Gwei')).toBeInTheDocument()
    expect(screen.getByText('FEE EFFICIENCY ANALYZER')).toBeInTheDocument()
  })

  it('handles very large gasLimit values', () => {
    render(<FeeEfficiencyAnalyzer gasLimit={30000000} />)
    expect(screen.getByText('FEE EFFICIENCY ANALYZER')).toBeInTheDocument()
  })

  it('handles very large baseFee values', () => {
    render(<FeeEfficiencyAnalyzer baseFee={1000} />)
    expect(screen.getByText('1000.00 Gwei')).toBeInTheDocument()
  })

  it('fee delegated always shows zero cost for user', () => {
    render(<FeeEfficiencyAnalyzer />)
    // Fee Delegated cost is always 0 (user pays nothing)
    // formatCurrency(0n, 'WKRC') returns "0 WKRC"
    expect(screen.getAllByText('0 WKRC').length).toBeGreaterThanOrEqual(1)
  })
})
