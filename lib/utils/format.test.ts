import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatAddress,
  formatHash,
  formatValue,
  formatCurrency,
  formatTimeAgo,
  formatDate,
  formatNumber,
  formatGasPrice,
  formatBytes,
  shortenHex,
} from './format'

describe('formatAddress', () => {
  it('should format full address when short is false', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    expect(formatAddress(address, false)).toBe(address)
  })

  it('should shorten address by default', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    expect(formatAddress(address)).toBe('0x742d...0bEb')
  })

  it('should throw error for invalid address format', () => {
    expect(() => formatAddress('invalid')).toThrow('Invalid address format')
    expect(() => formatAddress('742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toThrow('Invalid address format')
  })

  it('should throw error for empty address', () => {
    expect(() => formatAddress('')).toThrow('Invalid address format')
  })
})

describe('formatHash', () => {
  it('should format full hash when short is false', () => {
    const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    expect(formatHash(hash, false)).toBe(hash)
  })

  it('should shorten hash by default', () => {
    const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    expect(formatHash(hash)).toBe('0x12345678...90abcdef')
  })

  it('should throw error for invalid hash format', () => {
    expect(() => formatHash('invalid')).toThrow('Invalid hash format')
    expect(() => formatHash('1234567890')).toThrow('Invalid hash format')
  })
})

describe('formatValue', () => {
  it('should format BigInt value with 18 decimals', () => {
    const value = BigInt('1000000000000000000') // 1 ETH
    expect(formatValue(value)).toBe('1')
  })

  it('should format BigInt value with fractional part', () => {
    const value = BigInt('1500000000000000000') // 1.5 ETH
    expect(formatValue(value)).toBe('1.5')
  })

  it('should handle string input', () => {
    const value = '2000000000000000000' // 2 ETH
    expect(formatValue(value)).toBe('2')
  })

  it('should handle custom decimals', () => {
    const value = BigInt('1000000') // 1 USDT (6 decimals)
    expect(formatValue(value, 6)).toBe('1')
  })

  it('should trim trailing zeros', () => {
    const value = BigInt('1100000000000000000') // 1.1 ETH
    expect(formatValue(value)).toBe('1.1')
  })

  it('should handle zero value', () => {
    expect(formatValue(BigInt(0))).toBe('0')
  })

  it('should handle very small values', () => {
    const value = BigInt('1') // 0.000000000000000001 ETH
    expect(formatValue(value)).toBe('0.000000000000000001')
  })
})

describe('formatCurrency', () => {
  it('should format value with default symbol', () => {
    const value = BigInt('1000000000000000000')
    expect(formatCurrency(value)).toBe('1 WEMIX')
  })

  it('should format value with custom symbol', () => {
    const value = BigInt('2000000000000000000')
    expect(formatCurrency(value, 'ETH')).toBe('2 ETH')
  })

  it('should handle custom decimals', () => {
    const value = BigInt('1000000')
    expect(formatCurrency(value, 'USDT', 6)).toBe('1 USDT')
  })
})

describe('formatTimeAgo', () => {
  beforeEach(() => {
    // Mock Date.now() to return fixed timestamp
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should format seconds ago', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 30
    expect(formatTimeAgo(timestamp)).toBe('30 seconds ago')
  })

  it('should format minutes ago', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 120
    expect(formatTimeAgo(timestamp)).toBe('2 minutes ago')
  })

  it('should format hours ago', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 7200
    expect(formatTimeAgo(timestamp)).toBe('2 hours ago')
  })

  it('should format days ago', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 172800
    expect(formatTimeAgo(timestamp)).toBe('2 days ago')
  })

  it('should format weeks ago', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 1209600
    expect(formatTimeAgo(timestamp)).toBe('2 weeks ago')
  })

  it('should format months ago', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 5184000
    expect(formatTimeAgo(timestamp)).toBe('2 months ago')
  })

  it('should handle future timestamps', () => {
    const timestamp = Math.floor(Date.now() / 1000) + 100
    expect(formatTimeAgo(timestamp)).toBe('in the future')
  })

  it('should handle BigInt timestamps', () => {
    const timestamp = BigInt(Math.floor(Date.now() / 1000) - 60)
    expect(formatTimeAgo(timestamp)).toBe('1 minutes ago')
  })
})

describe('formatDate', () => {
  it('should format date with time by default', () => {
    const timestamp = 1704110400 // 2024-01-01 12:00:00 UTC
    const formatted = formatDate(timestamp)
    expect(formatted).toContain('Jan')
    expect(formatted).toContain('2024')
  })

  it('should format date without time', () => {
    const timestamp = 1704110400
    const formatted = formatDate(timestamp, false)
    expect(formatted).toContain('Jan')
    expect(formatted).toContain('2024')
    expect(formatted).not.toContain(':')
  })

  it('should handle BigInt timestamp', () => {
    const timestamp = BigInt(1704110400)
    const formatted = formatDate(timestamp)
    expect(formatted).toContain('Jan')
    expect(formatted).toContain('2024')
  })
})

describe('formatNumber', () => {
  it('should format number with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('should handle BigInt', () => {
    expect(formatNumber(BigInt(1000000))).toBe('1,000,000')
  })

  it('should handle small numbers', () => {
    expect(formatNumber(10)).toBe('10')
    expect(formatNumber(100)).toBe('100')
  })

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe('formatGasPrice', () => {
  it('should format gas price in Gwei', () => {
    const gasPrice = BigInt('20000000000') // 20 Gwei
    expect(formatGasPrice(gasPrice)).toBe('20 Gwei')
  })

  it('should handle string input', () => {
    expect(formatGasPrice('50000000000')).toBe('50 Gwei')
  })

  it('should handle fractional Gwei', () => {
    const gasPrice = BigInt('25500000000') // 25.5 Gwei
    expect(formatGasPrice(gasPrice)).toBe('25.5 Gwei')
  })
})

describe('formatBytes', () => {
  it('should format zero bytes', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
  })

  it('should format bytes', () => {
    expect(formatBytes(100)).toBe('100 Bytes')
    expect(formatBytes(512)).toBe('512 Bytes')
  })

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(2048)).toBe('2 KB')
  })

  it('should format megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(5242880)).toBe('5 MB')
  })

  it('should format gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB')
  })

  it('should handle fractional sizes', () => {
    const result = formatBytes(1536) // 1.5 KB
    expect(result).toBe('1.5 KB')
  })
})

describe('shortenHex', () => {
  it('should return original if shorter than max length', () => {
    const data = '0x1234567890'
    expect(shortenHex(data, 20)).toBe(data)
  })

  it('should shorten long hex data', () => {
    const data = '0x1234567890abcdef1234567890abcdef'
    const shortened = shortenHex(data, 20)
    expect(shortened).toContain('...')
    expect(shortened.length).toBeLessThanOrEqual(20)
  })

  it('should use default max length of 20', () => {
    const data = '0x1234567890abcdef1234567890abcdef'
    const shortened = shortenHex(data)
    expect(shortened).toContain('...')
    expect(shortened.length).toBeLessThanOrEqual(20)
  })

  it('should preserve prefix and suffix', () => {
    const data = '0x1234567890abcdef1234567890abcdef'
    const shortened = shortenHex(data, 20)
    expect(shortened).toMatch(/^0x\d+\.\.\..*$/)
  })
})
