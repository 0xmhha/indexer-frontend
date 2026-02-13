'use client'

import { useEffect } from 'react'

export type ToastType = 'success' | 'info' | 'warning' | 'error'

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-accent-green/10',
    border: 'border-accent-green',
    icon: '✓',
  },
  info: {
    bg: 'bg-accent-blue/10',
    border: 'border-accent-blue',
    icon: 'ℹ',
  },
  warning: {
    bg: 'bg-accent-orange/10',
    border: 'border-accent-orange',
    icon: '⚠',
  },
  error: {
    bg: 'bg-accent-red/10',
    border: 'border-accent-red',
    icon: '✕',
  },
}

/**
 * Toast Notification Component
 *
 * Displays temporary notification messages with auto-dismiss functionality.
 *
 * @param id - Unique identifier for the toast
 * @param type - Toast type (success, info, warning, error)
 * @param title - Toast title
 * @param message - Optional detailed message
 * @param duration - Auto-dismiss duration in ms (default: 5000)
 * @param onClose - Callback when toast is closed
 */
export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const styles = typeStyles[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [id, duration, onClose])

  return (
    <div
      className={`animate-slide-in-right pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border ${styles.border} ${styles.bg} shadow-lg`}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0">
            <span className="text-lg">{styles.icon}</span>
          </div>

          {/* Content */}
          <div className="ml-3 w-0 flex-1">
            <p className="font-mono text-sm font-medium text-text-primary">{title}</p>
            {message && <p className="mt-1 font-mono text-xs text-text-secondary">{message}</p>}
          </div>

          {/* Close Button */}
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              onClick={() => onClose(id)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-text-muted transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
              aria-label="Close notification"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="h-1 w-full overflow-hidden bg-bg-tertiary">
          <div
            className={`h-full ${styles.border.replace('border-', 'bg-')}`}
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  )
}
