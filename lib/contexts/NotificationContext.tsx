'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { ToastContainer } from '@/components/notifications/ToastContainer'
import type { ToastType } from '@/components/notifications/Toast'
import { TIMEOUTS, FORMATTING } from '@/lib/config/constants'

interface ToastData {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface NotificationContextValue {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void
  showSuccess: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  clearToast: (id: string) => void
  clearAllToasts: () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

/**
 * Notification Provider
 *
 * Provides toast notification functionality throughout the application.
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration: number = TIMEOUTS.TOAST_DURATION) => {
      const id = `toast-${Date.now()}-${Math.random().toString(FORMATTING.BASE36_RADIX).substr(2, FORMATTING.RANDOM_ID_LENGTH)}`

      const newToast: ToastData = {
        id,
        type,
        title,
        ...(message && { message }),
        duration,
      }

      setToasts((prev) => [...prev, newToast])
    },
    []
  )

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast('success', title, message)
    },
    [showToast]
  )

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast('info', title, message)
    },
    [showToast]
  )

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast('warning', title, message, TIMEOUTS.TOAST_WARNING_DURATION)
    },
    [showToast]
  )

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast('error', title, message, TIMEOUTS.TOAST_ERROR_DURATION)
    },
    [showToast]
  )

  const clearToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const value: NotificationContextValue = {
    showToast,
    showSuccess,
    showInfo,
    showWarning,
    showError,
    clearToast,
    clearAllToasts,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={clearToast} />
    </NotificationContext.Provider>
  )
}

/**
 * Hook to access notification functions
 *
 * @returns Notification context value
 * @throws Error if used outside NotificationProvider
 */
export function useNotifications() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }

  return context
}
