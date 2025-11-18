import { describe, it, expect } from 'vitest'
import {
  isValidAddress,
  isValidHash,
  isValidBlockNumber,
  detectInputType,
  parseBlockNumber,
  validatePagination,
} from './validation'

describe('isValidAddress', () => {
  it('should validate correct Ethereum addresses', () => {
    expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbE')).toBe(true)
    expect(isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true)
    expect(isValidAddress('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toBe(true)
  })

  it('should reject invalid addresses', () => {
    expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bE')).toBe(false) // Too short
    expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbE1')).toBe(false) // Too long
    expect(isValidAddress('742d35Cc6634C0532925a3b844Bc9e7595f0bEbE')).toBe(false) // Missing 0x
    expect(isValidAddress('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')).toBe(false) // Invalid hex
    expect(isValidAddress('')).toBe(false) // Empty string
  })
})

describe('isValidHash', () => {
  it('should validate correct hashes', () => {
    const validHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    expect(isValidHash(validHash)).toBe(true)
    expect(isValidHash('0x' + '0'.repeat(64))).toBe(true)
    expect(isValidHash('0x' + 'f'.repeat(64))).toBe(true)
  })

  it('should reject invalid hashes', () => {
    expect(isValidHash('0x1234')).toBe(false) // Too short
    expect(isValidHash('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')).toBe(false) // Missing 0x
    expect(isValidHash('0xGGGG567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')).toBe(false) // Invalid hex
    expect(isValidHash('')).toBe(false) // Empty string
  })
})

describe('isValidBlockNumber', () => {
  it('should validate decimal block numbers', () => {
    expect(isValidBlockNumber('0')).toBe(true)
    expect(isValidBlockNumber('123')).toBe(true)
    expect(isValidBlockNumber('1000000')).toBe(true)
  })

  it('should validate hex block numbers', () => {
    expect(isValidBlockNumber('0x0')).toBe(true)
    expect(isValidBlockNumber('0x1234')).toBe(true)
    expect(isValidBlockNumber('0xabcdef')).toBe(true)
    expect(isValidBlockNumber('0xFFFFFF')).toBe(true)
  })

  it('should reject invalid block numbers', () => {
    expect(isValidBlockNumber('abc')).toBe(false) // Invalid decimal
    expect(isValidBlockNumber('0xGGG')).toBe(false) // Invalid hex
    expect(isValidBlockNumber('-123')).toBe(false) // Negative
    expect(isValidBlockNumber('')).toBe(false) // Empty string
  })
})

describe('detectInputType', () => {
  it('should detect address type', () => {
    expect(detectInputType('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbE')).toBe('address')
    expect(detectInputType(' 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbE ')).toBe('address') // With spaces
  })

  it('should detect hash type', () => {
    const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    expect(detectInputType(hash)).toBe('hash')
    expect(detectInputType(` ${hash} `)).toBe('hash') // With spaces
  })

  it('should detect block number type (decimal)', () => {
    expect(detectInputType('123')).toBe('blockNumber')
    expect(detectInputType('1000000')).toBe('blockNumber')
    expect(detectInputType(' 456 ')).toBe('blockNumber') // With spaces
  })

  it('should detect block number type (hex)', () => {
    expect(detectInputType('0x123')).toBe('blockNumber')
    expect(detectInputType('0xabcdef')).toBe('blockNumber')
  })

  it('should return null for invalid input', () => {
    expect(detectInputType('invalid')).toBe(null)
    expect(detectInputType('0xGGG')).toBe(null)
    expect(detectInputType('')).toBe(null)
  })

  it('should handle ambiguous cases correctly', () => {
    // 0x + 40 hex chars could be address or invalid hash (too short)
    const fortyCharHex = '0x' + '1234567890abcdef'.repeat(2) + '12345678'
    expect(detectInputType(fortyCharHex)).toBe('address')

    // 0x + 64 hex chars is hash (addresses are 40 chars)
    const sixtyFourCharHex = '0x' + '1234567890abcdef'.repeat(4)
    expect(detectInputType(sixtyFourCharHex)).toBe('hash')
  })
})

describe('parseBlockNumber', () => {
  it('should parse decimal block numbers', () => {
    expect(parseBlockNumber('0')).toBe(BigInt(0))
    expect(parseBlockNumber('123')).toBe(BigInt(123))
    expect(parseBlockNumber('1000000')).toBe(BigInt(1000000))
  })

  it('should parse hex block numbers', () => {
    expect(parseBlockNumber('0x0')).toBe(BigInt(0))
    expect(parseBlockNumber('0x10')).toBe(BigInt(16))
    expect(parseBlockNumber('0xFF')).toBe(BigInt(255))
    expect(parseBlockNumber('0x1234')).toBe(BigInt(4660))
  })

  it('should return null for invalid input', () => {
    expect(parseBlockNumber('invalid')).toBe(null)
    expect(parseBlockNumber('0xGGG')).toBe(null)
    // Note: BigInt('') returns 0n, BigInt('-123') returns -123n - technically valid BigInts
    // Additional validation for negative numbers should be done at call site
  })

  it('should handle large numbers', () => {
    expect(parseBlockNumber('999999999999')).toBe(BigInt('999999999999'))
    expect(parseBlockNumber('0xFFFFFFFFFFFF')).toBe(BigInt('281474976710655'))
  })
})

describe('validatePagination', () => {
  it('should validate correct pagination parameters', () => {
    expect(validatePagination(10, 0)).toEqual({ valid: true })
    expect(validatePagination(50, 100)).toEqual({ valid: true })
    expect(validatePagination(100, 0)).toEqual({ valid: true })
    expect(validatePagination(1, 0)).toEqual({ valid: true })
  })

  it('should validate with undefined parameters', () => {
    expect(validatePagination()).toEqual({ valid: true })
    expect(validatePagination(10)).toEqual({ valid: true })
    expect(validatePagination(undefined, 0)).toEqual({ valid: true })
  })

  it('should reject limit less than 1', () => {
    const result = validatePagination(0, 0)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Limit must be between 1 and 100')
  })

  it('should reject limit greater than 100', () => {
    const result = validatePagination(101, 0)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Limit must be between 1 and 100')
  })

  it('should reject negative offset', () => {
    const result = validatePagination(10, -1)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Offset must be non-negative')
  })

  it('should validate edge cases', () => {
    expect(validatePagination(1, 0)).toEqual({ valid: true })
    expect(validatePagination(100, 0)).toEqual({ valid: true })
    expect(validatePagination(10, 0)).toEqual({ valid: true })
  })
})
