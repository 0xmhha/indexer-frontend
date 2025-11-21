import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner, LoadingPage, LoadingSkeleton } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render with default size (md)', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.firstChild as HTMLElement
    
    expect(spinner).toHaveClass('h-8', 'w-8', 'border-2')
  })

  it('should render with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />)
    const spinner = container.firstChild as HTMLElement
    
    expect(spinner).toHaveClass('h-4', 'w-4', 'border-2')
  })

  it('should render with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    const spinner = container.firstChild as HTMLElement
    
    expect(spinner).toHaveClass('h-12', 'w-12', 'border-3')
  })

  it('should have proper accessibility attributes', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('should have visually hidden text for screen readers', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />)
    const spinner = container.firstChild as HTMLElement
    
    expect(spinner).toHaveClass('custom-class')
  })

  it('should have animation classes', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.firstChild as HTMLElement
    
    expect(spinner).toHaveClass('animate-spin', 'rounded-full')
  })
})

describe('LoadingPage', () => {
  it('should render loading spinner', () => {
    render(<LoadingPage />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('should display loading text', () => {
    render(<LoadingPage />)
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('should use large spinner', () => {
    render(<LoadingPage />)
    const spinner = screen.getByRole('status')

    expect(spinner).toHaveClass('h-12', 'w-12')
  })

  it('should be centered', () => {
    const { container } = render(<LoadingPage />)
    const wrapper = container.firstChild as HTMLElement
    
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center')
  })
})

describe('LoadingSkeleton', () => {
  it('should render skeleton element', () => {
    const { container } = render(<LoadingSkeleton />)
    const skeleton = container.firstChild as HTMLElement
    
    expect(skeleton).toBeInTheDocument()
  })

  it('should have animation classes', () => {
    const { container } = render(<LoadingSkeleton />)
    const skeleton = container.firstChild as HTMLElement
    
    expect(skeleton).toHaveClass('animate-pulse', 'rounded', 'bg-bg-tertiary')
  })

  it('should apply custom className', () => {
    const { container } = render(<LoadingSkeleton className="custom-skeleton" />)
    const skeleton = container.firstChild as HTMLElement
    
    expect(skeleton).toHaveClass('custom-skeleton')
  })

  it('should be hidden from screen readers', () => {
    const { container } = render(<LoadingSkeleton />)
    const skeleton = container.firstChild as HTMLElement
    
    expect(skeleton).toHaveAttribute('aria-hidden', 'true')
  })
})
