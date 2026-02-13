import { describe, it, expect } from 'vitest'
import {
  getHealthStatusStyles,
  getParticipationRateColor,
  getConsensusParticipationColor,
} from './consensus'

describe('getHealthStatusStyles', () => {
  it('should return green styles for excellent status', () => {
    const styles = getHealthStatusStyles('excellent')
    expect(styles.textColor).toBe('text-green-400')
    expect(styles.bgColor).toBe('bg-green-500')
    expect(styles.label).toBe('Excellent')
    expect(styles.icon).toBeTruthy()
  })

  it('should return yellow styles for good status', () => {
    const styles = getHealthStatusStyles('good')
    expect(styles.textColor).toBe('text-yellow-400')
    expect(styles.bgColor).toBe('bg-yellow-500')
    expect(styles.label).toBe('Good')
  })

  it('should return orange styles for fair status', () => {
    const styles = getHealthStatusStyles('fair')
    expect(styles.textColor).toBe('text-orange-400')
    expect(styles.bgColor).toBe('bg-orange-500')
    expect(styles.label).toBe('Fair')
  })

  it('should return red styles for poor status', () => {
    const styles = getHealthStatusStyles('poor')
    expect(styles.textColor).toBe('text-red-400')
    expect(styles.bgColor).toBe('bg-red-500')
    expect(styles.label).toBe('Poor')
  })

  it('should return gray default styles for unknown status', () => {
    const styles = getHealthStatusStyles('unknown')
    expect(styles.textColor).toBe('text-gray-400')
    expect(styles.bgColor).toBe('bg-gray-500')
    expect(styles.label).toBe('Unknown')
  })

  it('should return default styles for empty string', () => {
    const styles = getHealthStatusStyles('')
    expect(styles.label).toBe('Unknown')
  })

  it('should return default styles for arbitrary string', () => {
    const styles = getHealthStatusStyles('something-else')
    expect(styles.label).toBe('Unknown')
  })
})

describe('getParticipationRateColor', () => {
  it('should return green for rate >= 95 (excellent)', () => {
    const result = getParticipationRateColor(95)
    expect(result.text).toBe('text-accent-green')
    expect(result.bg).toBe('bg-accent-green')
  })

  it('should return green for rate = 100', () => {
    const result = getParticipationRateColor(100)
    expect(result.text).toBe('text-accent-green')
  })

  it('should return cyan for rate >= 80 and < 95 (good)', () => {
    const result = getParticipationRateColor(80)
    expect(result.text).toBe('text-accent-cyan')
    expect(result.bg).toBe('bg-accent-cyan')
  })

  it('should return cyan for rate = 94.9', () => {
    const result = getParticipationRateColor(94.9)
    expect(result.text).toBe('text-accent-cyan')
  })

  it('should return yellow for rate >= 67 and < 80 (minimum)', () => {
    const result = getParticipationRateColor(67)
    expect(result.text).toBe('text-yellow-500')
    expect(result.bg).toBe('bg-yellow-500')
  })

  it('should return yellow for rate = 79.9', () => {
    const result = getParticipationRateColor(79.9)
    expect(result.text).toBe('text-yellow-500')
  })

  it('should return red for rate < 67', () => {
    const result = getParticipationRateColor(66.9)
    expect(result.text).toBe('text-accent-red')
    expect(result.bg).toBe('bg-accent-red')
  })

  it('should return red for rate = 0', () => {
    const result = getParticipationRateColor(0)
    expect(result.text).toBe('text-accent-red')
  })

  it('should return red for negative rate', () => {
    const result = getParticipationRateColor(-5)
    expect(result.text).toBe('text-accent-red')
  })
})

describe('getConsensusParticipationColor', () => {
  it('should return green for value >= 75 (warning threshold)', () => {
    expect(getConsensusParticipationColor(75)).toBe('text-accent-green')
  })

  it('should return green for value = 100', () => {
    expect(getConsensusParticipationColor(100)).toBe('text-accent-green')
  })

  it('should return yellow for value >= 66.7 and < 75 (critical threshold)', () => {
    expect(getConsensusParticipationColor(66.7)).toBe('text-yellow-400')
  })

  it('should return yellow for value = 74.9', () => {
    expect(getConsensusParticipationColor(74.9)).toBe('text-yellow-400')
  })

  it('should return red for value < 66.7', () => {
    expect(getConsensusParticipationColor(66.6)).toBe('text-accent-red')
  })

  it('should return red for value = 0', () => {
    expect(getConsensusParticipationColor(0)).toBe('text-accent-red')
  })
})
