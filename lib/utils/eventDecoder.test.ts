import { describe, it, expect } from 'vitest'
import {
  decodeEventLog,
  getEventName,
  formatDecodedValue,
  isLikelyTokenAmount,
  formatTokenAmount,
} from '@/lib/utils/eventDecoder'

const TRANSFER_SIG = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const APPROVAL_SIG = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
const OWNERSHIP_SIG = '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0'

const padAddress = (addr: string) =>
  '0x' + addr.replace('0x', '').padStart(64, '0')

const padUint256 = (value: bigint) =>
  '0x' + value.toString(16).padStart(64, '0')

describe('decodeEventLog', () => {
  it('decodes an ERC20 Transfer event (3 topics)', () => {
    const from = '0x0000000000000000000000001111111111111111111111111111111111111111'
    const to = '0x0000000000000000000000002222222222222222222222222222222222222222'
    const value = 1000000000000000000n
    const data = padUint256(value).slice(2).padStart(64, '0')

    const result = decodeEventLog(
      [TRANSFER_SIG, from, to],
      `0x${data}`
    )

    expect(result).not.toBeNull()
    expect(result!.eventName).toBe('Transfer')
    expect(result!.eventSignature).toBe('Transfer(address,address,uint256)')
    expect(result!.params).toHaveLength(3)
    expect(result!.params[0]!.name).toBe('from')
    expect(result!.params[0]!.indexed).toBe(true)
    expect(result!.params[1]!.name).toBe('to')
    expect(result!.params[1]!.indexed).toBe(true)
    expect(result!.params[2]!.name).toBe('value')
    expect(result!.params[2]!.indexed).toBe(false)
    expect(result!.params[2]!.value).toBe('1000000000000000000')
  })

  it('decodes an ERC721 Transfer event (4 topics)', () => {
    const from = padAddress('0x1111111111111111111111111111111111111111')
    const to = padAddress('0x2222222222222222222222222222222222222222')
    const tokenId = padUint256(42n)

    const result = decodeEventLog(
      [TRANSFER_SIG, from, to, tokenId],
      '0x'
    )

    expect(result).not.toBeNull()
    expect(result!.eventName).toBe('Transfer')
    expect(result!.params).toHaveLength(3)
    expect(result!.params[2]!.name).toBe('tokenId')
    expect(result!.params[2]!.indexed).toBe(true)
    expect(result!.params[2]!.value).toBe('42')
  })

  it('decodes an Approval event', () => {
    const owner = padAddress('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    const spender = padAddress('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
    const value = 0n
    const data = value.toString(16).padStart(64, '0')

    const result = decodeEventLog(
      [APPROVAL_SIG, owner, spender],
      `0x${data}`
    )

    expect(result).not.toBeNull()
    expect(result!.eventName).toBe('Approval')
    expect(result!.params[0]!.name).toBe('owner')
    expect(result!.params[1]!.name).toBe('spender')
    expect(result!.params[2]!.name).toBe('value')
  })

  it('returns null for an unknown event signature', () => {
    const unknownSig = '0x0000000000000000000000000000000000000000000000000000000000000001'
    const result = decodeEventLog([unknownSig], '0x')
    expect(result).toBeNull()
  })

  it('returns null for empty topics', () => {
    const result = decodeEventLog([], '0x')
    expect(result).toBeNull()
  })
})

describe('getEventName', () => {
  it('returns "Transfer" for the Transfer signature hash', () => {
    expect(getEventName(TRANSFER_SIG)).toBe('Transfer')
  })

  it('returns "Approval" for the Approval signature hash', () => {
    expect(getEventName(APPROVAL_SIG)).toBe('Approval')
  })

  it('returns "OwnershipTransferred" for the OwnershipTransferred signature hash', () => {
    expect(getEventName(OWNERSHIP_SIG)).toBe('OwnershipTransferred')
  })

  it('returns null for an unknown hash', () => {
    expect(getEventName('0xdeadbeef')).toBeNull()
  })

  it('handles uppercase input by normalizing to lowercase', () => {
    const upperSig = TRANSFER_SIG.toUpperCase()
    expect(getEventName(upperSig)).toBe('Transfer')
  })
})

describe('formatDecodedValue', () => {
  it('truncates long addresses', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678'
    const formatted = formatDecodedValue(address, 'address')
    expect(formatted).toBe('0x1234...5678')
  })

  it('returns short addresses as-is', () => {
    const short = '0x12345678'
    const formatted = formatDecodedValue(short, 'address')
    expect(formatted).toBe(short)
  })

  it('formats uint256 values with locale string', () => {
    const result = formatDecodedValue('1000000', 'uint256')
    expect(result).toContain('1')
    expect(result).not.toBe('1000000')
  })

  it('formats int256 values with locale string', () => {
    const result = formatDecodedValue('1000000', 'int256')
    expect(result).toContain('1')
  })

  it('returns raw value for unknown type', () => {
    expect(formatDecodedValue('hello', 'string')).toBe('hello')
  })

  it('returns value unchanged for invalid bigint in uint256', () => {
    expect(formatDecodedValue('not-a-number', 'uint256')).toBe('not-a-number')
  })
})

describe('isLikelyTokenAmount', () => {
  it('returns true for a standard 18-decimal token amount', () => {
    const oneToken = (10n ** 18n).toString()
    expect(isLikelyTokenAmount(oneToken)).toBe(true)
  })

  it('returns true for a large token amount divisible by 10^15', () => {
    const amount = (5000n * 10n ** 18n).toString()
    expect(isLikelyTokenAmount(amount)).toBe(true)
  })

  it('returns false for small numbers', () => {
    expect(isLikelyTokenAmount('42')).toBe(false)
  })

  it('returns false for values not divisible by 10^15', () => {
    const amount = (10n ** 15n + 1n).toString()
    expect(isLikelyTokenAmount(amount)).toBe(false)
  })

  it('returns false for non-numeric strings', () => {
    expect(isLikelyTokenAmount('abc')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isLikelyTokenAmount('')).toBe(false)
  })
})

describe('formatTokenAmount', () => {
  it('formats a whole token amount with default 18 decimals', () => {
    const oneToken = (10n ** 18n).toString()
    const result = formatTokenAmount(oneToken)
    expect(result).toContain('1')
    expect(result).not.toContain('.')
  })

  it('formats a fractional token amount', () => {
    const amount = (15n * 10n ** 17n).toString()
    const result = formatTokenAmount(amount)
    expect(result).toContain('1')
    expect(result).toContain('.')
    expect(result).toContain('5')
  })

  it('formats zero', () => {
    const result = formatTokenAmount('0')
    expect(result).toBe('0')
  })

  it('formats with custom decimals', () => {
    const amount = (1000000n).toString()
    const result = formatTokenAmount(amount, 6)
    expect(result).toContain('1')
  })

  it('returns the raw value for invalid input', () => {
    expect(formatTokenAmount('not-a-number')).toBe('not-a-number')
  })

  it('trims trailing zeros from fractional part', () => {
    const amount = (1500000000000000000n).toString()
    const result = formatTokenAmount(amount)
    expect(result).not.toMatch(/\..*0$/)
  })
})
