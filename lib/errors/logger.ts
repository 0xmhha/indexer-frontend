/**
 * Error Logging Service
 * Centralized error logging with support for external monitoring services
 */

import { AppError, getErrorMessage } from './types'

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

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = 100 // Keep last 100 errors in memory

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
  getRecentLogs(count = 10): ErrorLog[] {
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

    /* eslint-disable no-console */
    if (severity === 'error') {
      console.error(prefix, error, contextStr)
    } else if (severity === 'warning') {
      console.warn(prefix, error.message, contextStr)
    } else {
      console.info(prefix, error.message, contextStr)
    }
    /* eslint-enable no-console */
  }

  /**
   * Send error to external monitoring service
   * TODO: Integrate with Sentry, LogRocket, or similar
   */
  private sendToMonitoring(log: ErrorLog): void {
    const { error, context, severity } = log

    // Example: Sentry integration
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     level: severity,
    //     contexts: {
    //       custom: context,
    //     },
    //   })
    // }

    // Example: Custom API endpoint
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     message: error.message,
    //     stack: error.stack,
    //     context,
    //     severity,
    //   }),
    // }).catch(() => {
    //   // Silently fail if error reporting fails
    // })

    // For now, just log to console in production
    if (severity === 'error') {
      // eslint-disable-next-line no-console
      console.error('[Production Error]', error.message, context)
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
