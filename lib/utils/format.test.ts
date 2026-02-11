import { describe, it, expect } from 'vitest'
import {
  formatAddress,
  formatHash,
  formatValue,
  formatCurrency,
  formatTimeAgo,
  formatDate,
  formatDateTime,
  truncateAddress,
  formatNumber,
  formatGasPrice,
  formatBytes,
  shortenHex,
} from './format'

describe('formatAddress', () => {
  it('should format valid address with default short option', () => {
    const address = '0x1234567890123456789012345678901234567890'
    expect(formatAddress(address)).toBe('0x1234...7890')
  })

  it('should return full address when short is false', () => {
    const address = '0x1234567890123456789012345678901234567890'
    expect(formatAddress(address, false)).toBe(address)
  })

  it('should throw error for invalid address format', () => {
    expect(() => formatAddress('invalid')).toThrow('Invalid address format')
    expect(() => formatAddress('')).toThrow('Invalid address format')
  })

  it('should throw error for address without 0x prefix', () => {
    expect(() => formatAddress('1234567890123456789012345678901234567890')).toThrow('Invalid address format')
  })
})

describe('formatHash', () => {
  it('should format valid hash with default short option', () => {
    const hash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    expect(formatHash(hash)).toBe('0xabcdef12...34567890')
  })

  it('should return full hash when short is false', () => {
    const hash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    expect(formatHash(hash, false)).toBe(hash)
  })

  it('should throw error for invalid hash format', () => {
    expect(() => formatHash('invalid')).toThrow('Invalid hash format')
    expect(() => formatHash('')).toThrow('Invalid hash format')
  })
})

describe('formatValue', () => {
  it('should format bigint value with default 18 decimals', () => {
    const value = BigInt('1000000000000000000') // 1 ETH in wei
    expect(formatValue(value)).toBe('1')
  })

  it('should format bigint value with fractional part', () => {
    const value = BigInt('1500000000000000000') // 1.5 ETH
    expect(formatValue(value)).toBe('1.5')
  })

  it('should format string value', () => {
    const value = '2500000000000000000' // 2.5 ETH
    expect(formatValue(value)).toBe('2.5')
  })

  it('should handle custom decimals', () => {
    const value = BigInt('1000000') // 1 USDC (6 decimals)
    expect(formatValue(value, 6)).toBe('1')
  })

  it('should remove trailing zeros', () => {
    const value = BigInt('1230000000000000000') // 1.23 ETH
    expect(formatValue(value)).toBe('1.23')
  })

  it('should handle zero value', () => {
    const value = BigInt('0')
    expect(formatValue(value)).toBe('0')
  })

  it('should handle very small fractions', () => {
    const value = BigInt('1') // 0.000000000000000001 ETH
    expect(formatValue(value)).toBe('0.000000000000000001')
  })
})

describe('formatCurrency', () => {
  it('should format value with default WKRC symbol', () => {
    const value = BigInt('1000000000000000000')
    expect(formatCurrency(value)).toBe('1 WKRC')
  })

  it('should format value with custom symbol', () => {
    const value = BigInt('2500000000000000000')
    expect(formatCurrency(value, 'ETH')).toBe('2.5 ETH')
  })

  it('should handle custom decimals', () => {
    const value = BigInt('1000000')
    expect(formatCurrency(value, 'USDC', 6)).toBe('1 USDC')
  })
})

describe('formatTimeAgo', () => {
  it('should format seconds ago', () => {
    const now = Math.floor(Date.now() / 1000)
    const timestamp = now - 30
    expect(formatTimeAgo(timestamp)).toBe('30 seconds ago')
  })

  it('should format minutes ago', () => {
    const now = Math.floor(Date.now() / 1000)
    const timestamp = now - 120 // 2 minutes
    expect(formatTimeAgo(timestamp)).toBe('2 minutes ago')
  })

  it('should format hours ago', () => {
    const now = Math.floor(Date.now() / 1000)
    const timestamp = now - 7200 // 2 hours
    expect(formatTimeAgo(timestamp)).toBe('2 hours ago')
  })

  it('should format days ago', () => {
    const now = Math.floor(Date.now() / 1000)
    const timestamp = now - 172800 // 2 days
    expect(formatTimeAgo(timestamp)).toBe('2 days ago')
  })

  it('should format weeks ago', () => {
    const now = Math.floor(Date.now() / 1000)
    const timestamp = now - 1209600 // 2 weeks
    expect(formatTimeAgo(timestamp)).toBe('2 weeks ago')
  })

  it('should format months ago', () => {
    const now = Math.floor(Date.now() / 1000)
    const timestamp = now - 5184000 // ~2 months
    expect(formatTimeAgo(timestamp)).toBe('2 months ago')
  })

  it('should handle future timestamps', () => {
    const now = Math.floor(Date.now() / 1000)
    const timestamp = now + 100
    expect(formatTimeAgo(timestamp)).toBe('in the future')
  })

  it('should handle bigint timestamp', () => {
    const now = BigInt(Math.floor(Date.now() / 1000))
    const timestamp = now - BigInt(60)
    expect(formatTimeAgo(timestamp)).toBe('1 minutes ago')
  })
})

describe('formatDate', () => {
  it('should format date with time by default', () => {
    const timestamp = 1609459200 // 2021-01-01 00:00:00 UTC
    const result = formatDate(timestamp)
    expect(result).toContain('2021')
    expect(result).toContain(':')
  })

  it('should format date without time when specified', () => {
    const timestamp = 1609459200
    const result = formatDate(timestamp, false)
    expect(result).toContain('2021')
    expect(result).not.toContain(':')
  })

  it('should handle bigint timestamp', () => {
    const timestamp = BigInt(1609459200)
    const result = formatDate(timestamp)
    expect(result).toContain('2021')
  })
})

describe('formatDateTime', () => {
  it('should format number timestamp', () => {
    const timestamp = 1609459200
    const result = formatDateTime(timestamp)
    expect(result).toContain('2021')
    expect(result).toContain(':')
  })

  it('should format bigint timestamp', () => {
    const timestamp = BigInt(1609459200)
    const result = formatDateTime(timestamp)
    expect(result).toContain('2021')
  })

  it('should format ISO string', () => {
    const isoString = '2021-01-01T00:00:00.000Z'
    const result = formatDateTime(isoString)
    expect(result).toContain('2021')
    expect(result).toContain(':')
  })
})

describe('truncateAddress', () => {
  it('should be an alias for formatAddress with short=true', () => {
    const address = '0x1234567890123456789012345678901234567890'
    expect(truncateAddress(address)).toBe(formatAddress(address, true))
  })
})

describe('formatNumber', () => {
  it('should format number with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  it('should format bigint with thousand separators', () => {
    expect(formatNumber(BigInt(1000))).toBe('1,000')
    expect(formatNumber(BigInt(1000000))).toBe('1,000,000')
  })

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('should handle small numbers', () => {
    expect(formatNumber(999)).toBe('999')
  })
})

describe('formatGasPrice', () => {
  it('should format gas price from wei to Gwei', () => {
    const gasPrice = BigInt('1000000000') // 1 Gwei
    expect(formatGasPrice(gasPrice)).toBe('1 Gwei')
  })

  it('should format gas price with decimals', () => {
    const gasPrice = BigInt('1500000000') // 1.5 Gwei
    expect(formatGasPrice(gasPrice)).toBe('1.5 Gwei')
  })

  it('should handle string input', () => {
    const gasPrice = '2000000000' // 2 Gwei
    expect(formatGasPrice(gasPrice)).toBe('2 Gwei')
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

  it('should format with decimals', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })
})

describe('shortenHex', () => {
  it('should return original string if shorter than maxLength', () => {
    const data = '0x1234'
    expect(shortenHex(data)).toBe('0x1234')
  })

  it('should shorten long hex string with default maxLength', () => {
    const data = '0x1234567890123456789012345678901234567890'
    const result = shortenHex(data)
    expect(result.length).toBeLessThan(data.length)
    expect(result).toContain('...')
  })

  it('should shorten with custom maxLength', () => {
    const data = '0x1234567890123456789012345678901234567890'
    const result = shortenHex(data, 10)
    expect(result).toContain('...')
    expect(result.length).toBe(10)
  })

  it('should preserve start and end of hex string', () => {
    const data = '0xabcdefghijklmnopqrstuvwxyz'
    const result = shortenHex(data, 10)
    expect(result.startsWith('0xabc')).toBe(true)
    expect(result.endsWith('yz')).toBe(true)
    expect(result).toBe('0xabc...yz')
  })
})
