'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error logging service
    if (typeof window !== 'undefined') {
      import('@/lib/errors').then(({ errorLogger }) => {
        errorLogger.error(error, {
          component: errorInfo.componentStack?.split('\n')[1]?.trim(),
          action: 'render',
          metadata: {
            componentStack: errorInfo.componentStack,
          },
        })
      })
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-4">
      <div className="card-bordered max-w-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
            <span className="font-mono text-2xl text-error">!</span>
          </div>
          <h2 className="mb-2 font-mono text-lg font-bold text-error">ERROR DETECTED</h2>
          <p className="annotation mb-4">SYSTEM MALFUNCTION</p>
        </div>

        <div className="mb-6 rounded border border-error/20 bg-error/5 p-4">
          <p className="font-mono text-xs text-text-secondary">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>

        <div className="space-y-2">
          <Button onClick={reset} className="w-full">
            TRY AGAIN
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
            RELOAD PAGE
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="mt-6 text-left">
            <summary className="annotation cursor-pointer">STACK TRACE</summary>
            <pre className="mt-2 overflow-auto rounded bg-bg-primary p-4 font-mono text-[10px] text-text-muted">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

/**
 * Error display component for specific error states
 */
export function ErrorDisplay({
  title = 'Error',
  message,
  onRetry,
}: {
  title?: string
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="card-bordered p-8 text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-error/10">
        <span className="font-mono text-xl text-error">!</span>
      </div>
      <h3 className="mb-2 font-mono text-sm font-bold text-error">{title}</h3>
      <p className="mb-4 font-mono text-xs text-text-secondary">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} size="sm">
          RETRY
        </Button>
      )}
    </div>
  )
}

/**
 * Not Found component
 */
export function NotFound({ message = 'Resource not found' }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-4">
      <div className="card-bordered max-w-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 font-mono text-6xl text-text-muted">404</div>
          <h2 className="mb-2 font-mono text-lg font-bold text-text-primary">NOT FOUND</h2>
          <p className="annotation">RESOURCE UNAVAILABLE</p>
        </div>

        <p className="mb-6 font-mono text-xs text-text-secondary">{message}</p>

        <Button onClick={() => window.history.back()}>GO BACK</Button>
      </div>
    </div>
  )
}
