'use client'

import { Toast, type ToastProps } from './Toast'

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[]
  onClose: (id: string) => void
}

/**
 * Toast Container Component
 *
 * Manages and displays multiple toast notifications in a fixed position.
 *
 * @param toasts - Array of toast notifications
 * @param onClose - Callback when a toast is closed
 */
export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed right-0 top-0 z-50 flex flex-col gap-4 p-6"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}
