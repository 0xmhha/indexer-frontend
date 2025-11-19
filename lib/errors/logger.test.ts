import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { errorLogger, useErrorLogger, withErrorLogging } from './logger'
import { AppError } from './types'

describe('ErrorLogger', () => {
  beforeEach(() => {
    errorLogger.clearLogs()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('log', () => {
    it('should log error with context', () => {
      const error = new Error('Test error')
      const context = { component: 'TestComponent', action: 'testAction' }

      errorLogger.log(error, context, 'error')

      const logs = errorLogger.getRecentLogs(1)
      expect(logs).toHaveLength(1)
      expect(logs[0]?.error).toBe(error)
      expect(logs[0]?.context).toEqual(context)
      expect(logs[0]?.severity).toBe('error')
      expect(logs[0]?.timestamp).toBeInstanceOf(Date)
    })

    it('should normalize non-Error objects', () => {
      errorLogger.log('string error')

      const logs = errorLogger.getRecentLogs(1)
      expect(logs[0]?.error).toBeInstanceOf(Error)
      expect(logs[0]?.error.message).toBe('string error')
    })

    it('should keep only maxLogs (100) in memory', () => {
      for (let i = 0; i < 110; i++) {
        errorLogger.log(new Error(`Error ${i}`))
      }

      const logs = errorLogger.getRecentLogs(110)
      expect(logs).toHaveLength(100)
      expect(logs[0]?.error.message).toBe('Error 10')
      expect(logs[99]?.error.message).toBe('Error 109')
    })

    it('should call consoleLog in development environment', () => {
      vi.stubEnv('NODE_ENV', 'development')

      errorLogger.log(new Error('Dev error'), undefined, 'error')
      expect(console.error).toHaveBeenCalled()

      vi.unstubAllEnvs()
    })

    it('should call sendToMonitoring in production environment', () => {
      vi.stubEnv('NODE_ENV', 'production')

      errorLogger.log(new Error('Prod error'), undefined, 'error')
      expect(console.error).toHaveBeenCalledWith(
        '[Production Error]',
        'Prod error',
        undefined
      )

      vi.unstubAllEnvs()
    })
  })

  describe('error', () => {
    it('should log with error severity', () => {
      const error = new Error('Test error')
      errorLogger.error(error)

      const logs = errorLogger.getRecentLogs(1)
      expect(logs[0]?.severity).toBe('error')
    })

    it('should pass context', () => {
      const context = { component: 'Test' }
      errorLogger.error(new Error('Test'), context)

      const logs = errorLogger.getRecentLogs(1)
      expect(logs[0]?.context).toEqual(context)
    })
  })

  describe('warn', () => {
    it('should log with warning severity', () => {
      errorLogger.warn(new Error('Warning'))

      const logs = errorLogger.getRecentLogs(1)
      expect(logs[0]?.severity).toBe('warning')
    })

    it('should call console.warn in development', () => {
      vi.stubEnv('NODE_ENV', 'development')

      errorLogger.warn(new Error('Warning message'))
      expect(console.warn).toHaveBeenCalled()

      vi.unstubAllEnvs()
    })
  })

  describe('info', () => {
    it('should log with info severity', () => {
      errorLogger.info('Info message')

      const logs = errorLogger.getRecentLogs(1)
      expect(logs[0]?.severity).toBe('info')
      expect(logs[0]?.error.message).toBe('Info message')
    })

    it('should call console.info in development', () => {
      vi.stubEnv('NODE_ENV', 'development')

      errorLogger.info('Info message')
      expect(console.info).toHaveBeenCalled()

      vi.unstubAllEnvs()
    })
  })

  describe('getRecentLogs', () => {
    it('should return specified number of logs', () => {
      for (let i = 0; i < 5; i++) {
        errorLogger.log(new Error(`Error ${i}`))
      }

      expect(errorLogger.getRecentLogs(3)).toHaveLength(3)
      expect(errorLogger.getRecentLogs(10)).toHaveLength(5)
    })

    it('should return most recent logs', () => {
      errorLogger.log(new Error('First'))
      errorLogger.log(new Error('Second'))
      errorLogger.log(new Error('Third'))

      const logs = errorLogger.getRecentLogs(2)
      expect(logs[0]?.error.message).toBe('Second')
      expect(logs[1]?.error.message).toBe('Third')
    })

    it('should use default count of 10', () => {
      for (let i = 0; i < 15; i++) {
        errorLogger.log(new Error(`Error ${i}`))
      }

      const logs = errorLogger.getRecentLogs()
      expect(logs).toHaveLength(10)
    })
  })

  describe('clearLogs', () => {
    it('should clear all logs', () => {
      errorLogger.log(new Error('Test'))
      expect(errorLogger.getRecentLogs()).toHaveLength(1)

      errorLogger.clearLogs()
      expect(errorLogger.getRecentLogs()).toHaveLength(0)
    })
  })

  describe('normalizeError', () => {
    it('should return Error objects as-is', () => {
      const error = new Error('Test')
      errorLogger.log(error)

      const logs = errorLogger.getRecentLogs(1)
      expect(logs[0]?.error).toBe(error)
    })

    it('should handle AppError', () => {
      const appError = new AppError('Network failed', 'NETWORK_ERROR')
      errorLogger.log(appError)

      const logs = errorLogger.getRecentLogs(1)
      expect(logs[0]?.error).toBe(appError)
      expect((logs[0]?.error as AppError).code).toBe('NETWORK_ERROR')
      expect(logs[0]?.error.message).toBe('Network failed')
    })

    it('should convert non-Error to Error', () => {
      errorLogger.log({ custom: 'error' })

      const logs = errorLogger.getRecentLogs(1)
      expect(logs[0]?.error).toBeInstanceOf(Error)
    })

    it('should handle null error', () => {
      errorLogger.log(null)

      const logs = errorLogger.getRecentLogs(1)
      expect(logs[0]?.error).toBeInstanceOf(Error)
    })

    it('should handle undefined error', () => {
      errorLogger.log(undefined)

      const logs = errorLogger.getRecentLogs(1)
      expect(logs[0]?.error).toBeInstanceOf(Error)
    })
  })

  describe('consoleLog', () => {
    it('should format log with context', () => {
      vi.stubEnv('NODE_ENV', 'development')

      const context = { component: 'TestComponent', action: 'testAction' }
      errorLogger.error(new Error('Test'), context)

      expect(console.error).toHaveBeenCalled()

      vi.unstubAllEnvs()
    })
  })
})

describe('useErrorLogger', () => {
  beforeEach(() => {
    errorLogger.clearLogs()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return logging functions', () => {
    const logger = useErrorLogger()

    expect(typeof logger.logError).toBe('function')
    expect(typeof logger.logWarning).toBe('function')
    expect(typeof logger.logInfo).toBe('function')
  })

  it('should log error through logError', () => {
    const logger = useErrorLogger()
    logger.logError(new Error('Test error'), { component: 'Test' })

    const logs = errorLogger.getRecentLogs(1)
    expect(logs[0]?.severity).toBe('error')
  })

  it('should log warning through logWarning', () => {
    const logger = useErrorLogger()
    logger.logWarning(new Error('Warning'), { component: 'Test' })

    const logs = errorLogger.getRecentLogs(1)
    expect(logs[0]?.severity).toBe('warning')
  })

  it('should log info through logInfo', () => {
    const logger = useErrorLogger()
    logger.logInfo('Info message', { component: 'Test' })

    const logs = errorLogger.getRecentLogs(1)
    expect(logs[0]?.severity).toBe('info')
  })
})

describe('withErrorLogging', () => {
  beforeEach(() => {
    errorLogger.clearLogs()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return result on success', async () => {
    const fn = async (x: unknown) => (x as number) * 2
    const wrapped = withErrorLogging(fn)

    const result = await wrapped(5)
    expect(result).toBe(10)
  })

  it('should log error and rethrow on failure', async () => {
    const error = new Error('Test error')
    const fn = async () => {
      throw error
    }
    const wrapped = withErrorLogging(fn, { component: 'Test' })

    await expect(wrapped()).rejects.toThrow('Test error')

    const logs = errorLogger.getRecentLogs(1)
    expect(logs[0]?.error).toBe(error)
    expect(logs[0]?.context).toEqual({ component: 'Test' })
  })

  it('should pass context to error log', async () => {
    const context = { component: 'TestComp', action: 'testAction' }
    const fn = async () => {
      throw new Error('Fail')
    }
    const wrapped = withErrorLogging(fn, context)

    try {
      await wrapped()
    } catch {
      // Expected
    }

    const logs = errorLogger.getRecentLogs(1)
    expect(logs[0]?.context).toEqual(context)
  })

  it('should preserve function arguments', async () => {
    const fn = async (...args: unknown[]) => `${args[1]}-${args[0]}`
    const wrapped = withErrorLogging(fn)

    const result = await wrapped(42, 'test')
    expect(result).toBe('test-42')
  })
})
