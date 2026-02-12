import { describe, it, expect } from 'vitest'
import {
  calculateEffectiveGasPrice,
  calculateTxCost,
  calculateRefund,
  calculatePriorityFee,
  weiToGwei,
  gweiToWei,
} from '@/lib/utils/gas'

describe('calculateEffectiveGasPrice', () => {
  it('returns actual price when it is less than maxFeePerGas', () => {
    const baseFee = 10n
    const maxFee = 100n
    const priorityFee = 5n
    expect(calculateEffectiveGasPrice(baseFee, maxFee, priorityFee)).toBe(15n)
  })

  it('returns maxFeePerGas when actual price exceeds it', () => {
    const baseFee = 80n
    const maxFee = 50n
    const priorityFee = 30n
    expect(calculateEffectiveGasPrice(baseFee, maxFee, priorityFee)).toBe(50n)
  })

  it('returns maxFeePerGas when actual price equals it', () => {
    const baseFee = 40n
    const maxFee = 50n
    const priorityFee = 10n
    expect(calculateEffectiveGasPrice(baseFee, maxFee, priorityFee)).toBe(50n)
  })

  it('handles zero base fee', () => {
    expect(calculateEffectiveGasPrice(0n, 100n, 5n)).toBe(5n)
  })

  it('handles zero priority fee', () => {
    expect(calculateEffectiveGasPrice(30n, 100n, 0n)).toBe(30n)
  })
})

describe('calculateTxCost', () => {
  it('returns gasUsed multiplied by gasPrice', () => {
    expect(calculateTxCost(21000n, 30000000000n)).toBe(630000000000000n)
  })

  it('returns 0 when gasUsed is zero', () => {
    expect(calculateTxCost(0n, 30000000000n)).toBe(0n)
  })

  it('returns 0 when gasPrice is zero', () => {
    expect(calculateTxCost(21000n, 0n)).toBe(0n)
  })

  it('handles large values', () => {
    const gasUsed = 1000000n
    const gasPrice = 100000000000n
    expect(calculateTxCost(gasUsed, gasPrice)).toBe(100000000000000000n)
  })
})

describe('calculateRefund', () => {
  it('returns correct refund when effectiveGasPrice is less than maxFeePerGas', () => {
    const maxFee = 100n
    const effectivePrice = 60n
    const gasUsed = 21000n
    expect(calculateRefund(maxFee, effectivePrice, gasUsed)).toBe(840000n)
  })

  it('returns 0 when effectiveGasPrice equals maxFeePerGas', () => {
    expect(calculateRefund(100n, 100n, 21000n)).toBe(0n)
  })

  it('returns 0 when effectiveGasPrice exceeds maxFeePerGas', () => {
    expect(calculateRefund(50n, 100n, 21000n)).toBe(0n)
  })

  it('returns 0 when gasUsed is zero', () => {
    expect(calculateRefund(100n, 60n, 0n)).toBe(0n)
  })
})

describe('calculatePriorityFee', () => {
  it('returns correct priority fee when effectiveGasPrice exceeds baseFee', () => {
    const effectivePrice = 50n
    const baseFee = 30n
    const gasUsed = 21000n
    expect(calculatePriorityFee(effectivePrice, baseFee, gasUsed)).toBe(420000n)
  })

  it('returns 0 when effectiveGasPrice equals baseFeePerGas', () => {
    expect(calculatePriorityFee(30n, 30n, 21000n)).toBe(0n)
  })

  it('returns 0 when effectiveGasPrice is less than baseFeePerGas', () => {
    expect(calculatePriorityFee(20n, 30n, 21000n)).toBe(0n)
  })

  it('returns 0 when gasUsed is zero', () => {
    expect(calculatePriorityFee(50n, 30n, 0n)).toBe(0n)
  })
})

describe('weiToGwei', () => {
  it('converts standard wei value to gwei', () => {
    expect(weiToGwei(1000000000n)).toBe(1)
  })

  it('returns 0 for zero wei', () => {
    expect(weiToGwei(0n)).toBe(0)
  })

  it('handles large values', () => {
    expect(weiToGwei(30000000000n)).toBe(30)
  })

  it('handles fractional gwei values', () => {
    expect(weiToGwei(1500000000n)).toBe(1.5)
  })
})

describe('gweiToWei', () => {
  it('converts standard gwei value to wei', () => {
    expect(gweiToWei(1)).toBe(1000000000n)
  })

  it('returns 0n for zero gwei', () => {
    expect(gweiToWei(0)).toBe(0n)
  })

  it('handles fractional gwei', () => {
    expect(gweiToWei(1.5)).toBe(1500000000n)
  })

  it('floors sub-wei fractions', () => {
    expect(gweiToWei(0.0000000001)).toBe(0n)
  })

  it('handles large gwei values', () => {
    expect(gweiToWei(100)).toBe(100000000000n)
  })
})
