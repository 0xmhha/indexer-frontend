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
} from '@/lib/utils/format'

describe('formatAddress', () => {
  it('should format address with short=true (default)', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678'
    expect(formatAddress(address)).toBe('0x1234...5678')
  })

  it('should return full address when short=false', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678'
    expect(formatAddress(address, false)).toBe(address)
  })

  it('should throw error for invalid address', () => {
    expect(() => formatAddress('invalid')).toThrow('Invalid address format')
    expect(() => formatAddress('')).toThrow('Invalid address format')
  })
})

describe('formatHash', () => {
  it('should format hash with short=true (default)', () => {
    const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    expect(formatHash(hash)).toBe('0x12345678...90abcdef')
  })

  it('should return full hash when short=false', () => {
    const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    expect(formatHash(hash, false)).toBe(hash)
  })

  it('should throw error for invalid hash', () => {
    expect(() => formatHash('invalid')).toThrow('Invalid hash format')
    expect(() => formatHash('')).toThrow('Invalid hash format')
  })
})

describe('formatValue', () => {
  it('should format integer value correctly', () => {
    expect(formatValue(BigInt('1000000000000000000'))).toBe('1')
    expect(formatValue(BigInt('5000000000000000000'))).toBe('5')
  })

  it('should format decimal value correctly', () => {
    expect(formatValue(BigInt('1500000000000000000'))).toBe('1.5')
    expect(formatValue(BigInt('123456789000000000'))).toBe('0.123456789')
  })

  it('should handle zero value', () => {
    expect(formatValue(BigInt(0))).toBe('0')
  })

  it('should accept string input', () => {
    expect(formatValue('1000000000000000000')).toBe('1')
  })

  it('should handle custom decimals', () => {
    expect(formatValue(BigInt('1000000000'), 9)).toBe('1')
  })
})

describe('formatCurrency', () => {
  it('should format value with default symbol', () => {
    expect(formatCurrency(BigInt('1000000000000000000'))).toBe('1 WEMIX')
  })

  it('should format value with custom symbol', () => {
    expect(formatCurrency(BigInt('1000000000000000000'), 'ETH')).toBe('1 ETH')
  })
})

describe('formatTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should format seconds ago', () => {
    const timestamp = BigInt(Math.floor(Date.now() / 1000) - 30)
    expect(formatTimeAgo(timestamp)).toBe('30 seconds ago')
  })

  it('should format minutes ago', () => {
    const timestamp = BigInt(Math.floor(Date.now() / 1000) - 300)
    expect(formatTimeAgo(timestamp)).toBe('5 minutes ago')
  })

  it('should format hours ago', () => {
    const timestamp = BigInt(Math.floor(Date.now() / 1000) - 7200)
    expect(formatTimeAgo(timestamp)).toBe('2 hours ago')
  })

  it('should format days ago', () => {
    const timestamp = BigInt(Math.floor(Date.now() / 1000) - 172800)
    expect(formatTimeAgo(timestamp)).toBe('2 days ago')
  })

  it('should handle number input', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 60
    expect(formatTimeAgo(timestamp)).toBe('1 minutes ago')
  })

  it('should handle future timestamp', () => {
    const timestamp = BigInt(Math.floor(Date.now() / 1000) + 1000)
    expect(formatTimeAgo(timestamp)).toBe('in the future')
  })
})

describe('formatDate', () => {
  it('should format date with time', () => {
    const timestamp = 1704067200 // 2024-01-01 00:00:00 UTC
    const result = formatDate(timestamp)
    expect(result).toContain('Jan')
    expect(result).toContain('2024')
  })

  it('should format date without time', () => {
    const timestamp = 1704067200
    const result = formatDate(timestamp, false)
    expect(result).toContain('Jan')
    expect(result).not.toContain(':')
  })

  it('should handle bigint input', () => {
    const timestamp = BigInt(1704067200)
    const result = formatDate(timestamp)
    expect(result).toContain('2024')
  })
})

describe('formatNumber', () => {
  it('should format number with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  it('should handle bigint', () => {
    expect(formatNumber(BigInt(1000000))).toBe('1,000,000')
  })
})

describe('formatGasPrice', () => {
  it('should format gas price to Gwei', () => {
    expect(formatGasPrice(BigInt('1000000000'))).toBe('1 Gwei')
    expect(formatGasPrice(BigInt('20000000000'))).toBe('20 Gwei')
  })

  it('should handle string input', () => {
    expect(formatGasPrice('5000000000')).toBe('5 Gwei')
  })
})

describe('formatBytes', () => {
  it('should format zero bytes', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
  })

  it('should format bytes', () => {
    expect(formatBytes(500)).toBe('500 Bytes')
  })

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(2048)).toBe('2 KB')
  })

  it('should format megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB')
  })

  it('should format gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB')
  })
})

describe('shortenHex', () => {
  it('should return full string if shorter than maxLength', () => {
    expect(shortenHex('0x1234', 20)).toBe('0x1234')
  })

  it('should shorten string if longer than maxLength', () => {
    const data = '0x1234567890abcdef1234567890abcdef'
    const result = shortenHex(data, 20)
    expect(result.length).toBeLessThanOrEqual(20)
    expect(result).toContain('...')
  })
})
