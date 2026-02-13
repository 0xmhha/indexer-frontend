import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('should render label and value', () => {
    render(<StatCard label="Total Blocks" value="1,234" />)
    expect(screen.getByText('Total Blocks')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('should render loading skeleton when loading', () => {
    const { container } = render(<StatCard label="Total Blocks" value={null} loading />)
    expect(screen.getByText('Total Blocks')).toBeInTheDocument()
    expect(container.querySelector('.h-8')).toBeInTheDocument()
    expect(screen.queryByText('1,234')).not.toBeInTheDocument()
  })

  it('should render icon when provided', () => {
    render(<StatCard label="Blocks" value="100" icon="🔥" />)
    expect(screen.getByText('🔥')).toBeInTheDocument()
  })

  it('should not render icon when not provided', () => {
    const { container } = render(<StatCard label="Blocks" value="100" />)
    expect(container.querySelector('.text-3xl')).not.toBeInTheDocument()
  })

  it('should apply custom color class', () => {
    render(<StatCard label="Blocks" value="100" color="text-red-500" />)
    const value = screen.getByText('100')
    expect(value).toHaveClass('text-red-500')
  })

  it('should apply default color class', () => {
    render(<StatCard label="Blocks" value="100" />)
    const value = screen.getByText('100')
    expect(value).toHaveClass('text-accent-blue')
  })

  it('should render subtitle text', () => {
    render(<StatCard label="Blocks" value="100" subtitle="Last 24h" />)
    expect(screen.getByText('Last 24h')).toBeInTheDocument()
  })

  it('should render info text as description', () => {
    render(<StatCard label="Blocks" value="100" info="Extra info" />)
    expect(screen.getByText('Extra info')).toBeInTheDocument()
  })

  it('should wrap in link when link prop is provided', () => {
    const { container } = render(<StatCard label="Blocks" value="100" link="/blocks" />)
    const link = container.querySelector('a')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/blocks')
  })

  it('should not wrap in link when link prop is not provided', () => {
    const { container } = render(<StatCard label="Blocks" value="100" />)
    expect(container.querySelector('a')).not.toBeInTheDocument()
  })
})
