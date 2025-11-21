import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ErrorDisplay, NotFound } from './ErrorBoundary'

describe('ErrorDisplay', () => {
  it('should render error title and message', () => {
    render(<ErrorDisplay title="Test Error" message="Something went wrong" />)
    
    expect(screen.getByText('Test Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should use default title when not provided', () => {
    render(<ErrorDisplay message="Test message" />)
    
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ErrorDisplay message="Test" onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()
  })

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorDisplay message="Test" />)
    
    const retryButton = screen.queryByRole('button', { name: /retry/i })
    expect(retryButton).not.toBeInTheDocument()
  })

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorDisplay message="Test" onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /retry/i })
    await user.click(retryButton)
    
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should have error icon', () => {
    const { container } = render(<ErrorDisplay message="Test" />)
    
    // Check for error indicator (!)
    expect(container.textContent).toContain('!')
  })
})

describe('NotFound', () => {
  it('should render default message', () => {
    render(<NotFound />)
    
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('NOT FOUND')).toBeInTheDocument()
    expect(screen.getByText('Resource not found')).toBeInTheDocument()
  })

  it('should render custom message', () => {
    render(<NotFound message="Custom not found message" />)
    
    expect(screen.getByText('Custom not found message')).toBeInTheDocument()
  })

  it('should have go back button', () => {
    render(<NotFound />)
    
    const button = screen.getByRole('button', { name: /go back/i })
    expect(button).toBeInTheDocument()
  })

  it('should call window.history.back when button clicked', async () => {
    const user = userEvent.setup()
    const mockBack = vi.fn()
    window.history.back = mockBack
    
    render(<NotFound />)
    
    const button = screen.getByRole('button', { name: /go back/i })
    await user.click(button)
    
    expect(mockBack).toHaveBeenCalledTimes(1)
  })

  it('should display 404 text', () => {
    render(<NotFound />)
    
    expect(screen.getByText('404')).toBeInTheDocument()
  })
})
