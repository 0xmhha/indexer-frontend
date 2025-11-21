import { describe, it, expect } from 'vitest'
import { toBigInt, toNumber, toDate } from './graphql-transforms'

describe('toBigInt', () => {
  it('should convert valid string to BigInt', () => {
    expect(toBigInt('123')).toBe(BigInt(123))
    expect(toBigInt('1000000000000000000')).toBe(BigInt('1000000000000000000'))
  })

  it('should handle null and undefined', () => {
    expect(toBigInt(null)).toBe(BigInt(0))
    expect(toBigInt(undefined)).toBe(BigInt(0))
  })

  it('should handle empty string', () => {
    expect(toBigInt('')).toBe(BigInt(0))
  })

  it('should handle invalid BigInt strings', () => {
    expect(toBigInt('invalid')).toBe(BigInt(0))
    expect(toBigInt('12.34')).toBe(BigInt(0))
  })

  it('should handle zero', () => {
    expect(toBigInt('0')).toBe(BigInt(0))
  })

  it('should handle large numbers', () => {
    const large = '99999999999999999999999999999'
    expect(toBigInt(large)).toBe(BigInt(large))
  })
})

describe('toNumber', () => {
  it('should convert valid string to number', () => {
    expect(toNumber('123')).toBe(123)
    expect(toNumber('456.789')).toBe(456.789)
  })

  it('should handle null and undefined', () => {
    expect(toNumber(null)).toBe(0)
    expect(toNumber(undefined)).toBe(0)
  })

  it('should handle empty string', () => {
    expect(toNumber('')).toBe(0)
  })

  it('should handle invalid number strings', () => {
    expect(toNumber('invalid')).toBe(0)
    expect(toNumber('abc123')).toBe(0)
  })

  it('should handle zero', () => {
    expect(toNumber('0')).toBe(0)
  })

  it('should handle negative numbers', () => {
    expect(toNumber('-123')).toBe(-123)
    expect(toNumber('-456.789')).toBe(-456.789)
  })

  it('should handle scientific notation', () => {
    expect(toNumber('1e5')).toBe(100000)
    expect(toNumber('1.23e-4')).toBe(0.000123)
  })
})

describe('toDate', () => {
  it('should convert timestamp string to Date', () => {
    const timestamp = '1609459200' // 2021-01-01 00:00:00 UTC
    const date = toDate(timestamp)
    expect(date.getTime()).toBe(1609459200000)
  })

  it('should handle null and undefined', () => {
    const date1 = toDate(null)
    const date2 = toDate(undefined)
    expect(date1.getTime()).toBe(0)
    expect(date2.getTime()).toBe(0)
  })

  it('should handle empty string', () => {
    const date = toDate('')
    expect(date.getTime()).toBe(0)
  })

  it('should handle zero timestamp', () => {
    const date = toDate('0')
    expect(date.getTime()).toBe(0)
  })

  it('should handle recent timestamps', () => {
    const now = Math.floor(Date.now() / 1000)
    const date = toDate(now.toString())
    expect(date.getTime()).toBe(now * 1000)
  })

  it('should handle large timestamps', () => {
    const timestamp = '2147483647' // Year 2038 problem boundary
    const date = toDate(timestamp)
    expect(date.getTime()).toBe(2147483647000)
  })
})
