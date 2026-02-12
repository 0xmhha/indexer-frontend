import { describe, it, expect, vi, beforeEach } from 'vitest'
import { convertToCSV, convertToJSON, exportData } from '@/lib/utils/export'

// Mock errorLogger
vi.mock('@/lib/errors/logger', () => ({
  errorLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

describe('convertToCSV', () => {
  it('returns empty string for empty array', () => {
    expect(convertToCSV([])).toBe('')
  })

  it('generates header row from first object keys', () => {
    const data = [{ name: 'Alice', age: 30 }]
    const csv = convertToCSV(data)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('name,age')
  })

  it('uses custom headers when provided', () => {
    const data = [{ name: 'Alice', age: 30, email: 'a@b.com' }]
    const csv = convertToCSV(data, ['name', 'email'])
    const lines = csv.split('\n')
    expect(lines[0]).toBe('name,email')
    expect(lines[1]).toBe('Alice,a@b.com')
  })

  it('converts multiple rows correctly', () => {
    const data = [
      { id: 1, value: 'a' },
      { id: 2, value: 'b' },
    ]
    const csv = convertToCSV(data)
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3) // header + 2 data rows
    expect(lines[1]).toBe('1,a')
    expect(lines[2]).toBe('2,b')
  })

  it('escapes values containing commas', () => {
    const data = [{ text: 'hello, world' }]
    const csv = convertToCSV(data)
    expect(csv).toContain('"hello, world"')
  })

  it('escapes values containing double quotes', () => {
    const data = [{ text: 'say "hi"' }]
    const csv = convertToCSV(data)
    expect(csv).toContain('"say ""hi"""')
  })

  it('escapes values containing newlines', () => {
    const data = [{ text: 'line1\nline2' }]
    const csv = convertToCSV(data)
    expect(csv).toContain('"line1\nline2"')
  })

  it('handles null and undefined values as empty strings', () => {
    const data = [{ a: null, b: undefined, c: 'ok' }]
    const csv = convertToCSV(data as Record<string, unknown>[])
    const lines = csv.split('\n')
    expect(lines[1]).toBe(',,ok')
  })

  it('converts non-string values to strings', () => {
    const data = [{ num: 42, bool: true }]
    const csv = convertToCSV(data as Record<string, unknown>[])
    const lines = csv.split('\n')
    expect(lines[1]).toBe('42,true')
  })
})

describe('convertToJSON', () => {
  it('returns pretty-printed JSON', () => {
    const data = [{ id: 1 }]
    const json = convertToJSON(data)
    expect(json).toBe(JSON.stringify(data, null, 2))
  })

  it('handles empty array', () => {
    expect(convertToJSON([])).toBe('[]')
  })

  it('handles nested objects', () => {
    const data = [{ user: { name: 'Alice' } }]
    const json = convertToJSON(data)
    const parsed = JSON.parse(json)
    expect(parsed[0].user.name).toBe('Alice')
  })
})

describe('exportData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('warns and returns early for empty data', async () => {
    const { errorLogger } = await import('@/lib/errors/logger')
    exportData([], 'test', 'csv')
    expect(errorLogger.warn).toHaveBeenCalledWith('No data to export', expect.any(Object))
  })

  it('throws for unsupported format', () => {
    const data = [{ id: 1 }]
    expect(() => exportData(data, 'test', 'xml' as 'csv')).toThrow('Unsupported export format: xml')
  })
})
