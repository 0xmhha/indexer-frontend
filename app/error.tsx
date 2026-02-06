'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    import('@/lib/errors').then(({ errorLogger }) => {
      errorLogger.error(error, {
        action: 'page_error',
        metadata: {
          digest: error.digest,
        },
      })
    })
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
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
          {error.digest && (
            <p className="mt-2 font-mono text-[10px] text-text-muted">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="space-y-2">
          <Button onClick={reset} className="w-full">
            TRY AGAIN
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')} className="w-full">
            GO HOME
          </Button>
        </div>
      </div>
    </div>
  )
}
