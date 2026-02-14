import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ValidatorHeatmap } from './ValidatorHeatmap'

// --- Mocks ---

const mockUseAllValidatorStats = vi.fn()

vi.mock('@/lib/hooks/useConsensus', () => ({
  useAllValidatorStats: (...args: unknown[]) => mockUseAllValidatorStats(...args),
}))

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-title">{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
}))

vi.mock('@/components/common/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}))

vi.mock('@/lib/utils/format', () => ({
  truncateAddress: (addr: string) =>
    addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr,
}))

vi.mock('@/lib/config/constants', () => ({
  THRESHOLDS: {
    PROPOSAL_RATE_EXCELLENT: 5,
    PROPOSAL_RATE_GOOD: 2,
    PROPOSAL_RATE_FAIR: 0.5,
    PARTICIPATION_MINIMUM: 67,
    PARTICIPATION_FALLBACK: 50,
    RANK_BRONZE: 3,
  },
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('@/lib/utils/consensus', () => ({
  getParticipationRateColor: () => ({ bg: 'bg-accent-green', text: 'text-white' }),
}))

// --- Helpers ---

function makeValidator(overrides: Partial<{
  address: string
  preparesSigned: string | number
  preparesMissed: string | number
  commitsSigned: string | number
  commitsMissed: string | number
  blocksProposed: string | number
  totalBlocks: string | number
  participationRate: number
}> = {}) {
  return {
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    preparesSigned: '95',
    preparesMissed: '5',
    commitsSigned: '90',
    commitsMissed: '10',
    blocksProposed: '3',
    totalBlocks: '100',
    participationRate: 95.0,
    ...overrides,
  }
}

// --- Tests ---

describe('ValidatorHeatmap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---- Loading state ----
  describe('loading state', () => {
    it('shows LoadingSpinner when loading is true', () => {
      mockUseAllValidatorStats.mockReturnValue({
        stats: [],
        loading: true,
        error: null,
      })

      render(<ValidatorHeatmap />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('shows "VALIDATOR HEATMAP" title during loading', () => {
      mockUseAllValidatorStats.mockReturnValue({
        stats: [],
        loading: true,
        error: null,
      })

      render(<ValidatorHeatmap />)

      expect(screen.getByText('VALIDATOR HEATMAP')).toBeInTheDocument()
    })
  })

  // ---- Error state ----
  describe('error state', () => {
    it('shows "Failed to load data" when error is truthy', () => {
      mockUseAllValidatorStats.mockReturnValue({
        stats: [],
        loading: false,
        error: 'Something went wrong',
      })

      render(<ValidatorHeatmap />)

      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })
  })

  // ---- Empty state ----
  describe('empty state', () => {
    it('shows "No validator data available" when stats is empty array', () => {
      mockUseAllValidatorStats.mockReturnValue({
        stats: [],
        loading: false,
        error: null,
      })

      render(<ValidatorHeatmap />)

      expect(screen.getByText('No validator data available')).toBeInTheDocument()
    })
  })

  // ---- Data rendering ----
  describe('data rendering', () => {
    const validatorA = makeValidator({
      address: '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      participationRate: 95.0,
      preparesSigned: '95',
      preparesMissed: '5',
      commitsSigned: '90',
      commitsMissed: '10',
      blocksProposed: '3',
      totalBlocks: '100',
    })

    const validatorB = makeValidator({
      address: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      participationRate: 80.0,
      preparesSigned: '80',
      preparesMissed: '20',
      commitsSigned: '75',
      commitsMissed: '25',
      blocksProposed: '1',
      totalBlocks: '100',
    })

    beforeEach(() => {
      mockUseAllValidatorStats.mockReturnValue({
        stats: [validatorA, validatorB],
        loading: false,
        error: null,
      })
    })

    it('shows "VALIDATOR PARTICIPATION HEATMAP" title with data', () => {
      render(<ValidatorHeatmap />)

      expect(screen.getByText('VALIDATOR PARTICIPATION HEATMAP')).toBeInTheDocument()
    })

    it('shows column headers: Validator, Prepare, Commit, Proposed, Overall', () => {
      render(<ValidatorHeatmap />)

      expect(screen.getByText('Validator')).toBeInTheDocument()
      expect(screen.getByText('Prepare')).toBeInTheDocument()
      expect(screen.getByText('Commit')).toBeInTheDocument()
      expect(screen.getByText('Proposed')).toBeInTheDocument()
      expect(screen.getByText('Overall')).toBeInTheDocument()
    })

    it('renders correct number of rows matching stats length', () => {
      render(<ValidatorHeatmap />)

      // Each row has a truncated address; we have 2 validators
      const addressA = '0xAAAA...AAAA'
      const addressB = '0xBBBB...BBBB'
      expect(screen.getByText(addressA)).toBeInTheDocument()
      expect(screen.getByText(addressB)).toBeInTheDocument()
    })

    it('shows truncated addresses', () => {
      render(<ValidatorHeatmap />)

      // truncateAddress('0xAAAA...40chars') => first 6 + '...' + last 4
      expect(screen.getByText('0xAAAA...AAAA')).toBeInTheDocument()
      expect(screen.getByText('0xBBBB...BBBB')).toBeInTheDocument()
    })

    it('shows correct participation percentages', () => {
      render(<ValidatorHeatmap />)

      // validatorA: prepareRate=95.0%, participationRate=95.0% → "95.0%" appears twice
      const ninetyFive = screen.getAllByText('95.0%')
      expect(ninetyFive.length).toBeGreaterThanOrEqual(1)
      // validatorB: prepareRate=80.0%, participationRate=80.0% → "80.0%" appears twice
      const eighty = screen.getAllByText('80.0%')
      expect(eighty.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ---- Sorting ----
  describe('sorting', () => {
    it('validators are sorted by participationRate descending', () => {
      const low = makeValidator({
        address: '0xLOWLOWLOWLOWLOWLOWLOWLOWLOWLOWLOWLOWLOW0',
        participationRate: 50.0,
      })
      const high = makeValidator({
        address: '0xHIGHIGHIGHIGHIGHIGHIGHIGHIGHIGHIGHIGHIG0',
        participationRate: 99.0,
      })

      // Provide low first so we can verify sorting reorders them
      mockUseAllValidatorStats.mockReturnValue({
        stats: [low, high],
        loading: false,
        error: null,
      })

      render(<ValidatorHeatmap />)

      const addresses = screen.getAllByTitle(/^0x/)
      // First row should be the high validator (sorted desc)
      expect(addresses[0]!.title).toBe(high.address)
      expect(addresses[1]!.title).toBe(low.address)
    })

    it('shows rank badge #1 for highest participation', () => {
      const top = makeValidator({
        address: '0xTOPTOPTOPTOPTOPTOPTOPTOPTOPTOPTOPTOPTOP0',
        participationRate: 99.0,
      })
      const second = makeValidator({
        address: '0x2ND2ND2ND2ND2ND2ND2ND2ND2ND2ND2ND2ND2ND0',
        participationRate: 80.0,
      })

      mockUseAllValidatorStats.mockReturnValue({
        stats: [second, top],
        loading: false,
        error: null,
      })

      render(<ValidatorHeatmap />)

      // Rank badges rendered as text content: 1, 2
      const rankElements = screen.getAllByText(/^[12]$/)
      expect(rankElements[0]!.textContent).toBe('1')
      expect(rankElements[1]!.textContent).toBe('2')
    })
  })

  // ---- Rate calculations ----
  describe('rate calculations', () => {
    it('calculates prepare rate from preparesSigned / (preparesSigned + preparesMissed)', () => {
      const validator = makeValidator({
        address: '0xPREPPREPPREPPREPPREPPREPPREPPREPPREPPREP',
        preparesSigned: '80',
        preparesMissed: '20',
        participationRate: 80.0,
      })

      mockUseAllValidatorStats.mockReturnValue({
        stats: [validator],
        loading: false,
        error: null,
      })

      render(<ValidatorHeatmap />)

      // 80 / (80 + 20) * 100 = 80.0%
      // There may be multiple 80.0% texts (prepare rate and overall), just check it exists
      const matches = screen.getAllByText('80.0%')
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })

    it('calculates commit rate from commitsSigned / (commitsSigned + commitsMissed)', () => {
      const validator = makeValidator({
        address: '0xCOMMCOMMCOMMCOMMCOMMCOMMCOMMCOMMCOMMCOMM',
        commitsSigned: '70',
        commitsMissed: '30',
        preparesSigned: '50',
        preparesMissed: '50',
        participationRate: 70.0,
      })

      mockUseAllValidatorStats.mockReturnValue({
        stats: [validator],
        loading: false,
        error: null,
      })

      render(<ValidatorHeatmap />)

      // 70 / (70 + 30) * 100 = 70.0%
      const matches = screen.getAllByText('70.0%')
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })

    it('handles zero total (shows 0%)', () => {
      const validator = makeValidator({
        address: '0xZEROZEROZEROZEROZEROZEROZEROZEROZEROZERO',
        preparesSigned: '0',
        preparesMissed: '0',
        commitsSigned: '0',
        commitsMissed: '0',
        blocksProposed: '0',
        totalBlocks: '0',
        participationRate: 0,
      })

      mockUseAllValidatorStats.mockReturnValue({
        stats: [validator],
        loading: false,
        error: null,
      })

      render(<ValidatorHeatmap />)

      // All rates should be 0.0%
      const zeroMatches = screen.getAllByText('0.0%')
      // prepareRate=0, commitRate=0, participationRate=0 → 3 cells with 0.0%
      expect(zeroMatches.length).toBe(3)
    })
  })

  // ---- Legend ----
  describe('legend', () => {
    it('shows performance legend with color indicators', () => {
      mockUseAllValidatorStats.mockReturnValue({
        stats: [makeValidator()],
        loading: false,
        error: null,
      })

      render(<ValidatorHeatmap />)

      expect(screen.getByText('Performance:')).toBeInTheDocument()
    })
  })

  // ---- Limit prop ----
  describe('limit prop', () => {
    it('passes limit to useAllValidatorStats', () => {
      mockUseAllValidatorStats.mockReturnValue({
        stats: [],
        loading: true,
        error: null,
      })

      render(<ValidatorHeatmap limit={25} />)

      expect(mockUseAllValidatorStats).toHaveBeenCalledWith({ limit: 25 })
    })

    it('uses default limit of 10 when not specified', () => {
      mockUseAllValidatorStats.mockReturnValue({
        stats: [],
        loading: true,
        error: null,
      })

      render(<ValidatorHeatmap />)

      expect(mockUseAllValidatorStats).toHaveBeenCalledWith({ limit: 10 })
    })
  })
})
