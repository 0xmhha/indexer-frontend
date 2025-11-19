import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  withRetry,
  withTimeout,
  withRetryAndTimeout,
  withFallback,
  withParallelFallback,
  CircuitBreaker,
} from './recovery'
import { NetworkError, TimeoutError } from './types'

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await withRetry(fn)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new NetworkError('Fail 1'))
      .mockRejectedValueOnce(new NetworkError('Fail 2'))
      .mockResolvedValue('success')

    const promise = withRetry(fn, { maxRetries: 3, delayMs: 100 })

    // Fast-forward through delays
    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(200)

    const result = await promise
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should throw after max retries', async () => {
    const error = new NetworkError('Persistent failure')
    const fn = vi.fn().mockRejectedValue(error)

    const promise = withRetry(fn, { maxRetries: 2, delayMs: 100 })
    const expectation = expect(promise).rejects.toThrow('Persistent failure')

    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(200)

    await expectation
    expect(fn).toHaveBeenCalledTimes(3) // Initial + 2 retries
  })

  it('should not retry non-retryable errors', async () => {
    const error = new Error('Not retryable')
    const fn = vi.fn().mockRejectedValue(error)

    await expect(withRetry(fn)).rejects.toThrow('Not retryable')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should use exponential backoff', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new NetworkError('Fail 1'))
      .mockRejectedValueOnce(new NetworkError('Fail 2'))
      .mockResolvedValue('success')

    const promise = withRetry(fn, {
      maxRetries: 2,
      delayMs: 1000,
      backoffMultiplier: 2,
    })

    // First retry: 1000ms delay
    await vi.advanceTimersByTimeAsync(1000)
    // Second retry: 2000ms delay (1000 * 2)
    await vi.advanceTimersByTimeAsync(2000)

    const result = await promise
    expect(result).toBe('success')
  })

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn()
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new NetworkError('Fail'))
      .mockResolvedValue('success')

    const promise = withRetry(fn, { maxRetries: 1, delayMs: 100, onRetry })

    await vi.advanceTimersByTimeAsync(100)
    await promise

    expect(onRetry).toHaveBeenCalledWith(expect.any(NetworkError), 1)
  })
})

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return result if completed within timeout', async () => {
    const fn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return 'success'
    }

    const promise = withTimeout(fn, 1000)
    await vi.advanceTimersByTimeAsync(100)

    const result = await promise
    expect(result).toBe('success')
  })

  it('should throw TimeoutError if exceeded', async () => {
    const fn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return 'success'
    }

    const promise = withTimeout(fn, 1000, 'Test operation')
    const timeoutExpectation = expect(promise).rejects.toThrow(TimeoutError)
    const messageExpectation = expect(promise).rejects.toThrow('Operation timed out: Test operation')

    await vi.advanceTimersByTimeAsync(1000)

    await timeoutExpectation
    await messageExpectation
  })
})

describe('withRetryAndTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should combine retry and timeout logic', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new NetworkError('Fail'))
      .mockResolvedValue('success')

    const promise = withRetryAndTimeout(fn, {
      maxRetries: 2,
      delayMs: 100,
      timeoutMs: 5000,
    })

    await vi.advanceTimersByTimeAsync(100)
    const result = await promise
    expect(result).toBe('success')
  })
})

describe('withFallback', () => {
  it('should return result on success', async () => {
    const fn = async () => 'success'
    const result = await withFallback(fn, 'fallback')
    expect(result).toBe('success')
  })

  it('should return fallback value on error', async () => {
    const fn = async () => {
      throw new Error('Failed')
    }
    const result = await withFallback(fn, 'fallback')
    expect(result).toBe('fallback')
  })

  it('should not log error when logError is false', async () => {
    const fn = async () => {
      throw new Error('Failed')
    }
    const result = await withFallback(fn, 'fallback', false)
    expect(result).toBe('fallback')
  })
})

describe('withParallelFallback', () => {
  it('should return first successful result', async () => {
    const fn1 = async () => {
      throw new Error('Fail 1')
    }
    const fn2 = async () => 'success'
    const fn3 = async () => 'also success'

    const result = await withParallelFallback([fn1, fn2, fn3], 'fallback')
    expect(result).toBe('success')
  })

  it('should return fallback if all fail', async () => {
    const fn1 = async () => {
      throw new Error('Fail 1')
    }
    const fn2 = async () => {
      throw new Error('Fail 2')
    }

    const result = await withParallelFallback([fn1, fn2], 'fallback')
    expect(result).toBe('fallback')
  })

  it('should handle empty function array', async () => {
    const result = await withParallelFallback([], 'fallback')
    expect(result).toBe('fallback')
  })
})

describe('CircuitBreaker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow calls in closed state', async () => {
    const breaker = new CircuitBreaker(3, 60000)
    const fn = vi.fn().mockResolvedValue('success')

    const result = await breaker.execute(fn)
    expect(result).toBe('success')
    expect(breaker.getState().state).toBe('closed')
  })

  it('should open circuit after threshold failures', async () => {
    const breaker = new CircuitBreaker(3, 60000)
    const fn = vi.fn().mockRejectedValue(new Error('Failure'))

    // Fail 3 times to reach threshold
    await expect(breaker.execute(fn)).rejects.toThrow('Failure')
    await expect(breaker.execute(fn)).rejects.toThrow('Failure')
    await expect(breaker.execute(fn)).rejects.toThrow('Failure')

    const state = breaker.getState()
    expect(state.state).toBe('open')
    expect(state.failureCount).toBe(3)
  })

  it('should reject calls when circuit is open', async () => {
    const breaker = new CircuitBreaker(2, 60000)
    const fn = vi.fn().mockRejectedValue(new Error('Failure'))

    // Open the circuit
    await expect(breaker.execute(fn)).rejects.toThrow('Failure')
    await expect(breaker.execute(fn)).rejects.toThrow('Failure')

    // Circuit should be open now
    await expect(breaker.execute(fn)).rejects.toThrow('Circuit breaker is open')
    expect(fn).toHaveBeenCalledTimes(2) // Should not call fn when open
  })

  it('should transition to half-open after timeout', async () => {
    const breaker = new CircuitBreaker(2, 60000)
    const fn = vi.fn().mockRejectedValue(new Error('Failure'))

    // Open the circuit
    await expect(breaker.execute(fn)).rejects.toThrow('Failure')
    await expect(breaker.execute(fn)).rejects.toThrow('Failure')

    // Advance time past timeout
    await vi.advanceTimersByTimeAsync(60001)

    // Should transition to half-open
    fn.mockResolvedValueOnce('success')
    const result = await breaker.execute(fn)

    expect(result).toBe('success')
    expect(breaker.getState().state).toBe('closed')
    expect(breaker.getState().failureCount).toBe(0)
  })

  it('should reset on success', async () => {
    const breaker = new CircuitBreaker(3, 60000)
    const fn = vi.fn()

    // Fail once
    fn.mockRejectedValueOnce(new Error('Failure'))
    await expect(breaker.execute(fn)).rejects.toThrow('Failure')

    expect(breaker.getState().failureCount).toBe(1)

    // Succeed
    fn.mockResolvedValueOnce('success')
    await breaker.execute(fn)

    expect(breaker.getState().failureCount).toBe(0)
  })

  it('should allow manual reset', async () => {
    const breaker = new CircuitBreaker(2, 60000)
    const fn = vi.fn().mockRejectedValue(new Error('Failure'))

    // Open the circuit
    await expect(breaker.execute(fn)).rejects.toThrow('Failure')
    await expect(breaker.execute(fn)).rejects.toThrow('Failure')

    expect(breaker.getState().state).toBe('open')

    // Reset manually
    breaker.reset()

    const state = breaker.getState()
    expect(state.state).toBe('closed')
    expect(state.failureCount).toBe(0)
  })
})
