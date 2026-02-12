/**
 * Error Logging Service
 * Centralized error logging with support for external monitoring services
 */

import { AppError, getErrorMessage } from './types'
import { ERROR_LOGGING, TIMEOUTS } from '@/lib/config/constants'

interface ErrorContext {
  component?: string | undefined
  action?: string | undefined
  userId?: string | undefined
  metadata?: Record<string, unknown> | undefined
}

interface ErrorLog {
  timestamp: Date
  error: Error | AppError
  context?: ErrorContext | undefined
  severity: 'error' | 'warning' | 'info'
}

interface SerializedErrorLog {
  timestamp: string
  message: string
  stack?: string
  context?: ErrorContext
  severity: 'error' | 'warning' | 'info'
  userAgent?: string
  url?: string
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = ERROR_LOGGING.MAX_IN_MEMORY_LOGS
  private errorQueue: SerializedErrorLog[] = []
  private batchTimeout: NodeJS.Timeout | null = null
  private isFlushing = false
  private readonly BATCH_DELAY = TIMEOUTS.ERROR_BATCH_DELAY
  private readonly MAX_BATCH_SIZE = ERROR_LOGGING.MAX_BATCH_SIZE
  private readonly STORAGE_KEY = 'app_error_logs'
  private readonly MAX_STORED_ERRORS = ERROR_LOGGING.MAX_STORED_ERRORS

  /**
   * Log an error with context
   */
  log(error: unknown, context?: ErrorContext, severity: 'error' | 'warning' | 'info' = 'error'): void {
    const errorObj = this.normalizeError(error)

    const log: ErrorLog = {
      timestamp: new Date(),
      error: errorObj,
      context,
      severity,
    }

    // Add to in-memory logs
    this.logs.push(log)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Console logging (development)
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(log)
    }

    // Send to external monitoring service (production)
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(log)
    }
  }

  /**
   * Log an error
   */
  error(error: unknown, context?: ErrorContext): void {
    this.log(error, context, 'error')
  }

  /**
   * Log a warning
   */
  warn(error: unknown, context?: ErrorContext): void {
    this.log(error, context, 'warning')
  }

  /**
   * Log info
   */
  info(message: string, context?: ErrorContext): void {
    this.log(new Error(message), context, 'info')
  }

  /**
   * Get recent error logs
   */
  getRecentLogs(count: number = ERROR_LOGGING.DEFAULT_RECENT_COUNT): ErrorLog[] {
    return this.logs.slice(-count)
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * Normalize error to Error object
   */
  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error
    }
    return new Error(getErrorMessage(error))
  }

  /**
   * Console logging for development
   */
  private consoleLog(log: ErrorLog): void {
    const { timestamp, error, context, severity } = log

    const prefix = `[${severity.toUpperCase()}] [${timestamp.toISOString()}]`
    const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : ''

    if (severity === 'error') {
      console.error(prefix, error, contextStr)
    } else if (severity === 'warning') {
      console.warn(prefix, error.message, contextStr)
    } else {
      console.info(prefix, error.message, contextStr)
    }
  }

  /**
   * Send error to monitoring (localStorage + optional API)
   * Free solution without external paid services
   */
  private sendToMonitoring(log: ErrorLog): void {
    const serialized = this.serializeError(log)

    // Store in localStorage for persistence
    this.storeErrorLocally(serialized)

    // Add to batch queue for API endpoint (if configured)
    this.errorQueue.push(serialized)

    // Send batch if queue is full or start timer
    if (this.errorQueue.length >= this.MAX_BATCH_SIZE) {
      this.flushErrorBatch()
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.flushErrorBatch(), this.BATCH_DELAY)
    }

    // Still log critical errors to console
    if (log.severity === 'error') {
      console.error('[Production Error]', log.error.message, log.context)
    }
  }

  /**
   * Serialize error log for storage/transmission
   */
  private serializeError(log: ErrorLog): SerializedErrorLog {
    const { timestamp, error, context, severity } = log

    const serialized: SerializedErrorLog = {
      timestamp: timestamp.toISOString(),
      message: error.message,
      severity,
    }

    // Only add optional properties if they have values
    if (error.stack) {
      serialized.stack = error.stack
    }
    if (context) {
      serialized.context = context
    }
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      serialized.userAgent = navigator.userAgent
    }
    if (typeof window !== 'undefined' && window.location.href) {
      serialized.url = window.location.href
    }

    return serialized
  }

  /**
   * Store error in localStorage
   */
  private storeErrorLocally(error: SerializedErrorLog): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const errors: SerializedErrorLog[] = stored ? JSON.parse(stored) : []

      // Add new error
      errors.push(error)

      // Keep only recent errors
      const trimmed = errors.slice(-this.MAX_STORED_ERRORS)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed))
    } catch (e) {
      // Silently fail if localStorage is full or unavailable
      console.warn('Failed to store error in localStorage:', e)
    }
  }

  /**
   * Flush error batch to API endpoint.
   * Uses isFlushing flag to prevent concurrent flushes (race condition).
   */
  private flushErrorBatch(): void {
    if (this.isFlushing || this.errorQueue.length === 0) {
      return
    }

    this.isFlushing = true

    // Clear timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }

    // Get batch to send and clear queue atomically
    const batch = [...this.errorQueue]
    this.errorQueue = []

    // Send to custom API endpoint if configured
    const apiEndpoint = process.env.NEXT_PUBLIC_ERROR_API_ENDPOINT

    if (apiEndpoint && typeof fetch !== 'undefined') {
      fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: batch,
          timestamp: new Date().toISOString(),
        }),
        // Don't wait for response
        keepalive: true,
      }).catch((e) => {
        // Silently fail if error reporting fails
        console.warn('Failed to send error batch to API:', e)
      }).finally(() => {
        this.isFlushing = false
      })
    } else {
      this.isFlushing = false
    }
  }

  /**
   * Get stored errors from localStorage
   */
  getStoredErrors(): SerializedErrorLog[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return []
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * Clear stored errors from localStorage
   */
  clearStoredErrors(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (e) {
      console.warn('Failed to clear stored errors:', e)
    }
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger()

/**
 * Hook for logging errors in React components
 */
export function useErrorLogger() {
  return {
    logError: (error: unknown, context?: ErrorContext) => errorLogger.error(error, context),
    logWarning: (error: unknown, context?: ErrorContext) => errorLogger.warn(error, context),
    logInfo: (message: string, context?: ErrorContext) => errorLogger.info(message, context),
  }
}

/**
 * Decorator for error logging in async functions
 */
export function withErrorLogging<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: unknown[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      errorLogger.error(error, context)
      throw error
    }
  }) as T
}
