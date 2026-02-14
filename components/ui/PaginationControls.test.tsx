import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// ============================================================
// Mocks
// ============================================================

const mockUsePaginationKeyboard = vi.fn()
const mockCalculatePageRange = vi.fn()
const mockCalculateShowingRange = vi.fn()

vi.mock('@/lib/hooks/usePaginationKeyboard', () => ({
  usePaginationKeyboard: (...args: unknown[]) => mockUsePaginationKeyboard(...args),
  calculatePageRange: (...args: unknown[]) => mockCalculatePageRange(...args),
  calculateShowingRange: (...args: unknown[]) => mockCalculateShowingRange(...args),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | boolean | undefined | null)[]) =>
    classes.filter(Boolean).join(' '),
}))

vi.mock('@/lib/config/constants', () => ({
  UI: {
    DEFAULT_PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
    PAGINATION_MAX_VISIBLE_FULL: 7,
  },
}))

vi.mock('lucide-react', () => ({
  ArrowUpDown: (props: Record<string, unknown>) => (
    <span data-testid="arrow-up-down" {...props} />
  ),
}))

vi.mock('@/components/ui/PaginationButtons', () => ({
  FirstPageButton: ({
    onClick,
    disabled,
  }: {
    onClick: () => void
    disabled: boolean | undefined
  }) => (
    <button onClick={onClick} disabled={disabled ?? false} aria-label="Go to first page">
      First
    </button>
  ),
  PrevPageButton: ({
    onClick,
    disabled,
  }: {
    onClick: () => void
    disabled: boolean | undefined
  }) => (
    <button onClick={onClick} disabled={disabled ?? false} aria-label="Go to previous page">
      Prev
    </button>
  ),
  NextPageButton: ({
    onClick,
    disabled,
  }: {
    onClick: () => void
    disabled: boolean | undefined
  }) => (
    <button onClick={onClick} disabled={disabled ?? false} aria-label="Go to next page">
      Next
    </button>
  ),
  LastPageButton: ({
    onClick,
    disabled,
    totalPages,
  }: {
    onClick: () => void
    disabled: boolean | undefined
    totalPages: number
  }) => (
    <button
      onClick={onClick}
      disabled={disabled ?? false}
      aria-label={`Go to last page, page ${totalPages}`}
    >
      Last
    </button>
  ),
  PageButton: ({
    page,
    isCurrent,
    onClick,
    disabled,
  }: {
    page: number
    isCurrent: boolean
    onClick: () => void
    disabled: boolean | undefined
  }) => (
    <button
      onClick={onClick}
      disabled={disabled ?? false}
      aria-label={`${isCurrent ? 'Current page, ' : ''}Page ${page}`}
      aria-current={isCurrent ? 'page' : undefined}
    >
      {page}
    </button>
  ),
  PageEllipsis: () => <span aria-hidden="true">...</span>,
}))

// ============================================================
// Import after mocks
// ============================================================

import { PaginationControls } from './PaginationControls'

// ============================================================
// Helpers
// ============================================================

const defaultProps = {
  currentPage: 3,
  totalPages: 10,
  totalCount: 100,
  itemsPerPage: 10,
  onPageChange: vi.fn(),
}

function renderPagination(overrides: Partial<Parameters<typeof PaginationControls>[0]> = {}) {
  return render(<PaginationControls {...defaultProps} {...overrides} />)
}

// ============================================================
// Tests
// ============================================================

describe('PaginationControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCalculatePageRange.mockReturnValue([1, 2, 3, 4, 5, 6, 7])
    mockCalculateShowingRange.mockReturnValue({ start: 21, end: 30 })
  })

  // ----------------------------------------------------------
  // Basic rendering
  // ----------------------------------------------------------

  describe('basic rendering', () => {
    it('renders pagination nav with aria-label="Pagination"', () => {
      renderPagination()
      const nav = screen.getByRole('navigation', { name: 'Pagination' })
      expect(nav).toBeInTheDocument()
    })

    it('shows page buttons from calculatePageRange result', () => {
      mockCalculatePageRange.mockReturnValue([2, 3, 4, 5])
      renderPagination()

      expect(screen.getByRole('button', { name: 'Current page, Page 3' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Page 4' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument()
    })

    it('shows results info when totalCount provided and showResultsInfo=true', () => {
      renderPagination({ showResultsInfo: true, totalCount: 100 })
      expect(screen.getByText('Showing')).toBeInTheDocument()
      expect(screen.getByText('results')).toBeInTheDocument()
    })

    it('hides results info when showResultsInfo=false', () => {
      renderPagination({ showResultsInfo: false })
      expect(screen.queryByText('Showing')).not.toBeInTheDocument()
    })

    it('hides results info when totalCount is undefined', () => {
      const { totalCount: _, ...propsWithoutCount } = defaultProps
      render(<PaginationControls {...propsWithoutCount} showResultsInfo={true} />)
      expect(screen.queryByText('Showing')).not.toBeInTheDocument()
    })

    it('calls usePaginationKeyboard with correct arguments', () => {
      const onPageChange = vi.fn()
      renderPagination({ currentPage: 5, totalPages: 20, onPageChange })
      expect(mockUsePaginationKeyboard).toHaveBeenCalledWith(5, 20, onPageChange)
    })

    it('calls calculatePageRange with correct arguments', () => {
      renderPagination({ currentPage: 4, totalPages: 15 })
      expect(mockCalculatePageRange).toHaveBeenCalledWith(4, 15, 7)
    })
  })

  // ----------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------

  describe('navigation', () => {
    it('calls onPageChange with page-1 when prev clicked (not on first page)', () => {
      const onPageChange = vi.fn()
      renderPagination({ currentPage: 5, totalPages: 10, onPageChange })

      const prevButton = screen.getByRole('button', { name: 'Go to previous page' })
      fireEvent.click(prevButton)

      expect(onPageChange).toHaveBeenCalledWith(4)
    })

    it('calls onPageChange with page+1 when next clicked (not on last page)', () => {
      const onPageChange = vi.fn()
      renderPagination({ currentPage: 5, totalPages: 10, onPageChange })

      const nextButton = screen.getByRole('button', { name: 'Go to next page' })
      fireEvent.click(nextButton)

      expect(onPageChange).toHaveBeenCalledWith(6)
    })

    it('prev button is disabled on first page', () => {
      renderPagination({ currentPage: 1, totalPages: 10 })

      const prevButton = screen.getByRole('button', { name: 'Go to previous page' })
      expect(prevButton).toBeDisabled()
    })

    it('next button is disabled on last page', () => {
      renderPagination({ currentPage: 10, totalPages: 10 })

      const nextButton = screen.getByRole('button', { name: 'Go to next page' })
      expect(nextButton).toBeDisabled()
    })

    it('calls onPageChange with 1 when first page button clicked', () => {
      const onPageChange = vi.fn()
      renderPagination({ currentPage: 5, totalPages: 10, onPageChange })

      const firstButton = screen.getByRole('button', { name: 'Go to first page' })
      fireEvent.click(firstButton)

      expect(onPageChange).toHaveBeenCalledWith(1)
    })

    it('calls onPageChange with totalPages when last page button clicked', () => {
      const onPageChange = vi.fn()
      renderPagination({ currentPage: 5, totalPages: 10, onPageChange })

      const lastButton = screen.getByRole('button', { name: /Go to last page/ })
      fireEvent.click(lastButton)

      expect(onPageChange).toHaveBeenCalledWith(10)
    })

    it('does not show first page button when on first page', () => {
      renderPagination({ currentPage: 1, totalPages: 10 })
      expect(screen.queryByRole('button', { name: 'Go to first page' })).not.toBeInTheDocument()
    })

    it('does not show last page button when on last page', () => {
      renderPagination({ currentPage: 10, totalPages: 10 })
      expect(
        screen.queryByRole('button', { name: /Go to last page/ })
      ).not.toBeInTheDocument()
    })

    it('calls onPageChange with correct page when a page button is clicked', () => {
      const onPageChange = vi.fn()
      mockCalculatePageRange.mockReturnValue([1, 2, 3, 4, 5])
      renderPagination({ currentPage: 3, totalPages: 10, onPageChange })

      const page5Button = screen.getByRole('button', { name: 'Page 5' })
      fireEvent.click(page5Button)

      expect(onPageChange).toHaveBeenCalledWith(5)
    })
  })

  // ----------------------------------------------------------
  // Items per page
  // ----------------------------------------------------------

  describe('items per page', () => {
    it('shows items per page selector when showItemsPerPage=true and onItemsPerPageChange provided', () => {
      renderPagination({
        showItemsPerPage: true,
        onItemsPerPageChange: vi.fn(),
      })

      expect(screen.getByLabelText('Items per page')).toBeInTheDocument()
    })

    it('hides selector when showItemsPerPage=false', () => {
      renderPagination({
        showItemsPerPage: false,
        onItemsPerPageChange: vi.fn(),
      })

      expect(screen.queryByLabelText('Items per page')).not.toBeInTheDocument()
    })

    it('hides selector when onItemsPerPageChange is not provided', () => {
      renderPagination({
        showItemsPerPage: true,
      })

      expect(screen.queryByLabelText('Items per page')).not.toBeInTheDocument()
    })

    it('calls onItemsPerPageChange when selection changes', () => {
      const onItemsPerPageChange = vi.fn()
      renderPagination({
        showItemsPerPage: true,
        onItemsPerPageChange,
        itemsPerPage: 10,
      })

      const select = screen.getByLabelText('Items per page')
      fireEvent.change(select, { target: { value: '50' } })

      expect(onItemsPerPageChange).toHaveBeenCalledWith(50)
    })

    it('renders all items per page options', () => {
      renderPagination({
        showItemsPerPage: true,
        onItemsPerPageChange: vi.fn(),
        itemsPerPageOptions: [10, 25, 50, 100],
      })

      const select = screen.getByLabelText('Items per page')
      const options = select.querySelectorAll('option')
      expect(options).toHaveLength(4)
      expect(options[0]).toHaveTextContent('10')
      expect(options[1]).toHaveTextContent('25')
      expect(options[2]).toHaveTextContent('50')
      expect(options[3]).toHaveTextContent('100')
    })

    it('disables the select when loading', () => {
      renderPagination({
        showItemsPerPage: true,
        onItemsPerPageChange: vi.fn(),
        loading: true,
      })

      const select = screen.getByLabelText('Items per page')
      expect(select).toBeDisabled()
    })
  })

  // ----------------------------------------------------------
  // Loading state
  // ----------------------------------------------------------

  describe('loading state', () => {
    it('applies opacity class when loading=true', () => {
      const { container } = renderPagination({ loading: true })
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.className).toContain('opacity-50')
    })

    it('does not apply opacity class when loading=false', () => {
      const { container } = renderPagination({ loading: false })
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.className).not.toContain('opacity-50')
    })

    it('applies pointer-events-none when loading=true', () => {
      const { container } = renderPagination({ loading: true })
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.className).toContain('pointer-events-none')
    })

    it('prev button is disabled when loading', () => {
      renderPagination({ currentPage: 5, totalPages: 10, loading: true })
      const prevButton = screen.getByRole('button', { name: 'Go to previous page' })
      expect(prevButton).toBeDisabled()
    })

    it('next button is disabled when loading', () => {
      renderPagination({ currentPage: 5, totalPages: 10, loading: true })
      const nextButton = screen.getByRole('button', { name: 'Go to next page' })
      expect(nextButton).toBeDisabled()
    })

    it('page buttons are disabled when loading', () => {
      mockCalculatePageRange.mockReturnValue([1, 2, 3])
      renderPagination({ currentPage: 2, totalPages: 3, loading: true })

      const page1 = screen.getByRole('button', { name: 'Page 1' })
      const page3 = screen.getByRole('button', { name: 'Page 3' })
      expect(page1).toBeDisabled()
      expect(page3).toBeDisabled()
    })
  })

  // ----------------------------------------------------------
  // Results info
  // ----------------------------------------------------------

  describe('results info', () => {
    it('shows "Showing X - Y of Z results" format', () => {
      mockCalculateShowingRange.mockReturnValue({ start: 21, end: 30 })
      renderPagination({ totalCount: 100, showResultsInfo: true })

      expect(screen.getByText('Showing')).toBeInTheDocument()
      expect(screen.getByText('21')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('results')).toBeInTheDocument()
    })

    it('correct calculation for middle pages', () => {
      mockCalculateShowingRange.mockReturnValue({ start: 51, end: 60 })
      renderPagination({
        currentPage: 6,
        totalPages: 20,
        totalCount: 200,
        itemsPerPage: 10,
        showResultsInfo: true,
      })

      expect(screen.getByText('51')).toBeInTheDocument()
      expect(screen.getByText('60')).toBeInTheDocument()
      expect(screen.getByText('200')).toBeInTheDocument()
    })

    it('calls calculateShowingRange with correct arguments', () => {
      renderPagination({
        currentPage: 4,
        totalPages: 10,
        totalCount: 95,
        itemsPerPage: 10,
      })

      expect(mockCalculateShowingRange).toHaveBeenCalledWith(4, 10, 95)
    })

    it('has role="status" for accessibility', () => {
      renderPagination({ showResultsInfo: true, totalCount: 100 })
      const statusElement = screen.getByRole('status')
      expect(statusElement).toBeInTheDocument()
    })
  })

  // ----------------------------------------------------------
  // Page input
  // ----------------------------------------------------------

  describe('page input', () => {
    it('shows jump-to-page input when showPageInput=true', () => {
      renderPagination({ showPageInput: true })
      expect(screen.getByLabelText('Page number')).toBeInTheDocument()
      expect(screen.getByText('Jump to:')).toBeInTheDocument()
    })

    it('hidden by default (showPageInput defaults to false)', () => {
      renderPagination()
      expect(screen.queryByLabelText('Page number')).not.toBeInTheDocument()
    })

    it('shows Go button when page input is visible', () => {
      renderPagination({ showPageInput: true })
      expect(screen.getByRole('button', { name: 'Go to page' })).toBeInTheDocument()
    })

    it('page input has correct min and max attributes', () => {
      renderPagination({ showPageInput: true, totalPages: 20 })
      const input = screen.getByLabelText('Page number')
      expect(input).toHaveAttribute('min', '1')
      expect(input).toHaveAttribute('max', '20')
    })

    it('page input shows currentPage as placeholder', () => {
      renderPagination({ showPageInput: true, currentPage: 7 })
      const input = screen.getByLabelText('Page number')
      expect(input).toHaveAttribute('placeholder', '7')
    })

    it('page input is disabled when loading', () => {
      renderPagination({ showPageInput: true, loading: true })
      const input = screen.getByLabelText('Page number')
      expect(input).toBeDisabled()
    })

    it('Go button is disabled when loading', () => {
      renderPagination({ showPageInput: true, loading: true })
      const goButton = screen.getByRole('button', { name: 'Go to page' })
      expect(goButton).toBeDisabled()
    })
  })

  // ----------------------------------------------------------
  // Custom className
  // ----------------------------------------------------------

  describe('custom className', () => {
    it('applies custom className to the wrapper', () => {
      const { container } = renderPagination({ className: 'my-custom-class' })
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.className).toContain('my-custom-class')
    })
  })

  // ----------------------------------------------------------
  // Keyboard hint
  // ----------------------------------------------------------

  describe('keyboard hint', () => {
    it('renders keyboard navigation hint', () => {
      renderPagination()
      expect(screen.getByText(/navigate pages/)).toBeInTheDocument()
    })
  })
})
