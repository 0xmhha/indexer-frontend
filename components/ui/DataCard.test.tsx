import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataCard } from './DataCard'

describe('DataCard', () => {
  it('should render loading state with spinner', () => {
    render(<DataCard title="Test Card" loading />)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should render error state with error message', () => {
    const error = new Error('Something went wrong')
    render(<DataCard title="Test Card" error={error} />)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should render custom error title', () => {
    const error = new Error('fail')
    render(<DataCard title="Test Card" error={error} errorTitle="Custom Error" />)
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
  })

  it('should render default error title based on card title', () => {
    const error = new Error('fail')
    render(<DataCard title="Validators" error={error} />)
    expect(screen.getByText('Failed to load validators')).toBeInTheDocument()
  })

  it('should render empty state with default message', () => {
    render(<DataCard title="Test Card" isEmpty />)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('should render empty state with custom message', () => {
    render(<DataCard title="Test Card" isEmpty emptyMessage="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('should render children when no loading/error/empty', () => {
    render(
      <DataCard title="Test Card">
        <div data-testid="child">Content</div>
      </DataCard>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<DataCard title="Test Card" className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should prioritize loading over error', () => {
    const error = new Error('fail')
    render(<DataCard title="Test" loading error={error} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('fail')).not.toBeInTheDocument()
  })

  it('should prioritize error over empty', () => {
    const error = new Error('fail')
    render(<DataCard title="Test" error={error} isEmpty />)
    expect(screen.getByText('fail')).toBeInTheDocument()
    expect(screen.queryByText('No data available')).not.toBeInTheDocument()
  })

  it('should handle null error without showing error state', () => {
    render(
      <DataCard title="Test" error={null}>
        <div data-testid="child">OK</div>
      </DataCard>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
